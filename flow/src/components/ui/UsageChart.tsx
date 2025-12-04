'use client';

import { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Home, Info } from 'lucide-react';

interface UsageChartProps {
  usage: number[];  // 12-month kWh array [Jan...Dec]
  homeDetails?: {
    squareFootage: number;
    yearBuilt: number;
    annualKwh: number;
  };
  className?: string;
}

const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const SUMMER_MONTHS = [5, 6, 7]; // June, July, August (0-indexed)

function UsageChart({ usage, homeDetails, className = '' }: UsageChartProps) {
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);

  // Transform usage array into chart data
  const chartData = useMemo(() => {
    return usage.map((kWh, index) => ({
      month: MONTHS[index],
      kWh,
      isSummer: SUMMER_MONTHS.includes(index),
    }));
  }, [usage]);

  // Calculate totals
  const annualKwh = homeDetails?.annualKwh || usage.reduce((sum, val) => sum + val, 0);
  const formattedAnnualKwh = annualKwh.toLocaleString();

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ value: number }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const monthIndex = MONTHS.indexOf(label || '');
      const fullMonths = ['January', 'February', 'March', 'April', 'May', 'June',
                         'July', 'August', 'September', 'October', 'November', 'December'];
      return (
        <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-[var(--color-light)]">
          <p className="text-[16px] font-medium text-[var(--color-darkest)]">
            {fullMonths[monthIndex]}
          </p>
          <p className="text-[16px] text-[var(--color-dark)]">
            {payload[0].value.toLocaleString()} kWh
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`p-4 rounded-xl bg-[var(--color-lightest)] border border-[var(--color-light)] ${className}`}>
      {/* Header with info tooltip */}
      <div className="flex items-center gap-2 mb-3 relative">
        <Home className="w-4 h-4 text-[var(--color-teal)]" aria-hidden="true" />
        <span className="text-[16px] font-semibold text-[var(--color-darkest)]">
          Estimated Usage Profile
        </span>
        {/* Info tooltip - click/tap to show on mobile - Practical UI: 44px minimum touch target */}
        <button
          type="button"
          onClick={() => setShowInfoTooltip(!showInfoTooltip)}
          onMouseEnter={() => setShowInfoTooltip(true)}
          onMouseLeave={() => setShowInfoTooltip(false)}
          className="p-3 -m-3 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-teal)] focus-visible:ring-offset-2"
          aria-label="How we estimate your usage"
        >
          <Info className="w-4 h-4 text-[var(--color-dark)]" aria-hidden="true" />
        </button>

        {/* Tooltip - positioned below on right side, high z-index */}
        {showInfoTooltip && (
          <div
            role="tooltip"
            className="absolute right-0 top-full mt-2 z-[100] w-64 p-3 bg-[var(--color-darkest)] text-white text-[16px] rounded-lg shadow-xl leading-snug"
          >
            <div className="absolute -top-1.5 right-4 w-3 h-3 bg-[var(--color-darkest)] rotate-45" />
            <p className="relative z-10">
              Since you're new to this address, we estimated your usage based on the home's size and similar properties nearby.
            </p>
          </div>
        )}
      </div>

      {/* Chart - use 99% width to fix Recharts ResponsiveContainer bug */}
      <div className="h-[120px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'var(--color-dark)' }}
            />
            <YAxis
              hide
              domain={[0, 'dataMax']}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(0,0,0,0.05)' }}
            />
            <Bar
              dataKey="kWh"
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isSummer ? 'var(--color-coral)' : 'var(--color-teal)'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Home details footer */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[16px] text-[var(--color-dark)]">
        <span>Est. {formattedAnnualKwh} kWh/year</span>
        {homeDetails?.squareFootage && homeDetails.squareFootage > 0 && (
          <>
            <span className="text-[var(--color-medium)]">•</span>
            <span>{homeDetails.squareFootage.toLocaleString()} sq ft</span>
          </>
        )}
        {homeDetails?.yearBuilt && homeDetails.yearBuilt > 0 && (
          <>
            <span className="text-[var(--color-medium)]">•</span>
            <span>Built {homeDetails.yearBuilt}</span>
          </>
        )}
      </div>

      {/* Legend - Practical UI: Don't rely on color alone, use patterns/icons too */}
      <div className="flex items-center gap-4 mt-2 text-[16px] text-[var(--color-darkest)]">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-[var(--color-teal)]" aria-hidden="true" />
          <span>Regular</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-[var(--color-coral)] relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1.5 h-0.5 bg-white rounded-full" aria-hidden="true" />
            </div>
          </div>
          <span>Summer peak (Jun-Aug)</span>
        </div>
      </div>
    </div>
  );
}

export { UsageChart };
export type { UsageChartProps };
