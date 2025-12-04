'use client';

import { useState, useRef, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui';
import {
  Mail,
  Send,
  CheckCircle,
  AlertCircle,
  Building2,
  Zap,
  MapPin,
  Calendar,
  User,
} from 'lucide-react';
import type { OrderConfirmation, UserProfile, SelectedPlans } from '@/types/flow';

interface LandlordEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderConfirmation: OrderConfirmation;
  profile: UserProfile;
  selectedPlans: SelectedPlans;
}

type SendStatus = 'idle' | 'sending' | 'success' | 'error';

function LandlordEmailModal({
  isOpen,
  onClose,
  orderConfirmation,
  profile,
  selectedPlans,
}: LandlordEmailModalProps) {
  const [landlordEmail, setLandlordEmail] = useState('');
  const [sendStatus, setSendStatus] = useState<SendStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && sendStatus === 'idle') {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, sendStatus]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Delay reset to allow close animation
      setTimeout(() => {
        setLandlordEmail('');
        setSendStatus('idle');
        setErrorMessage('');
      }, 300);
    }
  }, [isOpen]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get electricity provider name from selected plans
  const electricityProvider = selectedPlans.electricity?.provider || 'Your electricity provider';

  // Format full address
  const fullAddress = `${orderConfirmation.address.street}${
    orderConfirmation.address.unit ? `, ${orderConfirmation.address.unit}` : ''
  }, ${orderConfirmation.address.city}, ${orderConfirmation.address.state} ${orderConfirmation.address.zip}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(landlordEmail)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    setSendStatus('sending');
    setErrorMessage('');

    try {
      const response = await fetch('/api/send-landlord-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          landlordEmail,
          customerName: `${profile.firstName} ${profile.lastName}`,
          customerEmail: profile.email,
          customerPhone: profile.phone,
          accountNumber: orderConfirmation.orderId,
          providerName: electricityProvider,
          serviceAddress: fullAddress,
          serviceStartDate: orderConfirmation.moveInDate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send email');
      }

      setSendStatus('success');
    } catch (error) {
      console.error('Error sending landlord email:', error);
      setSendStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to send email. Please try again.');
    }
  };

  // Success state
  if (sendStatus === 'success') {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Email Sent!" size="md">
        <div className="text-center py-6 space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-[var(--color-success-light)] flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-[var(--color-success)]" aria-hidden="true" />
            </div>
          </div>

          <div>
            <h3 className="text-[20px] font-semibold text-[var(--color-darkest)] mb-2">
              Your account details have been sent
            </h3>
            <p className="text-[16px] text-[var(--color-dark)]">
              We sent your electricity account information to:
            </p>
            <p className="text-[16px] font-medium text-[var(--color-darkest)] mt-1">
              {landlordEmail}
            </p>
          </div>

          <div className="pt-4">
            <Button fullWidth onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Email your leasing office"
      size="md"
    >
      <div className="space-y-5">
        {/* Value prop callout */}
        <div className="bg-[var(--color-teal-light)] rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Building2 className="w-5 h-5 text-[var(--color-teal)] flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-[16px] font-medium text-[var(--color-darkest)]">
                In Texas, you need your electricity account number to get your keys
              </p>
              <p className="text-[16px] text-[var(--color-dark)] mt-1">
                We'll send a professional email with your account details to your leasing office.
              </p>
            </div>
          </div>
        </div>

        {/* Account details preview */}
        <div className="border border-[var(--color-light)] rounded-xl p-4 bg-[var(--color-lightest)]">
          <h3 className="text-[14px] font-bold text-[var(--color-dark)] uppercase tracking-wider mb-3">
            What we'll send
          </h3>
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-[16px]">
              <Zap className="w-4 h-4 text-[var(--color-coral)] flex-shrink-0" aria-hidden="true" />
              <span className="text-[var(--color-dark)]">Account:</span>
              <span className="font-semibold text-[var(--color-darkest)]">{orderConfirmation.orderId}</span>
            </div>
            <div className="flex items-center gap-2 text-[16px]">
              <Building2 className="w-4 h-4 text-[var(--color-coral)] flex-shrink-0" aria-hidden="true" />
              <span className="text-[var(--color-dark)]">Provider:</span>
              <span className="text-[var(--color-darkest)]">{electricityProvider}</span>
            </div>
            <div className="flex items-start gap-2 text-[16px]">
              <MapPin className="w-4 h-4 text-[var(--color-coral)] flex-shrink-0 mt-0.5" aria-hidden="true" />
              <span className="text-[var(--color-dark)]">Address:</span>
              <span className="text-[var(--color-darkest)]">{fullAddress}</span>
            </div>
            <div className="flex items-center gap-2 text-[16px]">
              <Calendar className="w-4 h-4 text-[var(--color-coral)] flex-shrink-0" aria-hidden="true" />
              <span className="text-[var(--color-dark)]">Starts:</span>
              <span className="text-[var(--color-darkest)]">{formatDate(orderConfirmation.moveInDate)}</span>
            </div>
            <div className="flex items-center gap-2 text-[16px]">
              <User className="w-4 h-4 text-[var(--color-coral)] flex-shrink-0" aria-hidden="true" />
              <span className="text-[var(--color-dark)]">Account holder:</span>
              <span className="text-[var(--color-darkest)]">{profile.firstName} {profile.lastName}</span>
            </div>
          </div>
        </div>

        {/* Email form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="landlord-email"
              className="block text-[16px] font-medium text-[var(--color-darkest)] mb-2"
            >
              Leasing office or landlord email
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-medium)]"
                aria-hidden="true"
              />
              <input
                ref={inputRef}
                id="landlord-email"
                type="email"
                value={landlordEmail}
                onChange={(e) => {
                  setLandlordEmail(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="leasing@apartments.com"
                className={`
                  w-full pl-11 pr-4 py-3 rounded-lg border-2 text-[16px]
                  focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors
                  ${errorMessage
                    ? 'border-[var(--color-error)] focus:ring-[var(--color-error)]'
                    : 'border-[var(--color-light)] focus:border-[var(--color-teal)] focus:ring-[var(--color-teal)]'
                  }
                `}
                disabled={sendStatus === 'sending'}
              />
            </div>
            {errorMessage && (
              <div className="flex items-center gap-2 mt-2 text-[var(--color-error)]">
                <AlertCircle className="w-4 h-4" aria-hidden="true" />
                <span className="text-[16px]">{errorMessage}</span>
              </div>
            )}
            <p className="text-[16px] text-[var(--color-dark)] mt-2">
              This is usually an email like leasing@, office@, or your property manager's email.
            </p>
          </div>

          {/* Error from API */}
          {sendStatus === 'error' && !errorMessage && (
            <div className="p-4 rounded-lg bg-[var(--color-error-light)] border border-[var(--color-error)]">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[var(--color-error)] flex-shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-[16px] text-[var(--color-error)]">
                  Something went wrong. Please try again or copy your account number manually.
                </p>
              </div>
            </div>
          )}

          {/* Submit button */}
          <div className="pt-2">
            <Button
              type="submit"
              fullWidth
              isLoading={sendStatus === 'sending'}
              loadingText="Sending email..."
              disabled={!landlordEmail.trim()}
              rightIcon={<Send className="w-4 h-4" />}
            >
              Send account details
            </Button>
          </div>
        </form>

        {/* Alternative action */}
        <div className="text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-[16px] text-[var(--color-dark)] underline hover:text-[var(--color-darkest)] transition-colors py-2"
          >
            I'll do this later
          </button>
        </div>
      </div>
    </Modal>
  );
}

export { LandlordEmailModal };
