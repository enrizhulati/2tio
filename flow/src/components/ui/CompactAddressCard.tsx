'use client';

import { MapPin, Navigation, Edit2, Home } from 'lucide-react';

// Format number with commas (e.g., 1234 -> "1,234")
const formatNumber = (num: number): string => num.toLocaleString();

interface CompactAddressCardProps {
  address: {
    street: string;
    unit?: string;
    city: string;
    state: string;
    zip: string;
    formatted?: string;
  };
  moveInDate: string;
  homeDetails?: {
    foundDetails?: boolean;
    squareFootage?: number;
    yearBuilt?: number;
    annualKwh?: number;
  };
  onEdit: () => void;
}

// Compact map preview - small square (80x80px) with location marker
function CompactMapPreview() {
  return (
    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-[var(--color-lightest)] flex-shrink-0">
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
            backgroundSize: '20px 20px'
          }}
        />

        {/* Roads */}
        <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-white opacity-60" />
        <div className="absolute top-0 bottom-0 left-1/3 w-1 bg-white opacity-40" />

        {/* Location marker */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
          <div className="relative">
            <div className="w-6 h-6 bg-[var(--color-coral)] rounded-full flex items-center justify-center shadow-md">
              <MapPin className="w-3.5 h-3.5 text-white" aria-hidden="true" />
            </div>
            <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-[var(--color-coral)] rotate-45" />
          </div>
        </div>

        {/* Pulse animation */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-8 h-8 rounded-full bg-[var(--color-coral)] opacity-20 animate-ping" />
        </div>
      </div>
    </div>
  );
}

// Format date for display
const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export function CompactAddressCard({ address, moveInDate, homeDetails, onEdit }: CompactAddressCardProps) {
  return (
    <div className="p-4 sm:p-5 rounded-xl border-2 border-[var(--color-light)] bg-white">
      <div className="flex items-start gap-4">
        {/* Address info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[18px] font-semibold text-[var(--color-darkest)] leading-snug">
                {address.street}
                {address.unit && `, ${address.unit}`}
              </p>
              <p className="text-[16px] text-[var(--color-dark)]">
                {address.city}, {address.state} {address.zip}
              </p>
            </div>
            <button
              onClick={onEdit}
              className="flex items-center gap-1 text-[var(--color-teal)] text-[16px] font-medium hover:underline flex-shrink-0"
              aria-label="Edit address"
            >
              <Edit2 className="w-4 h-4" aria-hidden="true" />
              Edit
            </button>
          </div>

          <p className="text-[16px] text-[var(--color-dark)] mt-2">
            Move-in: {formatDate(moveInDate)}
          </p>

          {/* Home details if available */}
          {homeDetails?.foundDetails && (
            <div className="flex items-center gap-1.5 mt-2 text-[16px] text-[var(--color-teal)]">
              <Home className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              <span className="font-medium">
                {formatNumber(homeDetails.squareFootage || 0)} sq ft
                {homeDetails.yearBuilt ? ` • Built ${homeDetails.yearBuilt}` : ''}
                {homeDetails.annualKwh ? ` • ~${formatNumber(homeDetails.annualKwh)} kWh/yr` : ''}
              </span>
            </div>
          )}
        </div>

        {/* Compact map preview */}
        <CompactMapPreview />
      </div>
    </div>
  );
}
