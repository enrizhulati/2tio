'use client';

import { useFlowStore } from '@/store/flowStore';
import { Button, ServiceCard, CartSummary, DwellingTypeSelector, OwnershipQuestion } from '@/components/ui';
import { ChevronLeft, ChevronRight, Home, MapPin, Droplets, Lightbulb, Info } from 'lucide-react';
import type { WaterAnswer, OwnershipAnswer, DwellingType } from '@/types/flow';

// Format date for display
const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

// Format number with commas
const formatNumber = (num: number): string => num.toLocaleString();

// Compact map preview component
function CompactMapPreview() {
  return (
    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-[var(--color-lightest)] flex-shrink-0">
      <div className="absolute inset-0 bg-gradient-to-br from-[#E8F4F8] to-[#D4E8ED]">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(var(--color-medium) 1px, transparent 1px),
              linear-gradient(90deg, var(--color-medium) 1px, transparent 1px)
            `,
            backgroundSize: '16px 16px'
          }}
        />
        {/* Roads */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-white opacity-60" />
        <div className="absolute top-0 bottom-0 left-1/3 w-0.5 bg-white opacity-40" />
        {/* Location marker */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
          <div className="relative">
            <div className="w-5 h-5 bg-[var(--color-coral)] rounded-full flex items-center justify-center shadow-md">
              <MapPin className="w-3 h-3 text-white" aria-hidden="true" />
            </div>
            <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[var(--color-coral)] rotate-45" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Water answer summary component (shows after answering)
function WaterAnswerSummary({
  waterAnswer,
  ownershipAnswer,
  onChangeAnswer,
}: {
  waterAnswer: WaterAnswer;
  ownershipAnswer: OwnershipAnswer;
  onChangeAnswer: () => void;
}) {
  // Determine the display text based on answer
  const getAnswerText = () => {
    if (waterAnswer === 'yes_separate') {
      return 'You have your own water meter';
    } else if (waterAnswer === 'no_included') {
      return 'Water is included in your rent';
    } else if (waterAnswer === 'not_sure') {
      if (ownershipAnswer === 'renting') {
        return "You're not sure — check with your landlord";
      } else if (ownershipAnswer === 'own') {
        return "You own the home — water setup included";
      }
      return "You're not sure about water";
    }
    return '';
  };

  return (
    <div className="p-3 rounded-xl border-2 border-[var(--color-light)] bg-[#F0F9FF]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Droplets className="w-5 h-5 text-[#0EA5E9] flex-shrink-0" aria-hidden="true" />
          <span className="text-[15px] text-[var(--color-darkest)] truncate">
            {getAnswerText()}
          </span>
        </div>
        <button
          onClick={onChangeAnswer}
          className="text-[14px] text-[var(--color-teal)] font-medium underline hover:text-[var(--color-teal-hover)] transition-colors flex-shrink-0"
        >
          Change
        </button>
      </div>
    </div>
  );
}

// Water question component for apartments
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

function Step3Services() {
  const {
    address,
    moveInDate,
    homeDetails,
    selectedServices,
    expandedService,
    // Legacy (keep for backward compat)
    isApartment,
    waterAnswer,
    ownershipAnswer,
    // New dwelling type system
    dwellingType,
    dwellingTypeConfirmed,
    ownershipStatus,
    waterEligibility,
    waterOverride,
    toggleService,
    setExpandedService,
    setWaterAnswer,
    setOwnershipAnswer,
    setDwellingType,
    setOwnershipStatus,
    setWaterOverride,
    prevStep,
    nextStep,
  } = useFlowStore();

  // --- New dwelling-based water logic ---
  // Show dwelling type selector when type is ambiguous (null and not confirmed)
  const needsDwellingType = dwellingType === null && !dwellingTypeConfirmed;

  // For multi_unit, need to ask ownership to determine water eligibility
  const needsOwnershipStatus = dwellingType === 'multi_unit' && ownershipStatus === null;

  // Show water if: eligibility is required OR optional OR (not_applicable but user overrode)
  const shouldShowWater = waterEligibility !== 'not_applicable' || waterOverride;

  // Show "water handled by property" note when not_applicable and no override
  const showWaterNote = waterEligibility === 'not_applicable' && !waterOverride;

  // --- Legacy logic (fallback if new system not fully populated) ---
  // For apartments using legacy system, need to answer water question
  const needsWaterAnswer = isApartment && waterAnswer === null && dwellingType === null;
  // Has answered water question (for showing summary with change option)
  const hasAnsweredWater = isApartment && waterAnswer !== null && dwellingType === null;

  // Reset water answer to allow re-answering
  const handleChangeWaterAnswer = () => {
    setWaterAnswer(null);
    setOwnershipAnswer(null);
  };

  const selectedCount = Object.values(selectedServices).filter(Boolean).length;
  const availableServiceCount = shouldShowWater ? 3 : 2;

  const handleAddAll = () => {
    if (shouldShowWater && !selectedServices.water) toggleService('water');
    if (!selectedServices.electricity) toggleService('electricity');
    if (!selectedServices.internet) toggleService('internet');
  };

  return (
    <div className="space-y-6">
      {/* Address header */}
      {address && (
        <div className="p-4 rounded-xl border-2 border-[var(--color-light)] bg-[var(--color-lightest)]">
          <div className="flex items-start gap-3">
            {/* Compact map */}
            <CompactMapPreview />

            {/* Address info */}
            <div className="flex-1 min-w-0">
              <p className="text-[16px] font-semibold text-[var(--color-darkest)] leading-snug">
                {address.street}
                {address.unit && `, ${address.unit}`}
              </p>
              <p className="text-[14px] text-[var(--color-dark)]">
                {address.city}, {address.state} {address.zip}
              </p>
              {moveInDate && (
                <p className="text-[14px] text-[var(--color-dark)] mt-1">
                  Move-in: {formatDate(moveInDate)}
                </p>
              )}

              {/* Home details if available */}
              {homeDetails?.foundDetails && (
                <div className="flex items-center gap-1.5 mt-2 text-[13px] text-[var(--color-teal)]">
                  <Home className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                  <span className="font-medium">
                    {formatNumber(homeDetails.squareFootage || 0)} sq ft
                    {homeDetails.yearBuilt ? ` • ${homeDetails.yearBuilt}` : ''}
                  </span>
                </div>
              )}
            </div>

            {/* Change link */}
            <button
              onClick={prevStep}
              className="text-[14px] text-[var(--color-teal)] font-medium underline hover:text-[var(--color-teal-hover)] transition-colors"
            >
              Change
            </button>
          </div>
        </div>
      )}

      {/* Heading */}
      <div>
        <h1 className="text-[28px] sm:text-[35px] font-bold text-[var(--color-darkest)] leading-[1.15] tracking-tight mb-2">
          Choose your services
        </h1>
        <p className="text-[16px] text-[var(--color-dark)]">
          Pick what you need — most people finish in under a minute.
        </p>
      </div>

      {/* Dwelling type selector (when ambiguous) */}
      {needsDwellingType && (
        <div className="p-4 rounded-xl border-2 border-[var(--color-light)] bg-[var(--color-lightest)]">
          <DwellingTypeSelector
            value={dwellingType}
            onChange={setDwellingType}
          />
        </div>
      )}

      {/* Ownership question for multi-unit dwellings */}
      {needsOwnershipStatus && (
        <div className="p-4 rounded-xl border-2 border-[var(--color-light)] bg-[var(--color-lightest)]">
          <OwnershipQuestion
            value={ownershipStatus}
            onChange={setOwnershipStatus}
          />
        </div>
      )}

      {/* Water handled by property note (for apartments/renters) - Practical UI: 16px spacing, 16px+ text */}
      {showWaterNote && (
        <div className="p-5 rounded-xl border-2 border-[var(--color-light)] bg-[#F0F9FF]">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#0EA5E9]/10 flex items-center justify-center flex-shrink-0">
              <Droplets className="w-5 h-5 text-[#0EA5E9]" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <p className="text-[18px] font-semibold text-[var(--color-darkest)] mb-2">
                Water is handled by your property
              </p>
              <p className="text-[16px] text-[var(--color-dark)] mb-4 leading-relaxed">
                In apartment buildings, water is typically managed by property management and included in your rent or HOA fees.
              </p>
              <button
                onClick={() => setWaterOverride(true)}
                className="text-[16px] text-[var(--color-teal)] font-medium underline hover:text-[var(--color-teal-hover)] transition-colors"
              >
                I need water set up anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Water override active - show undo option */}
      {waterOverride && waterEligibility === 'not_applicable' && (
        <div className="p-4 rounded-xl border-2 border-[var(--color-light)] bg-[#F0F9FF]">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 min-w-0">
              <Droplets className="w-5 h-5 text-[#0EA5E9] flex-shrink-0" aria-hidden="true" />
              <span className="text-[16px] text-[var(--color-darkest)]">
                Water setup added manually
              </span>
            </div>
            <button
              onClick={() => setWaterOverride(false)}
              className="text-[16px] text-[var(--color-teal)] font-medium underline hover:text-[var(--color-teal-hover)] transition-colors flex-shrink-0"
            >
              Undo
            </button>
          </div>
        </div>
      )}

      {/* Legacy: Water question for apartments (if not answered yet) */}
      {needsWaterAnswer && (
        <WaterQuestion
          waterAnswer={waterAnswer}
          ownershipAnswer={ownershipAnswer}
          onWaterAnswerChange={setWaterAnswer}
          onOwnershipAnswerChange={setOwnershipAnswer}
        />
      )}

      {/* Legacy: Water answer summary (shows after answering, with change option) */}
      {hasAnsweredWater && (
        <WaterAnswerSummary
          waterAnswer={waterAnswer}
          ownershipAnswer={ownershipAnswer}
          onChangeAnswer={handleChangeWaterAnswer}
        />
      )}

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

      {/* Navigation buttons */}
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
        {selectedCount < availableServiceCount && !needsWaterAnswer && (
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
