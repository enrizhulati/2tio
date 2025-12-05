'use client';

import { useState, useEffect } from 'react';
import { useFlowStore } from '@/store/flowStore';
import {
  FlowLayout,
  Step1Address,
  Step2Profile,
  Step3Services,
  Step4Verify,
  Step5Review,
} from '@/components/flow';

export default function Home() {
  const currentStep = useFlowStore((state) => state.currentStep);
  const [isMounted, setIsMounted] = useState(false);
  const [isMockConfirmation, setIsMockConfirmation] = useState(false);

  // Wait for client-side hydration before rendering dynamic content
  useEffect(() => {
    setIsMounted(true);
    // DEBUG: Check for ?mock_confirmation=1 to bypass flow and show confirmation directly
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('mock_confirmation') === '1') {
      setIsMockConfirmation(true);
    }
  }, []);

  // Show loading state during SSR/hydration to prevent mismatch
  if (!isMounted) {
    return (
      <FlowLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-pulse text-[var(--color-medium)]">Loading...</div>
        </div>
      </FlowLayout>
    );
  }

  // Flow order: Address → Services → Profile → Verify → Confirm (5 steps)
  const renderStep = () => {
    // In mock mode, always render Step5Review to test confirmation UI
    if (isMockConfirmation) {
      return <Step5Review />;
    }

    switch (currentStep) {
      case 1:
        return <Step1Address />; // Address entry + confirmation modal
      case 2:
        return <Step3Services />; // Service selection
      case 3:
        return <Step2Profile />; // Your details
      case 4:
        return <Step4Verify />; // Verification
      case 5:
        return <Step5Review />; // Confirmation
      default:
        return <Step1Address />;
    }
  };

  return <FlowLayout>{renderStep()}</FlowLayout>;
}
