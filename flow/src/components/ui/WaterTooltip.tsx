'use client';

import { useState } from 'react';

// Water tooltip with touch/keyboard access - Practical UI: Match checkbox size
export function WaterTooltip() {
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
