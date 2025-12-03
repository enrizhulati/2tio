'use client';

import { useState, useCallback } from 'react';
import { useFlowStore } from '@/store/flowStore';
import { Button, Input, ServiceIcon } from '@/components/ui';
import { AddressAutocomplete, type AddressResult } from '@/components/ui/AddressAutocomplete';
import { MapPin, ChevronRight, Edit2, Navigation, Home, Building2, AlertCircle, Check } from 'lucide-react';
import type { ESIID } from '@/types/flow';
import { SERVICE_INFO } from '@/types/flow';

// Format number with commas (e.g., 1234 -> "1,234")
const formatNumber = (num: number): string => num.toLocaleString();

// Map preview component
function MapPreview({ address }: { address: string }) {
  return (
    <div className="relative rounded-xl overflow-hidden bg-[var(--color-lightest)] h-48">
      {/* Map placeholder with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#E8F4F8] to-[#D4E8ED]">
        {/* Grid pattern for map feel */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(var(--color-medium) 1px, transparent 1px),
              linear-gradient(90deg, var(--color-medium) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />

        {/* Roads */}
        <div className="absolute top-1/2 left-0 right-0 h-3 bg-white opacity-60" />
        <div className="absolute top-0 bottom-0 left-1/3 w-2 bg-white opacity-40" />
        <div className="absolute top-0 bottom-0 right-1/4 w-3 bg-white opacity-60" />

        {/* Location marker */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
          <div className="relative">
            <div className="w-10 h-10 bg-[var(--color-coral)] rounded-full flex items-center justify-center shadow-lg">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-[var(--color-coral)] rotate-45" />
          </div>
        </div>

        {/* Pulse animation */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-16 h-16 rounded-full bg-[var(--color-coral)] opacity-20 animate-ping" />
        </div>
      </div>

      {/* Address badge */}
      <div className="absolute bottom-3 left-3 right-3">
        <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm flex items-center gap-2">
          <Navigation className="w-4 h-4 text-[var(--color-coral)]" />
          <span className="text-[14px] text-[var(--color-darkest)] truncate">
            {address}
          </span>
        </div>
      </div>
    </div>
  );
}

function Step1Address() {
  const {
    address,
    moveInDate,
    availableServices,
    isCheckingAvailability,
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
  const [date, setDate] = useState(moveInDate || '');
  const [errors, setErrors] = useState<{ address?: string; date?: string }>({});

  const handleAddressSelect = useCallback((addr: AddressResult) => {
    setSelectedAddress(addr);
    setErrors((prev) => ({ ...prev, address: undefined }));
  }, []);

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
        esiid: selectedAddress.esiid, // Include ESIID from ERCOT search
      };

      setAddress(finalAddress);
      setMoveInDate(date);

      // If we have ESIID from address search, use it directly
      // Otherwise, fall back to searching by address
      if (selectedAddress.esiid) {
        // ESIID already known from ERCOT search - skip ESIID lookup
        // Just fetch usage profile and check availability
        await Promise.all([
          checkAvailability(),
          // Set the ESIID directly in the store
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
          }),
        ]);
        // Fetch usage profile for the ESIID
        useFlowStore.getState().fetchUsageProfile();
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
    }
  }, [selectedAddress, date, setAddress, setMoveInDate, checkAvailability, fetchESIIDs]);

  const handleEdit = () => {
    // Reset local form state to allow fresh input
    setSelectedAddress(null);
    setDate('');
    setErrors({});

    // Reset store state including electricity data
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

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Show ESIID selection when multiple addresses found
  if (esiidSearchComplete && !esiidConfirmed && address && esiidMatches.length > 1) {
    return (
      <div className="space-y-8">
        {/* Heading */}
        <div className="text-center">
          <h1 className="text-[44px] font-bold text-[var(--color-darkest)] leading-tight mb-3">
            Confirm your address
          </h1>
          <p className="text-[18px] text-[var(--color-dark)]">
            We found {esiidMatches.length} units at this location. Select yours to continue.
          </p>
        </div>

        {/* Building info */}
        <div className="p-4 rounded-xl bg-[var(--color-lightest)] border border-[var(--color-light)]">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[var(--color-dark)]" />
            <span className="text-[15px] text-[var(--color-dark)]">
              {address.street}, {address.city}, {address.state} {address.zip}
            </span>
          </div>
        </div>

        {/* ESIID list */}
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
                    <p className="text-[14px] text-[var(--color-dark)] mt-1">
                      {esiid.city}, {esiid.state} {esiid.zip_code}
                    </p>
                    <p className="text-[14px] text-[var(--color-medium)] mt-1">
                      {esiid.premise_type}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-[var(--color-teal)] flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                    {!isActive && (
                      <div className="text-right">
                        <span className="text-[14px] text-[var(--color-coral)] font-medium">
                          No power service
                        </span>
                        <p className="text-[14px] text-[var(--color-medium)] mt-0.5">
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

        {/* None of these option */}
        <button
          onClick={handleEdit}
          className="w-full text-center text-[14px] text-[var(--color-dark)] hover:text-[var(--color-darkest)] underline"
        >
          None of these are my address
        </button>

        {/* Confirm button */}
        <Button
          onClick={confirmEsiid}
          disabled={!selectedEsiid}
          isLoading={isLoadingElectricity}
          loadingText="Verifying address..."
          fullWidth
          size="large"
          colorScheme="coral"
          rightIcon={<ChevronRight className="w-5 h-5" />}
        >
          Confirm this address
        </Button>
      </div>
    );
  }

  // Show error if no ESIIDs found
  if (esiidSearchComplete && esiidMatches.length === 0 && address) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-coral-light)] flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-[var(--color-coral)]" />
          </div>
          <h1 className="text-[36px] font-bold text-[var(--color-darkest)] leading-tight mb-3">
            We couldn't verify this address
          </h1>
          <p className="text-[18px] text-[var(--color-dark)]">
            We couldn't find an electric meter registered at this address yet.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[var(--color-lightest)] border border-[var(--color-light)]">
          <p className="text-[15px] text-[var(--color-dark)]">
            <strong>You entered:</strong> {address.formatted}
          </p>
        </div>

        {/* Common reasons */}
        <div className="space-y-3">
          <p className="text-[15px] font-medium text-[var(--color-darkest)]">
            This usually happens when:
          </p>
          <ul className="space-y-2 text-[15px] text-[var(--color-dark)]">
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-teal)] mt-0.5">•</span>
              The property is newly built and not yet in the system
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-teal)] mt-0.5">•</span>
              The unit number needs to be included (e.g., Apt 4B)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-teal)] mt-0.5">•</span>
              There's a slight difference in how the address is registered
            </li>
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
            <p className="text-[14px] text-[var(--color-dark)]">
              Need help? <a href="tel:1-800-555-0123" className="text-[var(--color-teal)] underline font-medium">Call us</a> or <a href="#" className="text-[var(--color-teal)] underline font-medium">start a chat</a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show availability results (after ESIID is confirmed or auto-selected)
  if (availabilityChecked && availableServices && address && (esiidConfirmed || esiidMatches.length === 1)) {
    return (
      <div className="space-y-8">
        {/* Success heading */}
        <div className="text-center">
          <h1 className="text-[44px] font-bold text-[var(--color-darkest)] leading-tight mb-3">
            Great news!
          </h1>
          <p className="text-[18px] text-[var(--color-dark)]">
            We can set up utilities for your new home.
          </p>
        </div>

        {/* Home details banner - show if Zillow data was found (optional enhancement) */}
        {homeDetails?.foundDetails && (
          <div className="p-5 rounded-xl bg-[var(--color-teal-light)] border-2 border-[var(--color-teal)]">
            <div className="flex items-center gap-2 mb-3">
              <Home className="w-5 h-5 text-[var(--color-teal)]" />
              <span className="text-[16px] font-semibold text-[var(--color-darkest)]">
                We found your home details
              </span>
            </div>
            <p className="text-[15px] text-[var(--color-dark)]">
              {formatNumber(homeDetails.squareFootage)} sq ft • Built {homeDetails.yearBuilt} • Est. {formatNumber(homeDetails.annualKwh)} kWh/year
            </p>
            <p className="text-[14px] text-[var(--color-dark)] mt-1">
              Your electricity costs will be personalized to your home's actual usage.
            </p>
          </div>
        )}

        {/* Map preview */}
        <MapPreview address={address.formatted || `${address.street}, ${address.city}, ${address.state}`} />

        {/* Address card */}
        <div className="p-5 rounded-xl border-2 border-[var(--color-light)] bg-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[18px] font-semibold text-[var(--color-darkest)]">
                {address.street}
                {address.unit && `, ${address.unit}`}
              </p>
              <p className="text-[15px] text-[var(--color-dark)]">
                {address.city}, {address.state} {address.zip}
              </p>
              <p className="text-[15px] text-[var(--color-dark)] mt-2">
                Move-in: {formatDate(moveInDate!)}
              </p>
            </div>
            <button
              onClick={handleEdit}
              className="flex items-center gap-1 text-[var(--color-teal)] text-[14px] font-medium underline"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
          </div>
        </div>

        {/* Available services - show what's possible, not what's selected */}
        <div>
          <h2 className="text-[20px] font-semibold text-[var(--color-darkest)] mb-2">
            Services you can set up
          </h2>
          <p className="text-[15px] text-[var(--color-dark)] mb-4">
            You'll choose which ones you want in the next step.
          </p>

          <div className="space-y-3">
            {availableServices.water.available && (
              <div className="p-4 rounded-xl border-2 border-[var(--color-light)] bg-white flex items-center gap-4">
                <ServiceIcon type="water" size="xl" />
                <div className="flex-1">
                  <p className="text-[16px] font-semibold text-[var(--color-darkest)]">
                    {SERVICE_INFO.water.label}
                  </p>
                  <p className="text-[14px] text-[var(--color-dark)]">
                    {availableServices.water.provider}
                  </p>
                </div>
                <span className="text-[14px] text-[var(--color-teal)] font-medium bg-[var(--color-teal-light)] px-2 py-1 rounded">
                  Available
                </span>
              </div>
            )}

            <div className="p-4 rounded-xl border-2 border-[var(--color-light)] bg-white flex items-center gap-4">
              <ServiceIcon type="electricity" size="xl" />
              <div className="flex-1">
                <p className="text-[16px] font-semibold text-[var(--color-darkest)]">
                  {SERVICE_INFO.electricity.label}
                </p>
                <p className="text-[14px] text-[var(--color-dark)]">
                  {availableServices.electricity.available
                    ? `${availableServices.electricity.providerCount} providers`
                    : 'Could not load plans'}
                </p>
              </div>
              {availableServices.electricity.available ? (
                <span className="text-[14px] text-[var(--color-teal)] font-medium bg-[var(--color-teal-light)] px-2 py-1 rounded">
                  Available
                </span>
              ) : (
                <span className="text-[14px] text-[var(--color-warning)] font-medium bg-[var(--color-warning-light)] px-2 py-1 rounded">
                  Retry later
                </span>
              )}
            </div>

            {availableServices.internet.available && (
              <div className="p-4 rounded-xl border-2 border-[var(--color-light)] bg-white flex items-center gap-4">
                <ServiceIcon type="internet" size="xl" />
                <div className="flex-1">
                  <p className="text-[16px] font-semibold text-[var(--color-darkest)]">
                    {SERVICE_INFO.internet.label}
                  </p>
                  <p className="text-[14px] text-[var(--color-dark)]">
                    {availableServices.internet.providerCount} providers
                  </p>
                </div>
                <span className="text-[14px] text-[var(--color-teal)] font-medium bg-[var(--color-teal-light)] px-2 py-1 rounded">
                  Available
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Continue button */}
        <Button
          onClick={nextStep}
          fullWidth
          size="large"
          colorScheme="coral"
          rightIcon={<ChevronRight className="w-5 h-5" />}
        >
          Choose my services
        </Button>
      </div>
    );
  }

  // Show address form
  return (
    <div className="space-y-8">
      {/* Heading - centered */}
      <div className="text-center">
        <h1 className="text-[44px] font-bold text-[var(--color-darkest)] leading-tight mb-3">
          Where are you moving?
        </h1>
        <p className="text-[18px] text-[var(--color-dark)]">
          Enter your new address and we'll check what services are available.
        </p>
      </div>

      {/* Form - address autocomplete with live suggestions */}
      <div className="space-y-6">
        <AddressAutocomplete
          onSelect={handleAddressSelect}
          error={errors.address}
          disabled={isCheckingAvailability}
        />

        {/* Show selected address confirmation with detected unit */}
        {selectedAddress && (
          <div className="p-4 rounded-xl bg-[var(--color-teal-light)] border-2 border-[var(--color-teal)]">
            <p className="text-[14px] font-medium text-[var(--color-teal)]">Address selected:</p>
            <p className="text-[16px] text-[var(--color-darkest)] mt-1">
              {selectedAddress.street}
              {selectedAddress.unit && `, Apt ${selectedAddress.unit}`}
            </p>
            <p className="text-[14px] text-[var(--color-dark)] mt-0.5">
              {selectedAddress.city}, {selectedAddress.state} {selectedAddress.zip}
            </p>
          </div>
        )}

        <Input
          label="Move-in date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          error={errors.date}
          disabled={isCheckingAvailability}
          min={new Date().toISOString().split('T')[0]}
          max={new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
        />
      </div>

      {/* Submit button - coral primary */}
      <Button
        onClick={validateAndCheck}
        isLoading={isCheckingAvailability}
        loadingText="Checking availability..."
        fullWidth
        size="large"
        colorScheme="coral"
      >
        Check availability
      </Button>
    </div>
  );
}

export { Step1Address };
