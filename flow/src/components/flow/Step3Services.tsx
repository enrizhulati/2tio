'use client';

import { useFlowStore } from '@/store/flowStore';
import { Button, ServiceCard, CartSummary } from '@/components/ui';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function Step3Services() {
  const {
    selectedServices,
    expandedService,
    isApartment,
    waterAnswer,
    ownershipAnswer,
    toggleService,
    setExpandedService,
    prevStep,
    nextStep,
  } = useFlowStore();

  // Determine if water should be shown based on apartment status and answers
  // Show water if: not apartment OR user confirmed separate meter OR (unsure + owns)
  const shouldShowWater =
    !isApartment ||
    waterAnswer === 'yes_separate' ||
    (waterAnswer === 'not_sure' && ownershipAnswer === 'own');

  const selectedCount = Object.values(selectedServices).filter(Boolean).length;
  const availableServiceCount = shouldShowWater ? 3 : 2;

  const handleAddAll = () => {
    if (shouldShowWater && !selectedServices.water) toggleService('water');
    if (!selectedServices.electricity) toggleService('electricity');
    if (!selectedServices.internet) toggleService('internet');
  };

  return (
    <div className="space-y-8">
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
        {shouldShowWater && (
          <ServiceCard
            type="water"
            isSelected={selectedServices.water}
            isExpanded={expandedService === 'water'}
            onToggle={() => {}}
            onExpand={() => setExpandedService(expandedService === 'water' ? null : 'water')}
          />
        )}

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
        {selectedCount < availableServiceCount && (
          <button
            onClick={handleAddAll}
            className="w-full text-center text-[var(--color-teal)] text-[16px] font-medium underline"
          >
            or Set up all {availableServiceCount} services
          </button>
        )}
      </div>
    </div>
  );
}

export { Step3Services };
