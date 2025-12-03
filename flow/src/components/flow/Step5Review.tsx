'use client';

import { useState } from 'react';
import { useFlowStore } from '@/store/flowStore';
import { Button, ServiceIcon } from '@/components/ui';
import { Confetti } from '@/components/ui/Confetti';
import { OrderDetailsModal } from './OrderDetailsModal';
import { generateOrderPdf } from '@/lib/generatePdf';
import {
  ChevronLeft,
  Edit2,
  Check,
  Download,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { SERVICE_INFO } from '@/types/flow';

const TERMS_TEXT = `By submitting my order, I authorize 2turniton and Fulcrum Retail Energy, LLC d/b/a Amigo Energy to perform all necessary tasks to establish my electricity service.

I authorize Amigo Energy to perform a credit check and review my credit and payment history with credit reporting agencies, its affiliates, and my previous electricity providers based on my information that I have provided for enrollment. I understand that if I do not qualify under Amigo Energy's deposit criteria and payment history, I may be required to pay a deposit and/or an outstanding balance before my enrollment is complete.

Yes, I wish to sign up for the selected electricity plan.

I have read and understand the Terms of Service, Electricity Facts Label, and Your Rights as a Customer documents. I understand that a move-in or switch request can only be made by the electric service applicant or the applicant's authorized agent and I agree to allow Amigo Energy to perform the necessary tasks to complete a switch or move-in for my service with Amigo Energy. I verify that I am at least 18 years of age and legally authorized to buy electricity for the address listed above. I agree to pay the price as specified above. The price includes (i) the Energy Charge, (ii) applicable Transmission and Distribution Utility ("TDU") tariff, if not included in the Energy Charge, (iii) a Monthly Base charge per ESI-ID, and (iv) all recurring charges. This price does not include applicable federal, state and local taxes or any fees (including gross receipt tax reimbursement), other amounts charged by a governmental entity, and all other non-recurring fees. By selecting a specific switch date, you are agreeing to an off-cycle switch fee that is passed-through from your TDSP without mark-up. See the Electricity Facts Label for specific pricing details. If a switch transaction was selected, I may rescind this agreement without penalty before midnight of the third federal business day after submitting this enrollment. After this period or for new (move-in) service, an early termination fee of $175 per ESIID for each full and partial year left in the term will apply if I cancel this agreement without providing proof of my move (including a forwarding address). I can print and save copies of these documents which are provided above. I understand that after submitting this enrollment request, I will also receive a copy of these documents, including the Terms of Service, from Amigo Energy via email, and upon request, via US mail, and that these documents, including the Terms of Service, explain all the terms of the agreement and how to exercise the right of rescission, if applicable.

I understand that any Nights Free plans are not available for premises with distributed generation. If solar panels, energy storage, or similar systems are installed before or after the authorization of the contract for any Nights Free plans, Amigo Energy may switch my ESIID to a Variable Price Product with 14 days' notice. I will refer to the Terms of Service and Electricity Facts Label (EFL); and I will contact Amigo Energy before installing such systems to explore eligible plan options.`;

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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [termsExpanded, setTermsExpanded] = useState(false);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDownloadPdf = () => {
    if (orderConfirmation && profile) {
      generateOrderPdf({
        orderConfirmation,
        profile,
        selectedPlans,
      });
    }
  };

  // Show confirmation page after order is placed
  if (orderConfirmation) {
    return (
      <>
        <Confetti />
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

          {/* What happens next - Practical UI: Use proper numbered list semantics */}
          <div className="text-left">
            <h2 className="text-[22px] font-semibold text-[var(--color-darkest)] mb-4">
              What happens next
            </h2>
            <ol className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[var(--color-teal)] text-white text-[14px] font-bold flex items-center justify-center" aria-hidden="true">
                  1
                </span>
                <span className="text-[16px] text-[var(--color-darkest)]">
                  We submit your information to each provider
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[var(--color-teal)] text-white text-[14px] font-bold flex items-center justify-center" aria-hidden="true">
                  2
                </span>
                <span className="text-[16px] text-[var(--color-darkest)]">
                  You&apos;ll receive confirmation emails within 24 hours
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[var(--color-teal)] text-white text-[14px] font-bold flex items-center justify-center" aria-hidden="true">
                  3
                </span>
                <span className="text-[16px] text-[var(--color-darkest)]">
                  Utilities will be active on your move-in date
                </span>
              </li>
            </ol>
          </div>

          {/* Important reminder - Practical UI: Front-load key info */}
          <div className="p-4 rounded-xl bg-[var(--color-lightest)] text-left">
            <p className="text-[14px] text-[var(--color-dark)]">
              <strong>Check your email</strong> — You'll receive confirmation from each provider within 24 hours.
              If you don't see it, check your spam folder or contact us.
            </p>
          </div>

          {/* Support */}
          <p className="text-[14px] text-[var(--color-dark)]">
            Questions? Contact{' '}
            <a
              href="mailto:support@2tion.com"
              className="text-[var(--color-teal)] underline"
            >
              support@2tion.com
            </a>
          </p>

          {/* Actions */}
          <div className="space-y-3">
            <Button fullWidth onClick={() => setIsModalOpen(true)}>
              View order details
            </Button>
            <button
              onClick={handleDownloadPdf}
              className="w-full flex items-center justify-center gap-2 text-[var(--color-teal)] text-[16px] font-medium underline"
            >
              <Download className="w-4 h-4" />
              Download confirmation (PDF)
            </button>
          </div>
        </div>

        {/* Order Details Modal */}
        {profile && (
          <OrderDetailsModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            orderConfirmation={orderConfirmation}
            profile={profile}
            selectedPlans={selectedPlans}
          />
        )}
      </>
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

      {/* Payment clarity notice - Practical UI: Front-load important info */}
      <div className="p-4 rounded-xl bg-[var(--color-teal-light)] border border-[var(--color-teal)]">
        <p className="text-[16px] font-medium text-[var(--color-darkest)]">
          No payment due today
        </p>
        <p className="text-[14px] text-[var(--color-dark)] mt-1">
          You'll receive separate bills from each provider after service starts on {moveInDate && formatDate(moveInDate)}.
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
              className="flex items-center gap-1 text-[var(--color-teal)] text-[14px] font-medium underline"
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

        {/* Profile section - step 3 in new order */}
        <div className="border-b border-[var(--color-light)] pb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[22px] font-semibold text-[var(--color-darkest)]">
              Your information
            </h3>
            <button
              onClick={() => goToStep(3)}
              className="flex items-center gap-1 text-[var(--color-teal)] text-[14px] font-medium underline"
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
              onClick={() => goToStep(2)}
              className="flex items-center gap-1 text-[var(--color-teal)] text-[14px] font-medium underline"
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
                {/* Show ETF info for contracts - Practical UI: Be upfront about commitments */}
                {selectedPlans.electricity.contractMonths && selectedPlans.electricity.contractMonths > 0 && (
                  <p className="text-[13px] text-[var(--color-medium)] ml-7 mt-1">
                    Early cancellation fee: $175 per remaining year
                  </p>
                )}
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
              className="flex items-center gap-1 text-[var(--color-teal)] text-[14px] font-medium underline"
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

      {/* Terms Agreement */}
      <div className="border-b border-[var(--color-light)] pb-6">
        <h3 className="text-[22px] font-semibold text-[var(--color-darkest)] mb-4">
          Terms of Service
        </h3>

        {/* Expandable terms - Practical UI: Accessible disclosure */}
        <div className="border border-[var(--color-light)] rounded-lg overflow-hidden mb-4">
          <button
            onClick={() => setTermsExpanded(!termsExpanded)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-[var(--color-lightest)] transition-colors"
            aria-expanded={termsExpanded}
            aria-controls="terms-content"
          >
            <span className="text-[16px] text-[var(--color-darkest)]">
              {termsExpanded ? 'Hide terms and conditions' : 'View full terms and conditions'}
            </span>
            {termsExpanded ? (
              <ChevronUp className="w-5 h-5 text-[var(--color-dark)]" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-5 h-5 text-[var(--color-dark)]" aria-hidden="true" />
            )}
          </button>
          {termsExpanded && (
            <div id="terms-content" className="px-4 pb-4 max-h-64 overflow-y-auto border-t border-[var(--color-light)]">
              <p className="text-[14px] text-[var(--color-dark)] whitespace-pre-line leading-relaxed pt-4">
                {TERMS_TEXT}
              </p>
            </div>
          )}
        </div>

        {/* Checkbox with proper touch target (48px) */}
        <label className="flex items-start gap-4 cursor-pointer group p-3 -mx-3 rounded-lg hover:bg-[var(--color-lightest)] transition-colors">
          <div className="flex items-center justify-center w-6 h-6 mt-0.5 flex-shrink-0">
            <input
              type="checkbox"
              checked={termsAgreed}
              onChange={(e) => setTermsAgreed(e.target.checked)}
              className="w-5 h-5 rounded border-2 border-[var(--color-medium)] text-[var(--color-teal)] focus:ring-2 focus:ring-[var(--color-teal)] focus:ring-offset-2 cursor-pointer"
            />
          </div>
          <span className="text-[16px] leading-relaxed text-[var(--color-darkest)]">
            I agree to the{' '}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setTermsExpanded(true);
              }}
              className="text-[var(--color-teal)] underline hover:text-[var(--color-teal-dark)]"
            >
              Terms of Service
            </button>
            {' '}and{' '}
            <a
              href="/privacy"
              target="_blank"
              onClick={(e) => e.stopPropagation()}
              className="text-[var(--color-teal)] underline hover:text-[var(--color-teal-dark)]"
            >
              Privacy Policy
            </a>
            , and authorize 2turniton.com to set up utilities on my behalf.
          </span>
        </label>
      </div>

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
          disabled={!termsAgreed}
          aria-describedby={!termsAgreed ? "terms-required-message" : undefined}
        >
          Place order
        </Button>
      </div>
      {/* Practical UI: Disabled button explanation with aria-describedby */}
      {!termsAgreed && (
        <p id="terms-required-message" className="text-[14px] text-[var(--color-dark)] text-center">
          Agree to the Terms of Service to continue
        </p>
      )}
    </div>
  );
}

export { Step5Review };
