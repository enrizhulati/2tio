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
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import { SERVICE_INFO, type ServicePlan, type TwotionCheckoutStep } from '@/types/flow';

// Generate terms text for a vendor - uses API terms if available, otherwise generic
function generateVendorTerms(
  vendorName: string,
  serviceName: string,
  plan?: ServicePlan,
  checkoutStep?: TwotionCheckoutStep
): string {
  // If API provides terms, use them
  if (checkoutStep?.Terms) {
    return checkoutStep.Terms;
  }

  // Generate dynamic terms based on the vendor
  const cancellationFee = plan?.cancellationFee || 175;
  const contractMonths = plan?.contractMonths || 0;

  if (serviceName === 'Electricity') {
    return `By submitting my order, I authorize 2turniton and ${vendorName} to perform all necessary tasks to establish my electricity service.

I authorize ${vendorName} to perform a credit check and review my credit and payment history with credit reporting agencies, its affiliates, and my previous electricity providers based on my information that I have provided for enrollment. I understand that if I do not qualify under ${vendorName}'s deposit criteria and payment history, I may be required to pay a deposit and/or an outstanding balance before my enrollment is complete.

Yes, I wish to sign up for the selected electricity plan.

I have read and understand the Terms of Service, Electricity Facts Label, and Your Rights as a Customer documents. I understand that a move-in or switch request can only be made by the electric service applicant or the applicant's authorized agent and I agree to allow ${vendorName} to perform the necessary tasks to complete a switch or move-in for my service with ${vendorName}. I verify that I am at least 18 years of age and legally authorized to buy electricity for the address listed above. I agree to pay the price as specified above. The price includes (i) the Energy Charge, (ii) applicable Transmission and Distribution Utility ("TDU") tariff, if not included in the Energy Charge, (iii) a Monthly Base charge per ESI-ID, and (iv) all recurring charges. This price does not include applicable federal, state and local taxes or any fees (including gross receipt tax reimbursement), other amounts charged by a governmental entity, and all other non-recurring fees. By selecting a specific switch date, you are agreeing to an off-cycle switch fee that is passed-through from your TDSP without mark-up. See the Electricity Facts Label for specific pricing details. If a switch transaction was selected, I may rescind this agreement without penalty before midnight of the third federal business day after submitting this enrollment. ${contractMonths > 0 ? `After this period or for new (move-in) service, an early termination fee of $${cancellationFee} per ESIID for each full and partial year left in the term will apply if I cancel this agreement without providing proof of my move (including a forwarding address).` : ''} I can print and save copies of these documents which are provided above. I understand that after submitting this enrollment request, I will also receive a copy of these documents, including the Terms of Service, from ${vendorName} via email, and upon request, via US mail, and that these documents, including the Terms of Service, explain all the terms of the agreement and how to exercise the right of rescission, if applicable.`;
  }

  if (serviceName === 'Internet') {
    return `By submitting my order, I authorize 2turniton and ${vendorName} to perform all necessary tasks to establish my internet service.

I authorize ${vendorName} to verify my identity and service address. I understand that service availability and pricing may vary based on my location.

Yes, I wish to sign up for the selected internet plan.

I have read and understand the Terms of Service. I verify that I am at least 18 years of age and legally authorized to establish internet service for the address listed above.${contractMonths > 0 ? ` I understand that an early termination fee of $${cancellationFee} may apply if I cancel this agreement before the end of my ${contractMonths}-month contract term.` : ''} I understand that after submitting this enrollment request, I will receive confirmation from ${vendorName} via email.`;
  }

  // Generic terms for other services (water, etc.)
  return `By submitting my order, I authorize 2turniton and ${vendorName} to perform all necessary tasks to establish my ${serviceName.toLowerCase()} service.

I have read and understand the Terms of Service. I verify that I am at least 18 years of age and legally authorized to establish ${serviceName.toLowerCase()} service for the address listed above. I understand that after submitting this enrollment request, I will receive confirmation from ${vendorName} via email.`;
}

