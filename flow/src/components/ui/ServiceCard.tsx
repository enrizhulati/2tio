'use client';

import Image from 'next/image';
import { useState, useMemo } from 'react';
import { useFlowStore } from '@/store/flowStore';
import { UsageChart, UsageSlider, ServiceIcon } from '@/components/ui';
import { RadioGroup, RadioOption } from '@/components/ui/RadioGroup';
import { WaterTooltip } from '@/components/ui/WaterTooltip';
import {
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Star,
  Loader2,
} from 'lucide-react';
import { SERVICE_INFO, type ServiceType } from '@/types/flow';

export function ServiceCard({
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
  const { availableServices, selectedPlans, selectPlan, homeDetails, usageProfile, updateMonthlyUsage, isLoadingElectricity, isApartment } = useFlowStore();
  const [showAllPlans, setShowAllPlans] = useState(false);

  // Track original estimate for reset functionality (captured on first render)
  const [originalEstimate] = useState(() => {
    const usage = usageProfile?.usage || [900, 850, 900, 1000, 1200, 1400, 1500, 1500, 1300, 1100, 950, 900];
    return Math.round(usage.reduce((a, b) => a + b, 0) / 12);
  });

  const service = availableServices?.[type];
  const selectedPlan = selectedPlans[type];

  if (!service?.available) return null;

  const isWater = type === 'water';
  const plans = service.plans;

  // Sort plans by annualCost (cheapest first) and assign RECOMMENDED badge to cheapest
  const sortedPlans = useMemo(() => {
    if (type !== 'electricity') return plans;
    const sorted = [...plans].sort((a, b) => (a.annualCost || Infinity) - (b.annualCost || Infinity));

    // Assign RECOMMENDED badge to cheapest non-renewable plan
    return sorted.map((plan, index) => {
      if (index === 0 && !plan.renewable) {
        return {
          ...plan,
          badge: 'RECOMMENDED' as const,
          badgeReason: 'Best value based on your usage estimate',
        };
      }
      return plan;
    });
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
      data-service-card={type}
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
                // Water shows city branding from API - logo on right
                <div className="mt-4 flex items-start justify-between gap-4">
                  {/* Left: Plan details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[16px] font-semibold text-[var(--color-darkest)]">
                      {selectedPlan?.name || 'City Water Service'}
                    </p>
                    {selectedPlan?.shortDescription && (
                      <p className="text-[14px] text-[var(--color-dark)] mt-1">
                        {selectedPlan.shortDescription}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-[16px]">
                      <span className="text-[var(--color-darkest)] font-medium">
                        {selectedPlan?.rate || service.startingRate || 'Usage-based pricing'}
                      </span>
                      <span className="text-[var(--color-teal)] font-semibold">$0 setup fee</span>
                    </div>
                  </div>
                  {/* Right: City logo (larger) */}
                  {service.logo && (
                    <div className="flex-shrink-0">
                      <Image
                        src={service.logo}
                        alt={service.provider}
                        width={100}
                        height={100}
                        className="w-20 h-20 object-contain"
                      />
                    </div>
                  )}
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
                    Starting at <span className="font-semibold text-[var(--color-darkest)]">
                      {type === 'electricity' && sortedPlans.length > 0 ? sortedPlans[0].rate : service.startingRate}
                    </span>
                  </p>
                  {/* Show usage-based estimate for electricity (cheapest plan) */}
                  {type === 'electricity' && sortedPlans.length > 0 && sortedPlans[0].monthlyEstimate && (
                    <p className="text-[16px] text-[var(--color-teal)] font-semibold">
                      Est. {sortedPlans[0].monthlyEstimate}/mo based on your home
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
          <div className="w-full px-5 sm:px-6 py-4 flex items-center justify-between min-h-[56px]">
            <div className="flex-1 min-w-0">
              {selectedPlan ? (
                <>
                  <span className="text-[16px] font-semibold text-[var(--color-darkest)]">
                    {selectedPlan.provider}
                  </span>
                  <button
                    onClick={() => {
                      if (!isExpanded) {
                        // Expand first, then scroll after DOM updates
                        onExpand();
                        setTimeout(() => {
                          const heading = document.getElementById(`${type}-plan-heading`);
                          heading?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 100);
                      } else {
                        const heading = document.getElementById(`${type}-plan-heading`);
                        heading?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                    className="text-[16px] text-[var(--color-teal)] ml-2 hover:underline"
                  >
                    {isExpanded ? 'Change plan' : `Choose your ${type} plan`}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    if (!isExpanded) {
                      // Expand first, then scroll after DOM updates
                      onExpand();
                      setTimeout(() => {
                        const heading = document.getElementById(`${type}-plan-heading`);
                        heading?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }, 100);
                    } else {
                      const heading = document.getElementById(`${type}-plan-heading`);
                      heading?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className="text-[16px] font-semibold text-[var(--color-teal)] hover:underline"
                >
                  Choose your {type} plan
                </button>
              )}
            </div>
            <button
              onClick={onExpand}
              className="flex-shrink-0 ml-3 p-2 -mr-2 rounded-full hover:bg-[var(--color-lightest)] transition-colors"
              aria-expanded={isExpanded}
              aria-controls={`${type}-plan-section`}
              aria-label={isExpanded ? 'Collapse plan options' : 'Expand plan options'}
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-[var(--color-dark)]" aria-hidden="true" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[var(--color-dark)]" aria-hidden="true" />
              )}
            </button>
          </div>

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
                  originalEstimate={originalEstimate}
                  hasHomeData={homeDetails?.foundDetails || false}
                  isApartment={isApartment}
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
                labelId={`${type}-plan-heading`}
              >
                {displayedPlans.map((plan, index) => {
                  // For electricity: first plan is cheapest, show GREEN badge only if 100% renewable
                  const isElectricity = type === 'electricity';
                  const isInternet = type === 'internet';
                  const isCheapest = isElectricity && index === 0;
                  const renewablePct = plan.renewablePercent || 0;
                  const is100Green = renewablePct >= 100;

                  let badge: 'BEST FIT' | 'GREEN' | 'RECOMMENDED' | 'POPULAR' | undefined;
                  let badgeVariant: 'default' | 'success' | 'cheapest' = 'default';
                  let badgeReason: string | undefined;

                  if (isCheapest) {
                    badge = 'BEST FIT';
                    badgeVariant = 'cheapest';
                    // Show value proposition - use "similar homes" framing
                    badgeReason = 'Best value for homes with this usage pattern';
                  } else if (is100Green) {
                    badge = 'GREEN';
                    badgeVariant = 'success';
                    badgeReason = '100% renewable energy from Texas wind and solar';
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
