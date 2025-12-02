'use client';

import { useFlowStore } from '@/store/flowStore';
import { Button, ServiceIcon } from '@/components/ui';
import {
  ChevronLeft,
  Edit2,
  Check,
  Download,
  Loader2,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { SERVICE_INFO } from '@/types/flow';

function Step5Review() {
  const {
    address,
    moveInDate,
    profile,
    selectedServices,
    selectedPlans,
    documents,
    isSubmitting,
    orderConfirmation,
    submitOrder,
    prevStep,
    goToStep,
  } = useFlowStore();

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Show confirmation page after order is placed
  if (orderConfirmation) {
    return (
      <div className="space-y-8 text-center">
        {/* Success icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-[var(--color-success-light)] flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-[var(--color-success)]" />
          </div>
        </div>

        {/* Heading */}
        <div>
          <h1 className="text-[44px] font-bold text-[var(--color-darkest)] mb-3">
            You're all set!
          </h1>
          <p className="text-[18px] text-[var(--color-dark)]">
            We're setting up your utilities now.
          </p>
        </div>

        {/* Order card */}
        <div className="p-6 rounded-xl border-2 border-[var(--color-light)] bg-white text-left">
          <p className="text-[14px] text-[var(--color-dark)] mb-2">
            Order #{orderConfirmation.orderId}
          </p>
          <p className="text-[18px] font-semibold text-[var(--color-darkest)]">
            {orderConfirmation.address.street}
            {orderConfirmation.address.unit && `, ${orderConfirmation.address.unit}`}
          </p>
          <p className="text-[16px] text-[var(--color-dark)]">
            {orderConfirmation.address.city}, {orderConfirmation.address.state}{' '}
            {orderConfirmation.address.zip}
          </p>
          <p className="text-[16px] text-[var(--color-dark)] mt-2">
            Services starting {formatDate(orderConfirmation.moveInDate)}
          </p>

          <div className="border-t border-[var(--color-light)] my-4" />

          {/* Services status */}
          <div className="space-y-3">
            {orderConfirmation.services.map((service) => (
              <div key={service.type} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ServiceIcon type={service.type} size="md" />
                  <div>
                    <p className="text-[16px] font-medium text-[var(--color-darkest)]">
                      {SERVICE_INFO[service.type].label}
                    </p>
                    <p className="text-[14px] text-[var(--color-dark)]">
                      {service.provider}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[14px] text-[var(--color-warning)]">
                  <Clock className="w-4 h-4" />
                  <span>Setting up...</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What happens next */}
        <div className="text-left">
          <h2 className="text-[22px] font-semibold text-[var(--color-darkest)] mb-4">
            What happens next
          </h2>
          <ol className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--color-teal-light)] text-[var(--color-teal)] text-[14px] font-medium flex items-center justify-center">
                1
              </span>
              <span className="text-[16px] text-[var(--color-dark)]">
                We submit your information to each provider
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--color-teal-light)] text-[var(--color-teal)] text-[14px] font-medium flex items-center justify-center">
                2
              </span>
              <span className="text-[16px] text-[var(--color-dark)]">
                You'll receive confirmation emails within 24 hours
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--color-teal-light)] text-[var(--color-teal)] text-[14px] font-medium flex items-center justify-center">
                3
              </span>
              <span className="text-[16px] text-[var(--color-dark)]">
                Utilities will be active on your move-in date
              </span>
            </li>
          </ol>
        </div>

        {/* Support */}
        <p className="text-[14px] text-[var(--color-dark)]">
          Questions? Contact{' '}
          <a
            href="mailto:support@2tion.com"
            className="text-[var(--color-teal)] hover:underline"
          >
            support@2tion.com
          </a>
        </p>

        {/* Actions */}
        <div className="space-y-3">
          <Button fullWidth disabled>View order details</Button>
          <button
            disabled
            className="w-full flex items-center justify-center gap-2 text-[var(--color-medium)] text-[16px] font-medium cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Download confirmation (PDF)
          </button>
          <p className="text-[14px] text-[var(--color-dark)] text-center">
            Order details and PDF download coming soon
          </p>
        </div>
      </div>
    );
  }

  // Show review page before order is placed
  return (
    <div className="space-y-8">
      {/* Heading */}
      <div>
        <h1 className="text-[44px] font-bold text-[var(--color-darkest)] leading-tight mb-3">
          Review your order
        </h1>
        <p className="text-[18px] text-[var(--color-dark)]">
          Make sure everything looks right before we submit.
        </p>
      </div>

      {/* Review sections */}
      <div className="space-y-6">
        {/* Address section */}
        <div className="border-b border-[var(--color-light)] pb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[22px] font-semibold text-[var(--color-darkest)]">
              Service address
            </h3>
            <button
              onClick={() => goToStep(1)}
              className="flex items-center gap-1 text-[var(--color-teal)] text-[14px] font-medium hover:underline"
            >
              <Edit2 className="w-3 h-3" />
              Edit
            </button>
          </div>
          <p className="text-[16px] text-[var(--color-darkest)]">
            {address?.street}
            {address?.unit && `, ${address.unit}`}
          </p>
          <p className="text-[16px] text-[var(--color-dark)]">
            {address?.city}, {address?.state} {address?.zip}
          </p>
          <p className="text-[16px] text-[var(--color-dark)]">
            Starting {moveInDate && formatDate(moveInDate)}
          </p>
        </div>

        {/* Profile section */}
        <div className="border-b border-[var(--color-light)] pb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[22px] font-semibold text-[var(--color-darkest)]">
              Your information
            </h3>
            <button
              onClick={() => goToStep(2)}
              className="flex items-center gap-1 text-[var(--color-teal)] text-[14px] font-medium hover:underline"
            >
              <Edit2 className="w-3 h-3" />
              Edit
            </button>
          </div>
          <p className="text-[16px] text-[var(--color-darkest)]">
            {profile?.firstName} {profile?.lastName}
          </p>
          <p className="text-[16px] text-[var(--color-dark)]">{profile?.email}</p>
          <p className="text-[16px] text-[var(--color-dark)]">{profile?.phone}</p>
        </div>

        {/* Services section */}
        <div className="border-b border-[var(--color-light)] pb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[22px] font-semibold text-[var(--color-darkest)]">
              Services
            </h3>
            <button
              onClick={() => goToStep(3)}
              className="flex items-center gap-1 text-[var(--color-teal)] text-[14px] font-medium hover:underline"
            >
              <Edit2 className="w-3 h-3" />
              Edit
            </button>
          </div>
          <div className="space-y-3">
            {selectedServices.water && selectedPlans.water && (
              <div>
                <div className="flex items-center gap-2">
                  <ServiceIcon type="water" size="md" />
                  <span className="text-[16px] font-medium text-[var(--color-darkest)]">
                    {SERVICE_INFO.water.label}
                  </span>
                </div>
                <p className="text-[14px] text-[var(--color-dark)] ml-7">
                  {selectedPlans.water.provider}
                </p>
                <p className="text-[14px] text-[var(--color-dark)] ml-7">
                  {selectedPlans.water.name} • Setup: ${selectedPlans.water.setupFee}
                </p>
              </div>
            )}

            {selectedServices.electricity && selectedPlans.electricity && (
              <div>
                <div className="flex items-center gap-2">
                  <ServiceIcon type="electricity" size="md" />
                  <span className="text-[16px] font-medium text-[var(--color-darkest)]">
                    {SERVICE_INFO.electricity.label}
                  </span>
                </div>
                <p className="text-[14px] text-[var(--color-dark)] ml-7">
                  {selectedPlans.electricity.provider} - {selectedPlans.electricity.name}
                </p>
                <p className="text-[14px] text-[var(--color-dark)] ml-7">
                  {selectedPlans.electricity.rate} • {selectedPlans.electricity.contractLabel}
                </p>
              </div>
            )}

            {selectedServices.internet && selectedPlans.internet && (
              <div>
                <div className="flex items-center gap-2">
                  <ServiceIcon type="internet" size="md" />
                  <span className="text-[16px] font-medium text-[var(--color-darkest)]">
                    {SERVICE_INFO.internet.label}
                  </span>
                </div>
                <p className="text-[14px] text-[var(--color-dark)] ml-7">
                  {selectedPlans.internet.provider} - {selectedPlans.internet.name}
                </p>
                <p className="text-[14px] text-[var(--color-dark)] ml-7">
                  {selectedPlans.internet.rate} • {selectedPlans.internet.contractLabel}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Documents section */}
        <div className="border-b border-[var(--color-light)] pb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[22px] font-semibold text-[var(--color-darkest)]">
              Documents
            </h3>
            <button
              onClick={() => goToStep(4)}
              className="flex items-center gap-1 text-[var(--color-teal)] text-[14px] font-medium hover:underline"
            >
              <Edit2 className="w-3 h-3" />
              Edit
            </button>
          </div>
          <div className="space-y-1">
            {documents.id?.status === 'uploaded' && (
              <div className="flex items-center gap-2 text-[16px] text-[var(--color-success)]">
                <Check className="w-4 h-4" />
                <span>Driver's license uploaded</span>
              </div>
            )}
            {documents.proofOfResidence?.status === 'uploaded' && (
              <div className="flex items-center gap-2 text-[16px] text-[var(--color-success)]">
                <Check className="w-4 h-4" />
                <span>Lease agreement uploaded</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legal */}
      <p className="text-[14px] text-[var(--color-dark)]">
        By placing this order, you agree to the{' '}
        <a href="#" className="text-[var(--color-teal)] underline">
          Terms of Service
        </a>{' '}
        and authorize us to set up utilities on your behalf.
      </p>

      {/* Navigation buttons - Back always left */}
      <div className="pt-4 flex flex-col-reverse sm:flex-row gap-3">
        <Button
          variant="secondary"
          onClick={prevStep}
          leftIcon={<ChevronLeft className="w-5 h-5" />}
          disabled={isSubmitting}
        >
          Back
        </Button>
        <Button
          onClick={submitOrder}
          fullWidth
          isLoading={isSubmitting}
          loadingText="Placing order..."
          className="sm:flex-1"
        >
          Place order
        </Button>
      </div>
    </div>
  );
}

export { Step5Review };
