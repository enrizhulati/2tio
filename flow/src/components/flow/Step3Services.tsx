'use client';

import Image from 'next/image';
import { useState, useMemo } from 'react';
import { useFlowStore } from '@/store/flowStore';
import { Button, UsageChart, UsageSlider } from '@/components/ui';
import { RadioGroup, RadioOption } from '@/components/ui/RadioGroup';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Star,
  Loader2,
  ShoppingCart,
  Leaf,
  Wifi,
} from 'lucide-react';
import { SERVICE_INFO, type ServiceType, type ServicePlan } from '@/types/flow';
import { ServiceIcon } from '@/components/ui';

// Water tooltip with touch/keyboard access - Practical UI: Match checkbox size
function WaterTooltip() {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShow(!show)}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="w-7 h-7 rounded-md bg-[var(--color-teal)] flex items-center justify-center"
        aria-label="Water service is required"
        aria-expanded={show}
      >
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </button>
      {show && (
        <div
          role="tooltip"
          className="absolute left-8 top-0 z-[100] w-52 p-3 bg-[var(--color-darkest)] text-white text-[16px] rounded-lg shadow-xl leading-snug"
        >
          <div className="absolute -left-1.5 top-2 w-3 h-3 bg-[var(--color-darkest)] rotate-45" />
          <p className="relative z-10">Water is required when moving to a new address in Texas.</p>
        </div>
      )}
    </div>
  );
}

