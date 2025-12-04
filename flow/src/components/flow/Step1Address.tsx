'use client';

import { useState, useCallback } from 'react';
import { useFlowStore } from '@/store/flowStore';
import { Button, Input } from '@/components/ui';
import { AddressAutocomplete, type AddressResult } from '@/components/ui/AddressAutocomplete';
import { ChevronRight, Building2, AlertCircle, Check, Home, Droplets, Lightbulb, MapPin } from 'lucide-react';
import type { ESIID, WaterAnswer, OwnershipAnswer } from '@/types/flow';

// Format date for display
const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

// Format number with commas
const formatNumber = (num: number): string => num.toLocaleString();

// Compact map preview for address confirmation
function CompactMapPreview() {
  return (
    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-[var(--color-lightest)] flex-shrink-0">
      <div className="absolute inset-0 bg-gradient-to-br from-[#E8F4F8] to-[#D4E8ED]">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(var(--color-medium) 1px, transparent 1px),
              linear-gradient(90deg, var(--color-medium) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />
        {/* Roads */}
        <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-white opacity-60" />
        <div className="absolute top-0 bottom-0 left-1/3 w-1 bg-white opacity-40" />
        {/* Location marker */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
          <div className="relative">
            <div className="w-6 h-6 bg-[var(--color-coral)] rounded-full flex items-center justify-center shadow-md">
              <MapPin className="w-3.5 h-3.5 text-white" aria-hidden="true" />
            </div>
            <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-[var(--color-coral)] rotate-45" />
          </div>
        </div>
        {/* Pulse animation */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-8 h-8 rounded-full bg-[var(--color-coral)] opacity-20 animate-ping" />
        </div>
      </div>
    </div>
  );
}

// Inline water question component for apartments
function WaterQuestion({
  waterAnswer,
  ownershipAnswer,
  onWaterAnswerChange,
  onOwnershipAnswerChange,
}: {
  waterAnswer: WaterAnswer;
  ownershipAnswer: OwnershipAnswer;
  onWaterAnswerChange: (answer: WaterAnswer) => void;
  onOwnershipAnswerChange: (answer: OwnershipAnswer) => void;
}) {
  return (
    <div className="p-4 rounded-xl border-2 border-[var(--color-light)] bg-[#F0F9FF]">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Droplets className="w-5 h-5 text-[#0EA5E9]" aria-hidden="true" />
        <span className="text-[16px] font-semibold text-[var(--color-darkest)]">
          One quick question about water
        </span>
      </div>

      {/* Question */}
      <p className="text-[15px] text-[var(--color-dark)] mb-4">
        Do you pay for water separately at this address?
      </p>

      {/* Options */}
      <div className="space-y-2">
        {([
          { value: 'yes_separate', label: 'Yes, I have my own meter' },
          { value: 'no_included', label: "No, it's included in my rent" },
          { value: 'not_sure', label: "I'm not sure" },
        ] as const).map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-3 p-3 rounded-lg border-2 border-[var(--color-light)] bg-white cursor-pointer hover:border-[var(--color-medium)] transition-colors has-[:checked]:border-[var(--color-teal)] has-[:checked]:bg-[var(--color-teal)]/5"
          >
            <input
              type="radio"
              name="water-answer"
              value={option.value}
              checked={waterAnswer === option.value}
              onChange={() => onWaterAnswerChange(option.value)}
              className="w-5 h-5 accent-[var(--color-teal)]"
            />
            <span className="text-[16px] text-[var(--color-darkest)]">{option.label}</span>
          </label>
        ))}
      </div>

      {/* Follow-up for "I'm not sure" */}
      {waterAnswer === 'not_sure' && (
        <div className="mt-4 pt-4 border-t border-[var(--color-light)] animate-fade-in">
          <p className="text-[15px] text-[var(--color-dark)] mb-3">
            Are you renting or do you own?
          </p>
          <div className="space-y-2">
            {([
              { value: 'renting', label: "I'm renting" },
              { value: 'own', label: 'I own this home' },
            ] as const).map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 p-3 rounded-lg border-2 border-[var(--color-light)] bg-white cursor-pointer hover:border-[var(--color-medium)] transition-colors has-[:checked]:border-[var(--color-teal)] has-[:checked]:bg-[var(--color-teal)]/5"
              >
                <input
                  type="radio"
                  name="ownership-answer"
                  value={option.value}
                  checked={ownershipAnswer === option.value}
                  onChange={() => onOwnershipAnswerChange(option.value)}
                  className="w-5 h-5 accent-[var(--color-teal)]"
                />
                <span className="text-[16px] text-[var(--color-darkest)]">{option.label}</span>
              </label>
            ))}
          </div>

          {/* Guidance message based on selection */}
          {ownershipAnswer === 'renting' && (
            <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 animate-fade-in">
              <div className="flex gap-2">
                <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div className="text-[14px] text-amber-900">
                  <p className="font-medium mb-1">Check with your landlord or leasing office</p>
                  <p>They&apos;ll know if water is included in your rent. We won&apos;t include water setup for now — you can always add it later if needed.</p>
                </div>
              </div>
            </div>
          )}

          {ownershipAnswer === 'own' && (
            <div className="mt-4 p-3 rounded-lg bg-teal-50 border border-teal-200 animate-fade-in">
              <div className="flex gap-2">
                <Lightbulb className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div className="text-[14px] text-teal-900">
                  <p className="font-medium mb-1">You&apos;ll most likely need water service</p>
                  <p>As a homeowner, you&apos;ll need water in your name. We&apos;ll include water setup to make sure you&apos;re covered.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

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
    isApartment,
    waterAnswer,
    ownershipAnswer,
    isCheckingAvailability,
    setAddress,
    setMoveInDate,
    setWaterAnswer,
    setOwnershipAnswer,
    checkAvailability,
    fetchESIIDs,
    selectESIID,
    confirmEsiid,
    nextStep,
  } = useFlowStore();

  // Local form state
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

  // Default to 2 weeks from now
  const getDefaultDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  };
  const [date, setDate] = useState(moveInDate || getDefaultDate());
  const [errors, setErrors] = useState<{ address?: string; date?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

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
      setIsLoading(true);

      try {
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
          const searchAddress = detectedUnit
            ? `${selectedAddress.street} APT ${detectedUnit.replace(/\D/g, '')}`
            : selectedAddress.street;
          await Promise.all([
            checkAvailability(),
            fetchESIIDs(searchAddress, selectedAddress.zip, detectedUnit),
          ]);
        }
      } catch (error) {
        console.error('Error checking availability:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [selectedAddress, date, setAddress, setMoveInDate, checkAvailability, fetchESIIDs]);

  const handleEdit = () => {
    setSelectedAddress(null);
    setDate(getDefaultDate());
    setErrors({});

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
      waterAnswer: null,
      ownershipAnswer: null,
    });
  };

  const handleConfirm = async () => {
    nextStep();
  };

  const handleEsiidConfirm = async () => {
    setIsLoading(true);
    try {
      await confirmEsiid();
    } finally {
      setIsLoading(false);
    }
  };

  // Show ESIID selection when multiple addresses found
  if (esiidSearchComplete && !esiidConfirmed && address && esiidMatches.length > 1 && !isLoading) {
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
          disabled={!selectedEsiid || isLoadingElectricity || isLoading}
          isLoading={isLoading}
          loadingText="Checking..."
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
  if (esiidSearchComplete && esiidMatches.length === 0 && address && !isLoading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-coral-light)] flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-[var(--color-coral)]" aria-hidden="true" />
          </div>
          <h1 className="text-[28px] sm:text-[35px] font-bold text-[var(--color-darkest)] leading-[1.2] tracking-tight mb-3">
            We couldn&apos;t find this address
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

  // Show confirmation screen after availability is checked
  if (availabilityChecked && availableServices && address && moveInDate && (esiidConfirmed || esiidMatches.length === 1)) {
    return (
      <div className="space-y-8">
        {/* Success header */}
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-coral-light)] flex items-center justify-center">
            <Home className="w-8 h-8 text-[var(--color-coral)]" aria-hidden="true" />
          </div>
          <h1 className="text-[32px] sm:text-[44px] font-bold text-[var(--color-darkest)] leading-[1.15] tracking-tight mb-3">
            We found your home!
          </h1>
          <p className="text-[18px] text-[var(--color-dark)]">
            Confirm this is the right address and we&apos;ll show you available services.
          </p>
        </div>

        {/* Address card */}
        <div className="p-4 rounded-xl border-2 border-[var(--color-light)] bg-[var(--color-lightest)]">
          <div className="flex items-start gap-4">
            {/* Address info */}
            <div className="flex-1 min-w-0">
              <p className="text-[18px] font-semibold text-[var(--color-darkest)] leading-snug">
                {address.street}
                {address.unit && `, ${address.unit}`}
              </p>
              <p className="text-[16px] text-[var(--color-dark)]">
                {address.city}, {address.state} {address.zip}
              </p>
              <p className="text-[16px] text-[var(--color-dark)] mt-2">
                Move-in: {formatDate(moveInDate)}
              </p>

              {/* Home details if available */}
              {homeDetails?.foundDetails && (
                <div className="flex items-center gap-1.5 mt-3 text-[16px] text-[var(--color-teal)]">
                  <Home className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  <span className="font-medium">
                    {formatNumber(homeDetails.squareFootage || 0)} sq ft
                    {homeDetails.yearBuilt ? ` • Built ${homeDetails.yearBuilt}` : ''}
                    {homeDetails.annualKwh ? ` • ~${formatNumber(homeDetails.annualKwh)} kWh/yr` : ''}
                  </span>
                </div>
              )}
            </div>

            {/* Compact map */}
            <CompactMapPreview />
          </div>
        </div>

        {/* Water question for apartments */}
        {isApartment && (
          <WaterQuestion
            waterAnswer={waterAnswer}
            ownershipAnswer={ownershipAnswer}
            onWaterAnswerChange={setWaterAnswer}
            onOwnershipAnswerChange={setOwnershipAnswer}
          />
        )}

        {/* Actions */}
        <div className="space-y-4">
          <Button
            onClick={handleConfirm}
            fullWidth
            size="large"
            colorScheme="coral"
            rightIcon={<ChevronRight className="w-5 h-5" />}
          >
            Yes, this is my home
          </Button>

          <button
            onClick={handleEdit}
            className="w-full text-center text-[var(--color-teal)] text-[16px] font-medium underline hover:text-[var(--color-teal-hover)] transition-colors py-2"
          >
            No, change address
          </button>
        </div>
      </div>
    );
  }

  // Show address form (initial state)
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-[32px] sm:text-[44px] font-bold text-[var(--color-darkest)] leading-[1.15] tracking-tight mb-3">
          Where are you moving?
        </h1>
        <p className="text-[18px] text-[var(--color-dark)]">
          Enter your new address and we&apos;ll check what&apos;s available. Takes 30 seconds.
        </p>
      </div>

      <div className="space-y-6">
        <AddressAutocomplete
          onSelect={handleAddressSelect}
          error={errors.address}
          disabled={isLoading || isCheckingAvailability}
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
          disabled={isLoading || isCheckingAvailability}
          min={new Date().toISOString().split('T')[0]}
          max={new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
        />
      </div>

      <Button
        onClick={validateAndCheck}
        disabled={isLoading || isCheckingAvailability}
        isLoading={isLoading || isCheckingAvailability}
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
