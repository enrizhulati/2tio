'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useFlowStore } from '@/store/flowStore';
import { Button, Input, HomeConfirmationModal } from '@/components/ui';
import { AddressAutocomplete, type AddressResult } from '@/components/ui/AddressAutocomplete';
import { ChevronRight, Building2, AlertCircle, Check } from 'lucide-react';
import type { ESIID } from '@/types/flow';

// Loading messages that rotate during API calls
const LOADING_MESSAGES = [
  'Finding your address...',
  'Looking up your meter ID...',
  'Getting home details...',
  'Calculating available plans...',
];

// Minimum display time for loading state (milliseconds)
const MIN_LOADING_TIME = 3500;

// Message rotation interval (milliseconds)
const MESSAGE_ROTATION_INTERVAL = 800;

function Step1Address() {
  const {
    address,
    moveInDate,
    availableServices,
    availabilityChecked,
    homeDetails,
    esiidMatches,
    selectedEsiid,
    esiidSearchComplete,
    esiidConfirmed,
    isLoadingElectricity,
    setAddress,
    setMoveInDate,
    checkAvailability,
    fetchESIIDs,
    selectESIID,
    confirmEsiid,
    nextStep,
  } = useFlowStore();

  // Local form state - includes ESIID from ERCOT search
  const [selectedAddress, setSelectedAddress] = useState<AddressResult | null>(
    address ? {
      street: address.street,
      city: address.city,
      state: address.state,
      zip: address.zip,
      formatted: address.formatted || '',
      unit: address.unit,
      esiid: address.esiid,
    } : null
  );

  // Default to 2 weeks from now - helps iOS Safari show a visible date
  const getDefaultDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  };
  const [date, setDate] = useState(moveInDate || getDefaultDate());
  const [errors, setErrors] = useState<{ address?: string; date?: string }>({});

  // Loading modal state
  const [isLoadingModal, setIsLoadingModal] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
  const loadingStartTime = useRef<number | null>(null);

  // Message rotation effect
  useEffect(() => {
    if (!isLoadingModal) {
      setLoadingMessage(LOADING_MESSAGES[0]);
      return;
    }

    let messageIndex = 0;
    const interval = setInterval(() => {
      messageIndex = (messageIndex + 1) % LOADING_MESSAGES.length;
      setLoadingMessage(LOADING_MESSAGES[messageIndex]);
    }, MESSAGE_ROTATION_INTERVAL);

    return () => clearInterval(interval);
  }, [isLoadingModal]);

  // Modal state - show when loading OR when address is confirmed
  const showConfirmationModal = isLoadingModal || !!(availabilityChecked && availableServices && address && (esiidConfirmed || esiidMatches.length === 1));

  const handleAddressSelect = useCallback((addr: AddressResult) => {
    setSelectedAddress(addr);
    setErrors((prev) => ({ ...prev, address: undefined }));
  }, []);

  // Helper to ensure minimum loading time
  const ensureMinLoadingTime = async () => {
    if (loadingStartTime.current) {
      const elapsed = Date.now() - loadingStartTime.current;
      if (elapsed < MIN_LOADING_TIME) {
        await new Promise(r => setTimeout(r, MIN_LOADING_TIME - elapsed));
      }
    }
  };

  const validateAndCheck = useCallback(async () => {
    const newErrors: { address?: string; date?: string } = {};

    if (!selectedAddress) {
      newErrors.address = 'Select an address from the suggestions';
    }

    if (!date) {
      newErrors.date = 'Choose your move-in date';
    } else {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.date = 'Choose a date that\'s today or later';
      }

      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() + 90);
      if (selectedDate > maxDate) {
        newErrors.date = 'Choose a date within the next 90 days';
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0 && selectedAddress) {
      // Show loading modal IMMEDIATELY
      loadingStartTime.current = Date.now();
      setIsLoadingModal(true);

      try {
        // Use detected unit from address autocomplete (extracted from ERCOT address)
        const detectedUnit = selectedAddress.unit;

        const finalAddress = {
          street: selectedAddress.street,
          unit: detectedUnit || undefined,
          city: selectedAddress.city,
          state: selectedAddress.state,
          zip: selectedAddress.zip,
          formatted: detectedUnit
            ? `${selectedAddress.street}, ${detectedUnit}, ${selectedAddress.city}, ${selectedAddress.state} ${selectedAddress.zip}`
            : selectedAddress.formatted,
          esiid: selectedAddress.esiid,
        };

        setAddress(finalAddress);
        setMoveInDate(date);

        // If we have ESIID from address search, use it directly
        if (selectedAddress.esiid) {
          useFlowStore.setState({
            selectedEsiid: {
              _id: selectedAddress.esiid,
              esiid: selectedAddress.esiid,
              address: `${selectedAddress.street}${detectedUnit ? ` APT ${detectedUnit}` : ''}`.toUpperCase(),
              address_overflow: '',
              city: selectedAddress.city.toUpperCase(),
              state: selectedAddress.state,
              zip_code: selectedAddress.zip,
              premise_type: 'Residential',
              status: 'Active',
              power_region: 'ERCOT',
              station_name: '',
              duns: '',
            },
            esiidMatches: [{
              _id: selectedAddress.esiid,
              esiid: selectedAddress.esiid,
              address: `${selectedAddress.street}${detectedUnit ? ` APT ${detectedUnit}` : ''}`.toUpperCase(),
              address_overflow: '',
              city: selectedAddress.city.toUpperCase(),
              state: selectedAddress.state,
              zip_code: selectedAddress.zip,
              premise_type: 'Residential',
              status: 'Active',
              power_region: 'ERCOT',
              station_name: '',
              duns: '',
            }],
            esiidSearchComplete: true,
            esiidConfirmed: true,
          });

          await useFlowStore.getState().fetchUsageProfile();
          await checkAvailability();
        } else {
          // No ESIID from search - fall back to searching by address
          const searchAddress = detectedUnit
            ? `${selectedAddress.street} APT ${detectedUnit.replace(/\D/g, '')}`
            : selectedAddress.street;
          await Promise.all([
            checkAvailability(),
            fetchESIIDs(searchAddress, selectedAddress.zip, detectedUnit),
          ]);
        }

        // Ensure minimum loading time for smooth UX
        await ensureMinLoadingTime();
      } catch (error) {
        console.error('Error checking availability:', error);
      } finally {
        setIsLoadingModal(false);
        loadingStartTime.current = null;
      }
    }
  }, [selectedAddress, date, setAddress, setMoveInDate, checkAvailability, fetchESIIDs]);

  const handleEdit = () => {
    setSelectedAddress(null);
    setDate(getDefaultDate());
    setErrors({});
    setIsLoadingModal(false);

    useFlowStore.setState({
      availabilityChecked: false,
      availableServices: null,
      address: null,
      moveInDate: null,
      esiidMatches: [],
      selectedEsiid: null,
      esiidSearchComplete: false,
      esiidConfirmed: false,
      usageProfile: null,
      homeDetails: null,
    });
  };

  const handleModalConfirm = async () => {
    // Just proceed to next step - services page
    nextStep();
  };

  // Handle ESIID confirmation with loading modal
  const handleEsiidConfirm = async () => {
    loadingStartTime.current = Date.now();
    setIsLoadingModal(true);
    setLoadingMessage('Verifying your address...');

    try {
      await confirmEsiid();
      await ensureMinLoadingTime();
    } finally {
      setIsLoadingModal(false);
      loadingStartTime.current = null;
    }
  };

  // Show ESIID selection when multiple addresses found (and not currently loading)
  if (esiidSearchComplete && !esiidConfirmed && address && esiidMatches.length > 1 && !isLoadingModal) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-[32px] sm:text-[44px] font-bold text-[var(--color-darkest)] leading-[1.15] tracking-tight mb-3">
            Which unit is yours?
          </h1>
          <p className="text-[18px] text-[var(--color-dark)]">
            We found {esiidMatches.length} units at this building.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[var(--color-lightest)] border border-[var(--color-light)]">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[var(--color-dark)]" aria-hidden="true" />
            <span className="text-[16px] text-[var(--color-dark)]">
              {address.street}, {address.city}, {address.state} {address.zip}
            </span>
          </div>
        </div>

        <div className="space-y-3" role="radiogroup" aria-label="Select your address">
          {esiidMatches.map((esiid: ESIID) => {
            const isSelected = selectedEsiid?.esiid === esiid.esiid;
            const isActive = esiid.status?.toUpperCase() === 'ACTIVE';

            return (
              <button
                key={esiid.esiid}
                onClick={() => selectESIID(esiid)}
                disabled={!isActive}
                role="radio"
                aria-checked={isSelected}
                aria-disabled={!isActive}
                className={`
                  w-full text-left p-4 rounded-xl border-2 transition-all
                  focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)] focus:ring-offset-2
                  ${isSelected
                    ? 'border-[var(--color-teal)] bg-[var(--color-teal-light)]'
                    : isActive
                    ? 'border-[var(--color-light)] bg-white hover:border-[var(--color-medium)]'
                    : 'border-[var(--color-light)] bg-[var(--color-lightest)] opacity-60 cursor-not-allowed'
                  }
                `}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-[16px] font-semibold text-[var(--color-darkest)]">
                      {esiid.address}
                      {esiid.address_overflow && ` ${esiid.address_overflow}`}
                    </p>
                    <p className="text-[16px] text-[var(--color-dark)] mt-1">
                      {esiid.city}, {esiid.state} {esiid.zip_code}
                    </p>
                    <p className="text-[16px] text-[var(--color-dark)] mt-1">
                      {esiid.premise_type}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-[var(--color-teal)] flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" aria-hidden="true" />
                      </div>
                    )}
                    {!isActive && (
                      <div className="text-right">
                        <span className="text-[16px] text-[var(--color-coral)] font-medium">
                          No power service
                        </span>
                        <p className="text-[16px] text-[var(--color-dark)] mt-0.5">
                          Contact your landlord
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleEdit}
          className="w-full text-center text-[16px] text-[var(--color-dark)] hover:text-[var(--color-darkest)] underline"
        >
          None of these are my address
        </button>

        <Button
          onClick={handleEsiidConfirm}
          disabled={!selectedEsiid || isLoadingElectricity}
          fullWidth
          size="large"
          colorScheme="coral"
          rightIcon={<ChevronRight className="w-5 h-5" />}
        >
          Confirm this address
        </Button>

        {/* Loading modal for ESIID confirmation */}
        {address && moveInDate && (
          <HomeConfirmationModal
            isOpen={isLoadingModal}
            isLoading={isLoadingModal}
            loadingMessage={loadingMessage}
            onConfirm={handleModalConfirm}
            onChangeAddress={handleEdit}
            address={address}
            moveInDate={moveInDate}
            homeDetails={homeDetails || undefined}
          />
        )}
      </div>
    );
  }

  // Show error if no ESIIDs found
  if (esiidSearchComplete && esiidMatches.length === 0 && address && !isLoadingModal) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-coral-light)] flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-[var(--color-coral)]" aria-hidden="true" />
          </div>
          <h1 className="text-[28px] sm:text-[35px] font-bold text-[var(--color-darkest)] leading-[1.2] tracking-tight mb-3">
            We couldn't find this address
          </h1>
          <p className="text-[18px] text-[var(--color-dark)]">
            No electric meter is registered here yet — but we can help.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[var(--color-lightest)] border border-[var(--color-light)]">
          <p className="text-[16px] text-[var(--color-dark)]">
            <strong>You entered:</strong> {address.formatted}
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-[16px] font-medium text-[var(--color-darkest)]">
            This usually happens when:
          </p>
          <ul className="space-y-2 text-[16px] text-[var(--color-dark)] list-disc list-inside">
            <li>The property is newly built and not yet in the system</li>
            <li>The unit number needs to be included (e.g., Apt 4B)</li>
            <li>There&apos;s a slight difference in how the address is registered</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleEdit}
            fullWidth
            size="large"
            colorScheme="coral"
          >
            Try a different address
          </Button>

          <div className="text-center">
            <p className="text-[16px] text-[var(--color-dark)]">
              Need help? <a href="tel:1-800-555-0123" className="text-[var(--color-teal)] underline font-medium">Call us</a> or <a href="#" className="text-[var(--color-teal)] underline font-medium">start a chat</a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show address form (always visible, with modal overlay when loading/confirmed)
  return (
    <>
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-[32px] sm:text-[44px] font-bold text-[var(--color-darkest)] leading-[1.15] tracking-tight mb-3">
            Where are you moving?
          </h1>
          <p className="text-[18px] text-[var(--color-dark)]">
            Enter your new address and we'll check what's available. Takes 30 seconds.
          </p>
        </div>

        <div className="space-y-6">
          <AddressAutocomplete
            onSelect={handleAddressSelect}
            error={errors.address}
            disabled={isLoadingModal}
          />

          {selectedAddress && (
            <div className="p-4 rounded-xl bg-[var(--color-teal-light)] border-2 border-[var(--color-teal)]">
              <p className="text-[16px] font-medium text-[var(--color-teal)]">Address selected:</p>
              <p className="text-[16px] text-[var(--color-darkest)] mt-1">
                {selectedAddress.street}
                {selectedAddress.unit && `, Apt ${selectedAddress.unit}`}
              </p>
              <p className="text-[16px] text-[var(--color-dark)] mt-0.5">
                {selectedAddress.city}, {selectedAddress.state} {selectedAddress.zip}
              </p>
            </div>
          )}

          <Input
            label="Move-in date"
            hint="Book up to 90 days ahead"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            error={errors.date}
            disabled={isLoadingModal}
            min={new Date().toISOString().split('T')[0]}
            max={new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
          />
        </div>

        <Button
          onClick={validateAndCheck}
          disabled={isLoadingModal}
          fullWidth
          size="large"
          colorScheme="coral"
        >
          Check availability
        </Button>
      </div>

      {/* Home confirmation modal - shows during loading AND after confirmation */}
      {(selectedAddress || address) && (date || moveInDate) && (
        <HomeConfirmationModal
          isOpen={showConfirmationModal}
          isLoading={isLoadingModal}
          loadingMessage={loadingMessage}
          onConfirm={handleModalConfirm}
          onChangeAddress={handleEdit}
          address={address || {
            street: selectedAddress!.street,
            unit: selectedAddress!.unit,
            city: selectedAddress!.city,
            state: selectedAddress!.state,
            zip: selectedAddress!.zip,
          }}
          moveInDate={moveInDate || date}
          homeDetails={homeDetails || undefined}
        />
      )}
    </>
  );
}

export { Step1Address };