// Cart summary component
function CartSummary() {
  const { selectedServices, selectedPlans, cart } = useFlowStore();

  // Calculate total monthly estimate
  const getMonthlyTotal = () => {
    let total = 0;

    // Water estimate
    if (selectedServices.water) {
      total += 55; // Midpoint of $45-65 estimate
    }

    // Electricity from cart or selected plan
    if (selectedServices.electricity && selectedPlans.electricity) {
      const estimate = selectedPlans.electricity.monthlyEstimate;
      if (estimate) {
        total += parseFloat(estimate.replace('$', ''));
      }
    }

    // Internet
    if (selectedServices.internet && selectedPlans.internet) {
      const rate = selectedPlans.internet.rate;
      if (rate) {
        const match = rate.match(/\$?([\d.]+)/);
        if (match) total += parseFloat(match[1]);
      }
    }

    return total;
  };

  const selectedCount = Object.values(selectedServices).filter(Boolean).length;
  const monthlyTotal = getMonthlyTotal();

  if (selectedCount === 0) return null;

  return (
    <div className="p-5 sm:p-6 rounded-xl bg-[var(--color-lightest)] border border-[var(--color-light)]">
      <div className="flex items-center gap-2.5 mb-4">
        <ShoppingCart className="w-5 h-5 text-[var(--color-teal)]" aria-hidden="true" />
        <span className="text-[18px] font-bold text-[var(--color-darkest)]">
          Your services
        </span>
      </div>

      <div className="space-y-2.5">
        {selectedServices.water && selectedPlans.water && (
          <div className="flex justify-between text-[16px]">
            <span className="text-[var(--color-dark)]">Water</span>
            <span className="text-[var(--color-darkest)] font-medium">~$55/mo</span>
          </div>
        )}

        {selectedServices.electricity && selectedPlans.electricity && (
          <div className="flex justify-between text-[16px]">
            <span className="text-[var(--color-dark)]">
              {selectedPlans.electricity.provider}
            </span>
            <span className="text-[var(--color-darkest)] font-medium">
              {selectedPlans.electricity.monthlyEstimate || selectedPlans.electricity.rate}/mo
            </span>
          </div>
        )}

        {selectedServices.internet && selectedPlans.internet && (
          <div className="flex justify-between text-[16px]">
            <span className="text-[var(--color-dark)]">
              {selectedPlans.internet.provider}
            </span>
            <span className="text-[var(--color-darkest)] font-medium">
              {selectedPlans.internet.rate}
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-[var(--color-light)] flex justify-between items-center">
        <span className="text-[16px] font-semibold text-[var(--color-darkest)]">
          Est. monthly total
        </span>
        <span className="text-[18px] font-bold text-[var(--color-teal)]">
          ~${Math.round(monthlyTotal)}/mo
        </span>
      </div>
    </div>
  );
}

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
  const { availableServices, selectedPlans, selectPlan, homeDetails, usageProfile, updateMonthlyUsage, isLoadingElectricity } = useFlowStore();
  const [showAllPlans, setShowAllPlans] = useState(false);
  const service = availableServices?.[type];
  const selectedPlan = selectedPlans[type];

  if (!service?.available) return null;

  const isWater = type === 'water';
  const plans = service.plans;

  // Sort plans by annualCost (cheapest first) for electricity
  const sortedPlans = useMemo(() => {
    if (type !== 'electricity') return plans;
    return [...plans].sort((a, b) => (a.annualCost || Infinity) - (b.annualCost || Infinity));
  }, [plans, type]);

  // Top 3 plans for initial display
  const displayedPlans = showAllPlans ? sortedPlans : sortedPlans.slice(0, 3);

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
      {/* Card header - Practical UI: M=24px padding, 48px touch targets */}
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            {/* Checkbox/indicator - 28px with padding for 48px touch target */}
            <div className="mt-0.5">
              {isWater ? (
                // Water is always selected - show locked checkmark with tooltip
                <WaterTooltip />
              ) : (
                // Toggle for other services
                <button
                  onClick={onToggle}
                  className={`
                    w-7 h-7 rounded-md border-2 flex items-center justify-center
                    transition-colors duration-150 min-h-[28px]
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
              <div className="flex items-center gap-2.5">
                <ServiceIcon type={type} size="xl" />
                <h3 className="text-[22px] font-bold text-[var(--color-darkest)] tracking-tight">
                  {SERVICE_INFO[type].label}
                </h3>
                {isWater && (
                  <span className="text-[12px] font-bold uppercase tracking-wider text-[var(--color-dark)] bg-[var(--color-lightest)] px-2 py-0.5 rounded">
                    Required
                  </span>
                )}
              </div>

              {isWater && service.provider ? (
                // Water shows city branding from API
                <div className="mt-4">
                  {service.logo && (
                    <div className="flex items-center gap-3 mb-3">
                      <Image
                        src={service.logo}
                        alt={service.provider}
                        width={140}
                        height={36}
                        className="h-9 w-auto"
                      />
                    </div>
                  )}
                  <p className="text-[16px] text-[var(--color-dark)]">
                    {service.logo ? 'Official city water service' : service.provider}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-[16px]">
                    <span className="text-[var(--color-darkest)] font-medium">Est. ~$45-65/mo</span>
                    <span className="text-[var(--color-teal)] font-semibold">$0 setup fee</span>
                  </div>
                </div>
              ) : isLoading && type === 'electricity' ? (
                // Loading state for electricity
                <div className="mt-2 flex items-center gap-2 text-[var(--color-dark)]">
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span className="text-[16px]">Loading personalized rates...</span>
                </div>
              ) : (
                // Other services show provider count - Practical UI: Clear hierarchy
                <div className="mt-3 space-y-1.5">
                  <p className="text-[16px] text-[var(--color-darkest)] font-medium">
                    {service.providerCount} providers available
                  </p>
                  <p className="text-[16px] text-[var(--color-dark)]">
                    Starting at <span className="font-semibold text-[var(--color-darkest)]">{service.startingRate}</span>
                  </p>
                  {/* Show home-based estimate for electricity */}
                  {type === 'electricity' && homeDetails?.foundDetails && plans.length > 0 && plans[0].monthlyEstimate && (
                    <p className="text-[16px] text-[var(--color-teal)] font-semibold">
                      Est. {plans[0].monthlyEstimate}/mo based on your home
                    </p>
                  )}
                  {/* Show speed info for internet */}
                  {type === 'internet' && plans.length > 0 && plans[0].downloadSpeed && (
                    <p className="text-[16px] text-[var(--color-teal)] font-semibold">
                      Up to {plans[0].downloadSpeed}
                      {plans[0].uploadSpeed ? `/${plans[0].uploadSpeed}` : ''} Mbps
                      {plans[0].dataCapGB === null || plans[0].dataCapGB === undefined || plans[0].dataCapGB === 0
                        ? ' • Unlimited'
                        : ` • ${plans[0].dataCapGB} GB cap`}
                    </p>
                  )}
                </div>
              )}

              {/* Upsell message for non-selected services */}
              {!isWater && !isSelected && upsellMessages[type as 'electricity' | 'internet'] && (
                <div className="flex items-center gap-1.5 mt-3 text-[16px] text-[var(--color-teal)]">
                  <Star className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  <span className="font-medium">{upsellMessages[type as 'electricity' | 'internet']}</span>
                </div>
              )}
            </div>
          </div>

          {/* Add/Remove button - Practical UI: 48px min touch target, prominent CTA */}
          {!isWater && (
            <button
              onClick={onToggle}
              className={`
                flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[16px] font-semibold
                transition-all duration-150 min-h-[44px] shadow-sm
                ${isSelected
                  ? 'text-[var(--color-error)] bg-[var(--color-lightest)] hover:bg-[var(--color-error-light)] border border-[var(--color-light)]'
                  : 'text-white bg-[var(--color-teal)] hover:bg-[var(--color-teal-hover)] shadow-md'
                }
              `}
            >
              {isSelected ? (
                <>
                  <X className="w-4 h-4" aria-hidden="true" />
                  Remove
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  Add
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Expandable plan selection - Practical UI: Accessible disclosure, 48px touch target */}
      {isSelected && !isWater && (
        <div className="border-t border-[var(--color-light)]">
          <button
            onClick={onExpand}
            className="w-full px-5 sm:px-6 py-4 flex items-center justify-between text-left hover:bg-[var(--color-lightest)] transition-colors min-h-[56px]"
            aria-expanded={isExpanded}
            aria-controls={`${type}-plan-section`}
          >
            <div className="flex-1 min-w-0">
              {selectedPlan ? (
                <>
                  <span className="text-[16px] font-semibold text-[var(--color-darkest)]">
                    {selectedPlan.provider}
                  </span>
                  <span className="text-[16px] text-[var(--color-teal)] ml-2">
                    {isExpanded ? 'Change plan' : 'Tap to change'}
                  </span>
                </>
              ) : (
                <span className="text-[16px] font-semibold text-[var(--color-teal)]">
                  Choose your plan
                </span>
              )}
            </div>
            <div className="flex-shrink-0 ml-3">
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-[var(--color-dark)]" aria-hidden="true" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[var(--color-dark)]" aria-hidden="true" />
              )}
            </div>
          </button>

          {isExpanded && (
            <div id={`${type}-plan-section`} className="px-5 sm:px-6 pb-5 sm:pb-6 animate-slide-up overflow-hidden">
              {/* Usage Chart for electricity - show with real or default usage */}
              {type === 'electricity' && sortedPlans.length > 0 && sortedPlans[0].annualCost && (
                <UsageChart
                  usage={usageProfile?.usage || [900, 850, 900, 1000, 1200, 1400, 1500, 1500, 1300, 1100, 950, 900]}
                  homeDetails={homeDetails?.foundDetails ? {
                    squareFootage: homeDetails.squareFootage || 0,
                    yearBuilt: homeDetails.yearBuilt || 0,
                    annualKwh: (usageProfile?.usage || [900, 850, 900, 1000, 1200, 1400, 1500, 1500, 1300, 1100, 950, 900]).reduce((sum, val) => sum + val, 0),
                  } : undefined}
                  className="mb-4"
                />
              )}

              {/* Usage Slider for electricity - allows user to adjust their estimate */}
              {type === 'electricity' && sortedPlans.length > 0 && (
                <UsageSlider
                  value={Math.round((usageProfile?.usage || [900, 850, 900, 1000, 1200, 1400, 1500, 1500, 1300, 1100, 950, 900]).reduce((a, b) => a + b, 0) / 12)}
                  onChange={(monthlyKwh) => updateMonthlyUsage(monthlyKwh)}
                  hasHomeData={homeDetails?.foundDetails || false}
                  isLoading={isLoadingElectricity}
                  className="mb-4"
                />
              )}

              {/* Section header for electricity with rate explainer */}
              {type === 'electricity' && sortedPlans.length > 0 && sortedPlans[0].annualCost && (
                <div className="mb-4">
                  <p className="text-[16px] font-semibold text-[var(--color-darkest)]">
                    Plans ranked for homes like yours
                  </p>
                  {/* Rate explainer - Practical UI: Explain jargon, 14px min, 4.5:1 contrast */}
                  <p className="text-[16px] text-[var(--color-dark)] mt-1">
                    {homeDetails?.foundDetails
                      ? `Similar properties typically use ~${Math.round((usageProfile?.usage || []).reduce((a, b) => a + b, 0) / 12).toLocaleString()} kWh/month. Plans ranked assuming this usage.`
                      : 'Plans ranked assuming ~1,000 kWh/month (typical home usage).'}
                  </p>
                </div>
              )}

              <RadioGroup
                name={`${type}-plan`}
                value={selectedPlan?.id || ''}
                onChange={(planId) => {
                  const plan = sortedPlans.find((p) => p.id === planId);
                  if (plan) selectPlan(type, plan);
                }}
                label="Choose your plan"
              >
                {displayedPlans.map((plan, index) => {
                  // For electricity: first plan is cheapest, show GREEN badge if renewable
                  const isElectricity = type === 'electricity';
                  const isInternet = type === 'internet';
                  const isCheapest = isElectricity && index === 0;
                  const isGreen = plan.renewable || plan.badge === 'GREEN';
                  const renewablePct = plan.renewablePercent || (isGreen ? 100 : 0);

                  let badge: 'BEST FIT' | 'GREEN' | 'RECOMMENDED' | 'POPULAR' | undefined;
                  let badgeVariant: 'default' | 'success' | 'cheapest' = 'default';
                  let badgeReason: string | undefined;

                  if (isCheapest) {
                    badge = 'BEST FIT';
                    badgeVariant = 'cheapest';
                    // Show value proposition - use "similar homes" framing
                    badgeReason = 'Best value for homes with this usage pattern';
                  } else if (isGreen) {
                    badge = 'GREEN';
                    badgeVariant = 'success';
                    badgeReason = renewablePct >= 100 ? '100% renewable energy' : `${renewablePct}% renewable energy`;
                  } else if (plan.badge === 'POPULAR') {
                    badge = 'POPULAR';
                  }

                  // Extract rate per kWh for electricity (e.g., "$0.090/kWh" -> "9.0¢")
                  const ratePerKwh = isElectricity && plan.rate
                    ? (parseFloat(plan.rate.replace('$', '').replace('/kWh', '')) * 100).toFixed(1) + '¢'
                    : null;

                  return (
                    <RadioOption
                      key={plan.id}
                      value={plan.id}
                      badge={badge}
                      badgeVariant={badgeVariant}
                      badgeReason={badgeReason}
                    >
                      {/* 2-column grid - Practical UI: S=16px gaps */}
                      <div className="grid grid-cols-[1fr_auto] gap-4">
                        {/* LEFT: Main content */}
                        <div className="min-w-0 space-y-1.5">
                          {/* Row 1: Term + Green badge */}
                          <div className="flex items-center gap-2">
                            <span className="text-[18px] font-bold text-[var(--color-darkest)] tracking-tight">
                              {plan.contractMonths > 0 ? `${plan.contractMonths} Mo` : 'No Contract'}
                            </span>
                            {isElectricity && renewablePct > 0 && (
                              <span className="text-[14px] font-medium text-[var(--color-success)]">
                                {renewablePct}% Green
                              </span>
                            )}
                          </div>

                          {/* Row 2: Provider logo + plan name */}
                          <div className="flex items-center gap-3">
                            {plan.logo && (
                              <Image
                                src={plan.logo}
                                alt={plan.provider}
                                width={80}
                                height={40}
                                className="h-8 w-auto object-contain flex-shrink-0"
                              />
                            )}
                            <span className="text-[16px] font-semibold text-[var(--color-darkest)]">
                              {plan.name}
                            </span>
                          </div>

                          {/* Row 3: Monthly estimate + details */}
                          <div className="text-[16px] text-[var(--color-dark)]">
                            {isElectricity && plan.monthlyEstimate && (
                              // Show average prominently, range as secondary hedge
                              <>
                                <span className="font-semibold text-[var(--color-darkest)]">
                                  ~{plan.monthlyEstimate}/mo
                                </span>
                                {plan.lowMonthly && plan.highMonthly && (
                                  <span className="text-[var(--color-medium)]">
                                    {' '}(${Math.round(plan.lowMonthly)}–${Math.round(plan.highMonthly)} range)
                                  </span>
                                )}
                              </>
                            )}
                            {isInternet && plan.rate && (
                              <span className="font-semibold text-[var(--color-darkest)]">
                                {plan.rate}
                              </span>
                            )}
                            {isInternet && plan.downloadSpeed && (
                              <span className="text-[var(--color-dark)]">
                                {' '}• {plan.downloadSpeed}{plan.uploadSpeed ? `/${plan.uploadSpeed}` : ''} Mbps
                              </span>
                            )}
                          </div>

                          {/* Row 4: Secondary details */}
                          {(plan.cancellationFee || plan.leadTime || isInternet) && (
                            <div className="text-[16px] text-[var(--color-dark)]">
                              {isElectricity && plan.cancellationFee && plan.cancellationFee > 0 && (
                                <span>${plan.cancellationFee} cancel fee</span>
                              )}
                              {isInternet && (
                                <span>
                                  {plan.dataCapGB === null || plan.dataCapGB === undefined || plan.dataCapGB === 0
                                    ? 'Unlimited data'
                                    : `${plan.dataCapGB} GB cap`}
                                </span>
                              )}
                              {plan.leadTime !== undefined && plan.leadTime > 0 && (
                                <span className="text-[var(--color-teal)] font-medium">
                                  {' '}• Starts in {plan.leadTime}d
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* RIGHT: Rate highlight (electricity only) */}
                        {isElectricity && ratePerKwh && (
                          <div className="flex flex-col items-center justify-center pl-4 border-l border-[var(--color-light)]">
                            <span className="text-[28px] font-bold text-[var(--color-coral)] tracking-tight">
                              {ratePerKwh}
                            </span>
                            <span className="text-[14px] text-[var(--color-dark)]">
                              per kWh
                            </span>
                          </div>
                        )}
                      </div>
                    </RadioOption>
                  );
                })}
              </RadioGroup>

              {/* View all plans button - Practical UI: Arrows suggest external links, remove */}
              {!showAllPlans && sortedPlans.length > 3 && (
                <button
                  onClick={() => setShowAllPlans(true)}
                  className="text-[var(--color-teal)] text-[16px] font-medium mt-3 underline"
                >
                  View all {sortedPlans.length} plans
                </button>
              )}
              {showAllPlans && sortedPlans.length > 3 && (
                <button
                  onClick={() => setShowAllPlans(false)}
                  className="text-[var(--color-dark)] text-[16px] font-medium mt-3 underline"
                >
                  Show fewer plans
                </button>
              )}
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

  const handleAddAll = () => {
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