// Per-vendor terms expandable section
function VendorTermsSection({
  vendorName,
  serviceName,
  plan,
  checkoutStep,
  isExpanded,
  onToggle,
}: {
  vendorName: string;
  serviceName: string;
  plan?: ServicePlan;
  checkoutStep?: TwotionCheckoutStep;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const termsText = generateVendorTerms(vendorName, serviceName, plan, checkoutStep);
  const sectionId = `terms-${serviceName.toLowerCase()}`;

  return (
    <div className="border border-[var(--color-light)] rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-[var(--color-lightest)] transition-colors"
        aria-expanded={expanded}
        aria-controls={sectionId}
      >
        <div className="flex items-center gap-2">
          <ServiceIcon type={serviceName.toLowerCase() as 'electricity' | 'internet' | 'water'} size="sm" />
          <span className="text-[16px] font-medium text-[var(--color-darkest)]">
            {vendorName} - {serviceName}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-[var(--color-dark)]" aria-hidden="true" />
        ) : (
          <ChevronDown className="w-5 h-5 text-[var(--color-dark)]" aria-hidden="true" />
        )}
      </button>
      {expanded && (
        <div id={sectionId} className="px-4 pb-4 border-t border-[var(--color-light)]">
          <p className="text-[16px] text-[var(--color-dark)] whitespace-pre-line leading-relaxed pt-4">
            {termsText}
          </p>
          {/* Show document links if available from API */}
          {(checkoutStep?.TermsUrl || checkoutStep?.EflUrl || checkoutStep?.YracUrl) && (
            <div className="mt-4 flex flex-wrap gap-3">
              {checkoutStep.TermsUrl && (
                <a
                  href={checkoutStep.TermsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[16px] text-[var(--color-teal)] underline"
                >
                  Terms of Service
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </a>
              )}
              {checkoutStep.EflUrl && (
                <a
                  href={checkoutStep.EflUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[16px] text-[var(--color-teal)] underline"
                >
                  Electricity Facts Label
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </a>
              )}
              {checkoutStep.YracUrl && (
                <a
                  href={checkoutStep.YracUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[16px] text-[var(--color-teal)] underline"
                >
                  Your Rights as a Customer
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

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
    checkoutSteps,
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
              <CheckCircle className="w-10 h-10 text-[var(--color-success)]" aria-hidden="true" />
            </div>
          </div>

          {/* Heading */}
          <div>
            <h1 className="text-[32px] sm:text-[44px] font-bold text-[var(--color-darkest)] leading-[1.15] tracking-tight mb-3">
              You're all set!
            </h1>
            <p className="text-[18px] text-[var(--color-dark)]">
              Your utilities are being set up — one less thing to worry about.
            </p>
          </div>

          {/* Order card */}
          <div className="p-6 rounded-xl border-2 border-[var(--color-light)] bg-white text-left">
            <p className="text-[16px] text-[var(--color-dark)] mb-2">
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
            <div className="space-y-4">
              {orderConfirmation.services.map((service) => {
                const plan = selectedPlans[service.type];
                return (
                  <div key={service.type} className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <ServiceIcon type={service.type} size="md" />
                      <div>
                        <p className="text-[16px] font-medium text-[var(--color-darkest)]">
                          {SERVICE_INFO[service.type].label}
                        </p>
                        <p className="text-[16px] text-[var(--color-dark)]">
                          {service.provider}
                        </p>
                        {/* Show lead time from API */}
                        {plan?.leadTime !== undefined && plan.leadTime > 0 && (
                          <p className="text-[16px] text-[var(--color-teal)]">
                            Ready in {plan.leadTime} {plan.leadTime === 1 ? 'day' : 'days'}
                          </p>
                        )}
                        {/* Show vendor contact from API */}
                        {plan?.vendorPhone && (
                          <p className="text-[16px] text-[var(--color-dark)] mt-1">
                            Support: <a href={`tel:${plan.vendorPhone}`} className="text-[var(--color-teal)] underline">{plan.vendorPhone}</a>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[16px] text-[var(--color-warning)]">
                      <Clock className="w-4 h-4" aria-hidden="true" />
                      <span>Setting up...</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Deposit Notice - shown if credit check requires deposit */}
          {orderConfirmation.depositRequired && orderConfirmation.depositAmount && (
            <div className="p-4 rounded-xl bg-[var(--color-warning-light)] border border-[var(--color-warning)]">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[var(--color-warning)] flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-[16px] font-medium text-[var(--color-darkest)]">
                    Deposit Required: ${orderConfirmation.depositAmount.toLocaleString()}
                  </p>
                  <p className="text-[16px] text-[var(--color-dark)] mt-1">
                    {orderConfirmation.depositVendorName && (
                      <span>{orderConfirmation.depositVendorName} requires a deposit </span>
                    )}
                    {orderConfirmation.depositReason || 'based on the credit check for your account.'}
                    {' '}You'll receive payment instructions via email.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* CP Order Link - for completing electric enrollment */}
          {orderConfirmation.cpOrderUrl && (
            <div className="p-5 rounded-xl bg-[var(--color-teal-light)] border-2 border-[var(--color-teal)]">
              <div className="flex items-start gap-3">
                <ServiceIcon type="electricity" size="md" />
                <div className="flex-1">
                  <p className="text-[18px] font-semibold text-[var(--color-darkest)]">
                    Complete your electricity enrollment
                  </p>
                  <p className="text-[16px] text-[var(--color-dark)] mt-1">
                    Click below to finalize your electricity service with your selected provider.
                  </p>
                  <a
                    href={orderConfirmation.cpOrderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-3 px-5 py-3 bg-[var(--color-teal)] text-white text-[16px] font-semibold rounded-lg hover:bg-[var(--color-teal-dark)] transition-colors"
                  >
                    Complete enrollment
                    <ExternalLink className="w-4 h-4" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* What happens next - Practical UI: Use proper numbered list semantics */}
          <div className="text-left">
            <h2 className="text-[22px] font-semibold text-[var(--color-darkest)] mb-4">
              What happens next
            </h2>
            <ol className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[var(--color-teal)] text-white text-[16px] font-bold flex items-center justify-center" aria-hidden="true">
                  1
                </span>
                <span className="text-[16px] text-[var(--color-darkest)]">
                  We submit your information to each provider
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[var(--color-teal)] text-white text-[16px] font-bold flex items-center justify-center" aria-hidden="true">
                  2
                </span>
                <span className="text-[16px] text-[var(--color-darkest)]">
                  You&apos;ll receive confirmation emails within 24 hours
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[var(--color-teal)] text-white text-[16px] font-bold flex items-center justify-center" aria-hidden="true">
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
            <p className="text-[16px] text-[var(--color-dark)]">
              <strong>Check your email</strong> — confirmation from each provider within 24 hours.
              Not in your inbox? Check spam or reach out to us.
            </p>
          </div>

          {/* Support */}
          <p className="text-[16px] text-[var(--color-dark)]">
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
              <Download className="w-4 h-4" aria-hidden="true" />
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
        <h1 className="text-[32px] sm:text-[44px] font-bold text-[var(--color-darkest)] leading-[1.15] tracking-tight mb-3">
          Review your order
        </h1>
        <p className="text-[18px] text-[var(--color-dark)]">
          Double-check everything looks right, then you're done.
        </p>
      </div>

      {/* Payment clarity notice - Practical UI: Front-load important info */}
      <div className="p-4 rounded-xl bg-[var(--color-teal-light)] border border-[var(--color-teal)]">
        <p className="text-[16px] font-medium text-[var(--color-darkest)]">
          No payment due today
        </p>
        <p className="text-[16px] text-[var(--color-dark)] mt-1">
          You'll receive separate bills from each provider after service starts on {moveInDate && formatDate(moveInDate)}.
        </p>
        <p className="text-[16px] text-[var(--color-dark)] mt-2">
          If a provider requires a deposit based on your credit history, we'll let you know the amount after checkout.
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
              className="flex items-center gap-1 text-[var(--color-teal)] text-[16px] font-medium underline"
            >
              <Edit2 className="w-3 h-3" aria-hidden="true" />
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
              className="flex items-center gap-1 text-[var(--color-teal)] text-[16px] font-medium underline"
            >
              <Edit2 className="w-3 h-3" aria-hidden="true" />
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
              className="flex items-center gap-1 text-[var(--color-teal)] text-[16px] font-medium underline"
            >
              <Edit2 className="w-3 h-3" aria-hidden="true" />
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
                <p className="text-[16px] text-[var(--color-dark)] ml-7">
                  {selectedPlans.water.provider}
                </p>
                <p className="text-[16px] text-[var(--color-dark)] ml-7">
                  {selectedPlans.water.name} • Setup: ${selectedPlans.water.setupFee}
                </p>
                {/* Show vendor contact from API */}
                {selectedPlans.water.vendorPhone && (
                  <p className="text-[16px] text-[var(--color-dark)] ml-7 mt-1">
                    Support: <a href={`tel:${selectedPlans.water.vendorPhone}`} className="text-[var(--color-teal)] underline">{selectedPlans.water.vendorPhone}</a>
                  </p>
                )}
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
                <p className="text-[16px] text-[var(--color-dark)] ml-7">
                  {selectedPlans.electricity.provider} - {selectedPlans.electricity.name}
                </p>
                <p className="text-[16px] text-[var(--color-dark)] ml-7">
                  {selectedPlans.electricity.rate} • {selectedPlans.electricity.contractLabel}
                </p>
                {/* Show ETF info from API */}
                {selectedPlans.electricity.contractMonths && selectedPlans.electricity.contractMonths > 0 && selectedPlans.electricity.cancellationFee && (
                  <p className="text-[16px] text-[var(--color-dark)] ml-7 mt-1">
                    Early cancellation fee: ${selectedPlans.electricity.cancellationFee}
                  </p>
                )}
                {/* Show lead time from API */}
                {selectedPlans.electricity.leadTime !== undefined && selectedPlans.electricity.leadTime > 0 && (
                  <p className="text-[16px] text-[var(--color-teal)] ml-7 mt-1">
                    Service starts in {selectedPlans.electricity.leadTime} {selectedPlans.electricity.leadTime === 1 ? 'day' : 'days'}
                  </p>
                )}
                {/* Show vendor contact from API */}
                {selectedPlans.electricity.vendorPhone && (
                  <p className="text-[16px] text-[var(--color-dark)] ml-7 mt-1">
                    Support: <a href={`tel:${selectedPlans.electricity.vendorPhone}`} className="text-[var(--color-teal)] underline">{selectedPlans.electricity.vendorPhone}</a>
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
                <p className="text-[16px] text-[var(--color-dark)] ml-7">
                  {selectedPlans.internet.provider} - {selectedPlans.internet.name}
                </p>
                <p className="text-[16px] text-[var(--color-dark)] ml-7">
                  {selectedPlans.internet.rate} • {selectedPlans.internet.contractLabel}
                </p>
                {/* Show lead time from API */}
                {selectedPlans.internet.leadTime !== undefined && selectedPlans.internet.leadTime > 0 && (
                  <p className="text-[16px] text-[var(--color-teal)] ml-7 mt-1">
                    Service starts in {selectedPlans.internet.leadTime} {selectedPlans.internet.leadTime === 1 ? 'day' : 'days'}
                  </p>
                )}
                {/* Show vendor contact from API */}
                {selectedPlans.internet.vendorPhone && (
                  <p className="text-[16px] text-[var(--color-dark)] ml-7 mt-1">
                    Support: <a href={`tel:${selectedPlans.internet.vendorPhone}`} className="text-[var(--color-teal)] underline">{selectedPlans.internet.vendorPhone}</a>
                  </p>
                )}
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
              className="flex items-center gap-1 text-[var(--color-teal)] text-[16px] font-medium underline"
            >
              <Edit2 className="w-3 h-3" aria-hidden="true" />
              Edit
            </button>
          </div>
          <div className="space-y-1">
            {documents.id?.status === 'uploaded' && (
              <div className="flex items-center gap-2 text-[16px] text-[var(--color-success)]">
                <Check className="w-4 h-4" aria-hidden="true" />
                <span>Driver's license uploaded</span>
              </div>
            )}
            {documents.proofOfResidence?.status === 'uploaded' && (
              <div className="flex items-center gap-2 text-[16px] text-[var(--color-success)]">
                <Check className="w-4 h-4" aria-hidden="true" />
                <span>Lease agreement uploaded</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Terms Agreement - Per vendor */}
      <div className="border-b border-[var(--color-light)] pb-6">
        <h3 className="text-[22px] font-semibold text-[var(--color-darkest)] mb-4">
          Terms of Service
        </h3>

        {/* Show terms per selected service/vendor */}
        <div className="space-y-3 mb-4">
          {selectedServices.electricity && selectedPlans.electricity && (
            <VendorTermsSection
              vendorName={selectedPlans.electricity.provider}
              serviceName="Electricity"
              plan={selectedPlans.electricity}
              checkoutStep={checkoutSteps?.find(s => s.VendorName === selectedPlans.electricity?.provider)}
              isExpanded={termsExpanded}
              onToggle={() => setTermsExpanded(!termsExpanded)}
            />
          )}

          {selectedServices.internet && selectedPlans.internet && (
            <VendorTermsSection
              vendorName={selectedPlans.internet.provider}
              serviceName="Internet"
              plan={selectedPlans.internet}
              checkoutStep={checkoutSteps?.find(s => s.VendorName === selectedPlans.internet?.provider)}
              isExpanded={termsExpanded}
              onToggle={() => setTermsExpanded(!termsExpanded)}
            />
          )}

          {selectedServices.water && selectedPlans.water && (
            <VendorTermsSection
              vendorName={selectedPlans.water.provider}
              serviceName="Water"
              plan={selectedPlans.water}
              checkoutStep={checkoutSteps?.find(s => s.VendorName === selectedPlans.water?.provider)}
              isExpanded={termsExpanded}
              onToggle={() => setTermsExpanded(!termsExpanded)}
            />
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
            I agree to the Terms of Service for each selected provider and the{' '}
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
          loadingText="Setting up your utilities..."
          className="sm:flex-1"
          disabled={!termsAgreed}
          aria-describedby={!termsAgreed ? "terms-required-message" : undefined}
        >
          Set up my utilities
        </Button>
      </div>
      {/* Practical UI: Disabled button explanation with aria-describedby */}
      {!termsAgreed && (
        <p id="terms-required-message" className="text-[16px] text-[var(--color-dark)] text-center">
          Check the box above to continue
        </p>
      )}
    </div>
  );
}

export { Step5Review };
