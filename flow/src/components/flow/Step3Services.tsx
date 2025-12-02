'use client';

import Image from 'next/image';
import { useEffect } from 'react';
import { useFlowStore } from '@/store/flowStore';
import { Button } from '@/components/ui';
import { RadioGroup, RadioOption } from '@/components/ui/RadioGroup';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Star,
  Home,
  Loader2,
} from 'lucide-react';
import { SERVICE_INFO, type ServiceType, type ServicePlan } from '@/types/flow';
import { ServiceIcon } from '@/components/ui';

function ServiceCard({
  type,
  isSelected,
  isExpanded,
  onToggle,
  onExpand,
  isLoading,
}: {
  type: ServiceType;
  isSelected: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onExpand: () => void;
  isLoading?: boolean;
}) {
  const { availableServices, selectedPlans, selectPlan, homeDetails } = useFlowStore();
  const service = availableServices?.[type];
  const selectedPlan = selectedPlans[type];

  if (!service?.available) return null;

  const isWater = type === 'water';
  const plans = service.plans;

  // Upsell messages
  const upsellMessages = {
    electricity: 'Most people set this up with water',
    internet: 'Bundle with electricity for faster setup',
  };

  return (
    <div
      className={`
        rounded-xl border-2 overflow-hidden transition-all duration-200
        ${isSelected ? 'border-[var(--color-teal)] bg-white' : 'border-[var(--color-light)] bg-white'}
      `}
    >
      {/* Card header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            {/* Checkbox/indicator */}
            <div className="mt-1">
              {isWater ? (
                // Water is always selected - show checkmark
                <div className="w-6 h-6 rounded bg-[var(--color-teal)] flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : (
                // Toggle for other services
                <button
                  onClick={onToggle}
                  className={`
                    w-6 h-6 rounded border-2 flex items-center justify-center
                    transition-colors duration-150
                    ${isSelected
                      ? 'bg-[var(--color-teal)] border-[var(--color-teal)]'
                      : 'bg-white border-[var(--color-medium)] hover:border-[var(--color-dark)]'
                    }
                  `}
                >
                  {isSelected && (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              )}
            </div>

            {/* Service info */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <ServiceIcon type={type} size="xl" />
                <h3 className="text-[22px] font-semibold text-[var(--color-darkest)]">
                  {SERVICE_INFO[type].label}
                </h3>
              </div>

              {isWater && service.provider ? (
                // Water shows City of Dallas branding
                <div className="mt-3">
                  <div className="flex items-center gap-3 mb-2">
                    <Image
                      src="/city-of-dallas-logo.png"
                      alt="City of Dallas"
                      width={140}
                      height={36}
                      className="h-8 w-auto"
                    />
                  </div>
                  <p className="text-[15px] text-[var(--color-dark)]">
                    Official city water service
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-[14px] text-[var(--color-dark)]">
                    <span>Est. ~$45-65/mo</span>
                    <span className="text-[var(--color-teal)] font-medium">$0 setup fee</span>
                  </div>
                </div>
              ) : isLoading && type === 'electricity' ? (
                // Loading state for electricity
                <div className="mt-2 flex items-center gap-2 text-[var(--color-dark)]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-[15px]">Loading personalized rates...</span>
                </div>
              ) : (
                // Other services show provider count
                <div className="mt-1">
                  <p className="text-[16px] text-[var(--color-dark)]">
                    {service.providerCount} providers available
                  </p>
                  <p className="text-[16px] text-[var(--color-dark)]">
                    Starting at {service.startingRate}
                  </p>
                  {/* Show home-based estimate for electricity */}
                  {type === 'electricity' && homeDetails?.foundDetails && plans.length > 0 && plans[0].monthlyEstimate && (
                    <p className="text-[14px] text-[var(--color-teal)] font-medium mt-1">
                      Est. {plans[0].monthlyEstimate}/mo based on your home
                    </p>
                  )}
                </div>
              )}

              {/* Upsell message for non-selected services */}
              {!isWater && !isSelected && upsellMessages[type as 'electricity' | 'internet'] && (
                <div className="flex items-center gap-1 mt-2 text-[14px] text-[var(--color-teal)]">
                  <Star className="w-4 h-4" />
                  <span>{upsellMessages[type as 'electricity' | 'internet']}</span>
                </div>
              )}
            </div>
          </div>

          {/* Add/Remove button for non-water services */}
          {!isWater && (
            <button
              onClick={onToggle}
              className={`
                flex items-center gap-1 px-3 py-1.5 rounded-lg text-[14px] font-medium
                transition-colors duration-150
                ${isSelected
                  ? 'text-[var(--color-error)] hover:bg-[var(--color-error-light)]'
                  : 'text-[var(--color-teal)] bg-[var(--color-teal-light)] hover:bg-[var(--color-teal)] hover:text-white'
                }
              `}
            >
              {isSelected ? (
                <>
                  <X className="w-4 h-4" />
                  Remove
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Expandable plan selection */}
      {isSelected && !isWater && (
        <div className="border-t border-[var(--color-light)]">
          <button
            onClick={onExpand}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-[var(--color-lightest)] transition-colors"
          >
            <div>
              <span className="text-[16px] font-medium text-[var(--color-darkest)]">
                {selectedPlan ? `${selectedPlan.provider} - ${selectedPlan.name}` : 'Choose your plan'}
              </span>
              {selectedPlan && (
                <span className="text-[14px] text-[var(--color-dark)] ml-2">
                  {selectedPlan.rate} • {selectedPlan.contractLabel}
                </span>
              )}
            </div>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-[var(--color-dark)]" />
            ) : (
              <ChevronDown className="w-5 h-5 text-[var(--color-dark)]" />
            )}
          </button>

          {isExpanded && (
            <div className="px-4 pb-4 animate-slide-up">
              <RadioGroup
                name={`${type}-plan`}
                value={selectedPlan?.id || ''}
                onChange={(planId) => {
                  const plan = plans.find((p) => p.id === planId);
                  if (plan) selectPlan(type, plan);
                }}
                label="Choose your plan"
              >
                {plans.map((plan) => (
                  <RadioOption
                    key={plan.id}
                    value={plan.id}
                    badge={plan.badge === 'RECOMMENDED' ? 'RECOMMENDED' : plan.badge === 'POPULAR' ? 'POPULAR' : plan.badge === 'GREEN' ? 'GREEN' : undefined}
                    badgeVariant={plan.badge === 'GREEN' ? 'success' : 'default'}
                    badgeReason={plan.badgeReason}
                  >
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <p className="text-[16px] font-semibold text-[var(--color-darkest)]">
                          {plan.provider} - {plan.name}
                        </p>
                        {/* Show monthly estimate for electricity if available */}
                        {type === 'electricity' && plan.monthlyEstimate && (
                          <p className="text-[16px] font-bold text-[var(--color-teal)]">
                            {plan.monthlyEstimate}/mo
                          </p>
                        )}
                      </div>
                      <p className="text-[14px] text-[var(--color-dark)] mt-1">
                        {plan.rate} • {plan.contractLabel}
                      </p>
                    </div>
                  </RadioOption>
                ))}
              </RadioGroup>

              <button className="text-[var(--color-teal)] text-[14px] font-medium mt-3 hover:underline">
                View all {plans.length} plans →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Step3Services() {
  const {
    selectedServices,
    expandedService,
    toggleService,
    setExpandedService,
    prevStep,
    nextStep,
  } = useFlowStore();

  const selectedCount = Object.values(selectedServices).filter(Boolean).length;

  const getButtonText = () => {
    if (selectedCount === 1) return 'Continue with water';
    if (selectedCount === 2) return 'Continue with 2 services';
    return 'Continue with 3 services';
  };

  const handleAddAll = () => {
    if (!selectedServices.electricity) toggleService('electricity');
    if (!selectedServices.internet) toggleService('internet');
  };

  return (
    <div className="space-y-8">
      {/* Heading */}
      <div>
        <h1 className="text-[44px] font-bold text-[var(--color-darkest)] leading-tight mb-3">
          Choose your services
        </h1>
        <p className="text-[18px] text-[var(--color-dark)]">
          Select the utilities you'd like us to set up.
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
            {getButtonText()}
          </Button>
        </div>

        {/* Add all services link */}
        {selectedCount < 3 && (
          <button
            onClick={handleAddAll}
            className="w-full text-center text-[var(--color-teal)] text-[16px] font-medium hover:underline"
          >
            or Set up all three services
          </button>
        )}
      </div>
    </div>
  );
}

export { Step3Services };
