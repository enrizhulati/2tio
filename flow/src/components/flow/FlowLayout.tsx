'use client';

import { type ReactNode, useEffect } from 'react';
import { useFlowStore } from '@/store/flowStore';
import { Home, MapPin, User, Zap, Settings, CheckCircle } from 'lucide-react';

interface FlowLayoutProps {
  children: ReactNode;
}

// Logo component matching 2TurnItOn brand
function Logo() {
  return (
    <div className="flex items-center gap-3">
      {/* House icon with smile */}
      <div className="relative w-12 h-12 bg-[var(--color-coral)] rounded-xl flex items-center justify-center">
        <Home className="w-6 h-6 text-white" strokeWidth={2.5} aria-hidden="true" />
        {/* Smile curve */}
        <svg
          className="absolute bottom-2.5 left-1/2 -translate-x-1/2"
          width="16"
          height="7"
          viewBox="0 0 14 6"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M1 1C3 4 5 5 7 5C9 5 11 4 13 1"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
      {/* Brand text */}
      <span className="text-[28px] font-bold tracking-tight">
        <span className="text-[var(--color-darkest)]">2TurnIt</span>
        <span className="text-[var(--color-coral)]">On</span>
      </span>
    </div>
  );
}

// Step configuration - user-centered microcopy
// Order: Address → Services → Your details → Verify → Confirm
// (Services before Profile so "Choose my services" CTA is fulfilled immediately)
const STEPS = [
  { step: 1, label: 'Your address', icon: MapPin },
  { step: 2, label: 'Services', icon: Zap },
  { step: 3, label: 'Your details', icon: User },
  { step: 4, label: 'Verify', icon: Settings },
  { step: 5, label: 'Confirm', icon: CheckCircle },
];

function SidebarNav() {
  const currentStep = useFlowStore((state) => state.currentStep);
  const orderConfirmation = useFlowStore((state) => state.orderConfirmation);

  return (
    <nav className="space-y-1">
      {STEPS.map(({ step, label, icon: Icon }) => {
        const isActive = step === currentStep;
        const isCompleted = step < currentStep || orderConfirmation;
        const isUpcoming = step > currentStep && !orderConfirmation;

        return (
          <div
            key={step}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
              ${isActive ? 'bg-white shadow-sm' : ''}
              ${isCompleted ? 'opacity-60' : ''}
            `}
          >
            {/* Step indicator - 8px dots for proper visibility */}
            <div className="relative flex-shrink-0">
              {isActive ? (
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-coral)] ring-4 ring-[var(--color-coral-light)]" />
              ) : isCompleted ? (
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-teal)]" />
              ) : (
                <div className="w-2.5 h-2.5 rounded-full border-2 border-[var(--color-medium)]" />
              )}
            </div>

            {/* Label */}
            <span
              className={`
                text-[16px] font-medium
                ${isActive ? 'text-[var(--color-coral)]' : 'text-[var(--color-dark)]'}
              `}
            >
              {label}
            </span>
          </div>
        );
      })}
    </nav>
  );
}

function ProgressBar() {
  const currentStep = useFlowStore((state) => state.currentStep);
  const progress = (currentStep / 5) * 100;

  return (
    <div className="h-1.5 bg-[var(--color-light)] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full bg-[var(--color-coral)] transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

function FlowLayout({ children }: FlowLayoutProps) {
  const currentStep = useFlowStore((state) => state.currentStep);
  const orderConfirmation = useFlowStore((state) => state.orderConfirmation);
  const availabilityChecked = useFlowStore((state) => state.availabilityChecked);
  const initializeUser = useFlowStore((state) => state.initializeUser);

  // Initialize 2TIO user session on mount
  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  // Scroll to top when step changes or availability is checked
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentStep, availabilityChecked, orderConfirmation]);

  return (
    <div className="min-h-screen flex">
      {/* Left Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-[var(--color-sidebar-bg)] border-r border-[var(--color-light)]">
        {/* Logo */}
        <div className="p-6 pb-8">
          <Logo />
        </div>

        {/* Navigation */}
        <div className="flex-1 px-4">
          <SidebarNav />
        </div>

        {/* Footer - Practical UI: Links need sufficient touch targets */}
        <div className="p-6 text-[14px] text-[var(--color-dark)]">
          <div className="flex items-center gap-1 mb-2">
            <svg className="w-4 h-4 text-[var(--color-teal)]" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>256-bit encryption</span>
          </div>
          <div className="flex gap-1">
            <a href="#" className="underline text-[var(--color-dark)] hover:text-[var(--color-teal)] transition-colors py-2 px-1">
              Help
            </a>
            <a href="#" className="underline text-[var(--color-dark)] hover:text-[var(--color-teal)] transition-colors py-2 px-1">
              Privacy
            </a>
            <a href="#" className="underline text-[var(--color-dark)] hover:text-[var(--color-teal)] transition-colors py-2 px-1">
              Terms
            </a>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-[var(--color-light)] px-4 py-3">
          <div className="flex items-center justify-between">
            <Logo />
          </div>
        </header>

        {/* Progress Bar */}
        {!orderConfirmation && (
          <div className="px-6 lg:px-12 pt-6 lg:pt-8">
            <ProgressBar />
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 flex items-start justify-center px-6 lg:px-12 py-8 lg:py-12">
          <div className="w-full max-w-xl animate-fade-in">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

export { FlowLayout };
