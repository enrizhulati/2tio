'use client';

import { useFlowStore } from '@/store/flowStore';
import { Button, ServiceCard, CartSummary, CompactAddressCard } from '@/components/ui';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function Step3Services() {
  const {
    address,
    moveInDate,
    homeDetails,
    selectedServices,
    expandedService,
    toggleService,
    setExpandedService,
    prevStep,
    nextStep,
    reset,
  } = useFlowStore();

  const selectedCount = Object.values(selectedServices).filter(Boolean).length;

  const handleAddAll = () => {
    if (!selectedServices.electricity) toggleService('electricity');
    if (!selectedServices.internet) toggleService('internet');
  };

  const handleEditAddress = () => {
    // Reset to step 1 and clear address data
    reset();
  };

  return (
    <div className="space-y-8">
      {/* Address context card */}
      {address && moveInDate && (
        <CompactAddressCard
          address={address}
          moveInDate={moveInDate}
          homeDetails={homeDetails || undefined}
          onEdit={handleEditAddress}
        />
      )}

      {/* Heading */}
      <div>
        <h1 className="text-[32px] sm:text-[44px] font-bold text-[var(--color-darkest)] leading-[1.15] tracking-tight mb-3">
          Choose your services
        </h1>
        <p className="text-[18px] text-[var(--color-dark)]">
          Pick what you need — most people finish in under a minute.
        </p>
      </div>

      {/* Service cards */}
      <div className="space-y-4">
        <ServiceCard
          type="water"
          isSelected={selectedServices.water}
          isExpanded={expandedService === 'water'}
          onToggle={() => {}}
          onExpand={() => setExpandedService(expandedService === 'water' ? null : 'water')}
        />

        <ServiceCard
          type="electricity"
          isSelected={selectedServices.electricity}
          isExpanded={expandedService === 'electricity'}
          onToggle={() => toggleService('electricity')}
          onExpand={() => setExpandedService(expandedService === 'electricity' ? null : 'electricity')}
        />

        <ServiceCard
          type="internet"
          isSelected={selectedServices.internet}
          isExpanded={expandedService === 'internet'}
          onToggle={() => toggleService('internet')}
          onExpand={() => setExpandedService(expandedService === 'internet' ? null : 'internet')}
        />
      </div>

      {/* Cart summary */}
      <CartSummary />

      {/* Navigation buttons - Back always left */}
      <div className="pt-4 space-y-4">
        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <Button
            variant="secondary"
            onClick={prevStep}
            leftIcon={<ChevronLeft className="w-5 h-5" />}
          >
            Back
          </Button>
          <Button
            onClick={nextStep}
            fullWidth
            rightIcon={<ChevronRight className="w-5 h-5" />}
            className="sm:flex-1"
          >
            Next: Your details
          </Button>
        </div>

        {/* Add all services link */}
        {selectedCount < 3 && (
          <button
            onClick={handleAddAll}
            className="w-full text-center text-[var(--color-teal)] text-[16px] font-medium underline"
          >
            or Set up all 3 services
          </button>
        )}
      </div>
    </div>
  );
}

export { Step3Services };
