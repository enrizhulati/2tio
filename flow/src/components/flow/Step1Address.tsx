'use client';

import { useState, useCallback } from 'react';
import { useFlowStore } from '@/store/flowStore';
import { Button, Input, ServiceIcon } from '@/components/ui';
import { AddressAutocomplete, type AddressResult } from '@/components/ui/AddressAutocomplete';
import { MapPin, ChevronRight, Edit2, Navigation, Home } from 'lucide-react';
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
    setAddress,
    setMoveInDate,
    checkAvailability,
    fetchESIIDs,
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
    } : null
  );
  const [unit, setUnit] = useState(address?.unit || '');
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
      // Use the selected address from Google Places
      const finalAddress = {
        street: selectedAddress.street,
        unit: unit || undefined,
        city: selectedAddress.city,
        state: selectedAddress.state,
        zip: selectedAddress.zip,
        formatted: unit
          ? `${selectedAddress.street}, ${unit}, ${selectedAddress.city}, ${selectedAddress.state} ${selectedAddress.zip}`
          : selectedAddress.formatted,
      };

      setAddress(finalAddress);
      setMoveInDate(date);

      // Fetch ESIIDs in parallel with availability check
      // Include unit number in search to prioritize the user's specific apartment
      const searchAddress = unit
        ? `${selectedAddress.street} APT ${unit}`
        : selectedAddress.street;
      await Promise.all([
        checkAvailability(),
        fetchESIIDs(searchAddress, selectedAddress.zip),
      ]);
    }
  }, [selectedAddress, unit, date, setAddress, setMoveInDate, checkAvailability, fetchESIIDs]);

  const handleEdit = () => {
    // Reset local form state to allow fresh input
    setSelectedAddress(null);
    setUnit('');
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

  // Show availability results
  if (availabilityChecked && availableServices && address) {
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
              className="flex items-center gap-1 text-[var(--color-teal)] text-[14px] font-medium hover:underline"
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

            {availableServices.electricity.available && (
              <div className="p-4 rounded-xl border-2 border-[var(--color-light)] bg-white flex items-center gap-4">
                <ServiceIcon type="electricity" size="xl" />
                <div className="flex-1">
                  <p className="text-[16px] font-semibold text-[var(--color-darkest)]">
                    {SERVICE_INFO.electricity.label}
                  </p>
                  <p className="text-[14px] text-[var(--color-dark)]">
                    {availableServices.electricity.providerCount} providers
                  </p>
                </div>
                <span className="text-[14px] text-[var(--color-teal)] font-medium bg-[var(--color-teal-light)] px-2 py-1 rounded">
                  Available
                </span>
              </div>
            )}

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

        {/* Show selected address confirmation */}
        {selectedAddress && (
          <div className="p-4 rounded-xl bg-[var(--color-teal-light)] border-2 border-[var(--color-teal)]">
            <p className="text-[14px] font-medium text-[var(--color-teal)]">Address selected:</p>
            <p className="text-[16px] text-[var(--color-darkest)] mt-1">
              {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state} {selectedAddress.zip}
            </p>
          </div>
        )}

        {/* Show apt/unit field after address is selected */}
        {selectedAddress && (
          <Input
            label="Apt/Suite"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            optional
            disabled={isCheckingAvailability}
            placeholder="Apt 4B"
          />
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
