'use client';

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

  // Flow order: Address → Services → Profile → Verify → Confirm (5 steps)
  const renderStep = () => {
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
