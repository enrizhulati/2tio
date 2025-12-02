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

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Address />;
      case 2:
        return <Step2Profile />;
      case 3:
        return <Step3Services />;
      case 4:
        return <Step4Verify />;
      case 5:
        return <Step5Review />;
      default:
        return <Step1Address />;
    }
  };

  return <FlowLayout>{renderStep()}</FlowLayout>;
}
