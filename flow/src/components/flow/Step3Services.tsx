'use client';

import Image from 'next/image';
import { useState, useMemo } from 'react';
import { useFlowStore } from '@/store/flowStore';
import { Button, UsageChart } from '@/components/ui';
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
    <div className="p-4 rounded-xl bg-[var(--color-lightest)] border border-[var(--color-light)]">
      <div className="flex items-center gap-2 mb-3">
        <ShoppingCart className="w-4 h-4 text-[var(--color-teal)]" aria-hidden="true" />
        <span className="text-[14px] font-semibold text-[var(--color-darkest)]">
          Your services
        </span>
      </div>

      <div className="space-y-2">
        {selectedServices.water && selectedPlans.water && (
          <div className="flex justify-between text-[14px]">
            <span className="text-[var(--color-dark)]">Water</span>
            <span className="text-[var(--color-darkest)]">~$55/mo</span>
          </div>
        )}

        {selectedServices.electricity && selectedPlans.electricity && (
          <div className="flex justify-between text-[14px]">
            <span className="text-[var(--color-dark)]">
              {selectedPlans.electricity.provider}
            </span>
            <span className="text-[var(--color-darkest)]">
              {selectedPlans.electricity.monthlyEstimate || selectedPlans.electricity.rate}/mo
            </span>
          </div>
        )}

        {selectedServices.internet && selectedPlans.internet && (
          <div className="flex justify-between text-[14px]">
            <span className="text-[var(--color-dark)]">
              {selectedPlans.internet.provider}
            </span>
            <span className="text-[var(--color-darkest)]">
              {selectedPlans.internet.rate}
            </span>
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-[var(--color-light)] flex justify-between">
        <span className="text-[14px] font-medium text-[var(--color-darkest)]">
          Est. monthly total
        </span>
        <span className="text-[16px] font-bold text-[var(--color-teal)]">
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
  const { availableServices, selectedPlans, selectPlan, homeDetails, usageProfile } = useFlowStore();
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
      {/* Card header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            {/* Checkbox/indicator */}
            <div className="mt-1">
              {isWater ? (
                // Water is always selected - show locked checkmark with tooltip
                <div className="relative group">
                  <div className="w-6 h-6 rounded bg-[var(--color-teal)] flex items-center justify-center cursor-help">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  {/* Tooltip */}
                  <div className="absolute left-8 top-0 hidden group-hover:block z-10 w-48 p-2 bg-[var(--color-darkest)] text-white text-[14px] rounded-lg shadow-lg">
                    Water service is required by your city when you move to a new address
                  </div>
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
                {isWater && (
                  <span className="text-[12px] font-bold uppercase tracking-wider text-[var(--color-dark)] bg-[var(--color-lightest)] px-2 py-0.5 rounded">
                    Required
                  </span>
                )}
              </div>

              {isWater && service.provider ? (
                // Water shows city branding from API
                <div className="mt-3">
                  {service.logo && (
                    <div className="flex items-center gap-3 mb-2">
                      <Image
                        src={service.logo}
                        alt={service.provider}
                        width={140}
                        height={36}
                        className="h-8 w-auto"
                      />
                    </div>
                  )}
                  <p className="text-[15px] text-[var(--color-dark)]">
                    {service.logo ? 'Official city water service' : service.provider}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-[14px] text-[var(--color-dark)]">
                    <span>Est. ~$45-65/mo</span>
                    <span className="text-[var(--color-teal)] font-medium">$0 setup fee</span>
                  </div>
                </div>
              ) : isLoading && type === 'electricity' ? (
                // Loading state for electricity
                <div className="mt-2 flex items-center gap-2 text-[var(--color-dark)]">
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
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
                  {/* Show speed info for internet */}
                  {type === 'internet' && plans.length > 0 && plans[0].downloadSpeed && (
                    <p className="text-[14px] text-[var(--color-teal)] font-medium mt-1">
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
                <div className="flex items-center gap-1 mt-2 text-[14px] text-[var(--color-teal)]">
                  <Star className="w-4 h-4" aria-hidden="true" />
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

      {/* Expandable plan selection - Practical UI: Accessible disclosure */}
      {isSelected && !isWater && (
        <div className="border-t border-[var(--color-light)]">
          <button
            onClick={onExpand}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-[var(--color-lightest)] transition-colors"
            aria-expanded={isExpanded}
            aria-controls={`${type}-plan-section`}
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
              <ChevronUp className="w-5 h-5 text-[var(--color-dark)]" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-5 h-5 text-[var(--color-dark)]" aria-hidden="true" />
            )}
          </button>

          {isExpanded && (
            <div id={`${type}-plan-section`} className="px-4 pb-4 animate-slide-up">
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

              {/* Section header for electricity with rate explainer */}
              {type === 'electricity' && sortedPlans.length > 0 && sortedPlans[0].annualCost && (
                <div className="mb-4">
                  <p className="text-[14px] font-semibold text-[var(--color-darkest)]">
                    Best plans for your home
                  </p>
                  {/* Rate explainer - Practical UI: Explain jargon, 14px min, 4.5:1 contrast */}
                  <p className="text-[14px] text-[var(--color-dark)] mt-1">
                    Monthly estimates based on ~1,000 kWh/month (typical home usage)
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

                  let badge: 'CHEAPEST' | 'GREEN' | 'RECOMMENDED' | 'POPULAR' | undefined;
                  let badgeVariant: 'default' | 'success' | 'cheapest' = 'default';
                  let badgeReason: string | undefined;

                  if (isCheapest) {
                    badge = 'CHEAPEST';
                    badgeVariant = 'cheapest';
                    // Calculate savings vs next cheapest
                    if (sortedPlans.length > 1 && sortedPlans[0].annualCost && sortedPlans[1].annualCost) {
                      const savings = Math.round(sortedPlans[1].annualCost - sortedPlans[0].annualCost);
                      if (savings > 0) {
                        badgeReason = `Saves $${savings}/year vs next cheapest`;
                      }
                    }
                  } else if (isGreen) {
                    badge = 'GREEN';
                    badgeVariant = 'success';
                    badgeReason = renewablePct >= 100 ? '100% renewable energy' : `${renewablePct}% renewable energy`;
                  } else if (plan.badge === 'POPULAR') {
                    badge = 'POPULAR';
                  }

                  return (
                    <RadioOption
                      key={plan.id}
                      value={plan.id}
                      badge={badge}
                      badgeVariant={badgeVariant}
                      badgeReason={badgeReason}
                    >
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-3">
                          {/* Provider logo + name */}
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {plan.logo && (
                              <Image
                                src={plan.logo}
                                alt={plan.provider}
                                width={40}
                                height={40}
                                className="w-10 h-10 object-contain rounded flex-shrink-0"
                              />
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="text-[16px] font-semibold text-[var(--color-darkest)] truncate">
                                  {plan.provider}
                                </p>
                                {/* Green energy leaf indicator */}
                                {isElectricity && renewablePct > 0 && (
                                  <span className="flex items-center gap-0.5 text-[12px] text-[var(--color-success)] bg-[var(--color-success-light)] px-1.5 py-0.5 rounded" title={`${renewablePct}% renewable`}>
                                    <Leaf className="w-3 h-3" aria-hidden="true" />
                                    {renewablePct}%
                                  </span>
                                )}
                              </div>
                              <p className="text-[14px] text-[var(--color-dark)] truncate">
                                {plan.name}
                              </p>
                              {/* Short description from API */}
                              {plan.shortDescription && (
                                <p className="text-[13px] text-[var(--color-medium)] mt-0.5 line-clamp-1">
                                  {plan.shortDescription}
                                </p>
                              )}
                            </div>
                          </div>
                          {/* Show monthly estimate for electricity if available */}
                          {isElectricity && plan.monthlyEstimate && (
                            <p className="text-[16px] font-bold text-[var(--color-teal)] flex-shrink-0">
                              {plan.monthlyEstimate}/mo
                            </p>
                          )}
                        </div>
                        <p className="text-[14px] text-[var(--color-dark)] mt-2">
                          {plan.rate} • {plan.contractLabel}
                          {/* Show speeds for internet plans: download/upload */}
                          {isInternet && plan.downloadSpeed && (
                            <>
                              {' '}• {plan.downloadSpeed}
                              {plan.uploadSpeed ? `/${plan.uploadSpeed}` : ''} Mbps
                            </>
                          )}
                        </p>
                        {/* Show data cap for internet - Unlimited or specific cap */}
                        {isInternet && (
                          <p className="text-[14px] text-[var(--color-dark)] mt-1 flex items-center gap-1">
                            <Wifi className="w-3.5 h-3.5" aria-hidden="true" />
                            {plan.dataCapGB === null || plan.dataCapGB === undefined || plan.dataCapGB === 0
                              ? 'Unlimited data'
                              : `${plan.dataCapGB} GB data cap`}
                          </p>
                        )}
                        {/* Show contract commitment info with actual cancellation fee from API */}
                        {isElectricity && plan.contractMonths && plan.contractMonths > 0 && plan.cancellationFee && (
                          <p className="text-[14px] text-[var(--color-dark)] mt-1">
                            ${plan.cancellationFee} early cancellation fee
                          </p>
                        )}
                        {/* Show lead time - when service starts */}
                        {plan.leadTime !== undefined && plan.leadTime > 0 && (
                          <p className="text-[14px] text-[var(--color-teal)] mt-1">
                            Service starts in {plan.leadTime} {plan.leadTime === 1 ? 'day' : 'days'}
                          </p>
                        )}
                        {/* Show WHY this is the cheapest plan - inline text */}
                        {isCheapest && badgeReason && (
                          <p className="text-[14px] text-[var(--color-teal)] font-medium mt-1">
                            {badgeReason}
                          </p>
                        )}
                        {/* Show features from API bulletPoints */}
                        {plan.features && plan.features.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {plan.features.slice(0, 3).map((feature, i) => (
                              <span
                                key={i}
                                className="text-[12px] text-[var(--color-dark)] bg-[var(--color-lightest)] px-2 py-0.5 rounded"
                              >
                                {feature}
                              </span>
                            ))}
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
                  className="text-[var(--color-dark)] text-[14px] font-medium mt-3 underline"
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
