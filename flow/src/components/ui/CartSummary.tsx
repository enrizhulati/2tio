'use client';

import { useFlowStore } from '@/store/flowStore';
import { ShoppingCart } from 'lucide-react';

// Cart summary component
export function CartSummary() {
  const { selectedServices, selectedPlans } = useFlowStore();

  // Calculate total monthly estimate
  const getMonthlyTotal = () => {
    let total = 0;

    // Water estimate from selected plan
    if (selectedServices.water && selectedPlans.water) {
      const waterRate = selectedPlans.water.rate;
      if (waterRate) {
        const match = waterRate.match(/\$?([\d.]+)/);
        if (match) total += parseFloat(match[1]);
      }
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
      <div className="flex items-center gap-2 mb-4">
        <ShoppingCart className="w-5 h-5 text-[var(--color-teal)]" aria-hidden="true" />
        <span className="text-[18px] font-bold text-[var(--color-darkest)]">
          Your services
        </span>
      </div>

      <div className="space-y-2">
        {selectedServices.water && selectedPlans.water && (
          <div className="flex justify-between text-[16px]">
            <span className="text-[var(--color-dark)]">Water</span>
            <span className="text-[var(--color-darkest)] font-medium">
              {selectedPlans.water.rate || '~$36/mo base'}
            </span>
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
