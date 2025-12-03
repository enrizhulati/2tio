'use client';

import { Modal } from '@/components/ui/Modal';
import { ServiceIcon } from '@/components/ui';
import { SERVICE_INFO, type OrderConfirmation, type UserProfile, type SelectedPlans } from '@/types/flow';
import { Clock, MapPin, User, FileText, Calendar, Mail, Phone, CreditCard } from 'lucide-react';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderConfirmation: OrderConfirmation;
  profile: UserProfile;
  selectedPlans: SelectedPlans;
}

function OrderDetailsModal({
  isOpen,
  onClose,
  orderConfirmation,
  profile,
  selectedPlans,
}: OrderDetailsModalProps) {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatShortDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Order Details" size="lg">
      <div className="space-y-5 sm:space-y-6">
        {/* Order header - stacks on mobile */}
        <div className="bg-[var(--color-lightest)] rounded-xl p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <div>
              <p className="text-[16px] text-[var(--color-dark)]">Order Number</p>
              <p className="text-[16px] sm:text-[18px] font-bold text-[var(--color-darkest)]">
                {orderConfirmation.orderId}
              </p>
            </div>
            <div className="sm:text-right">
              <p className="text-[16px] text-[var(--color-dark)]">Order Date</p>
              <p className="text-[16px] sm:text-[16px] font-medium text-[var(--color-darkest)]">
                {formatShortDate(new Date().toISOString())}
              </p>
            </div>
          </div>
        </div>

        {/* Service Address */}
        <div>
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-coral)]" aria-hidden="true" />
            <h3 className="text-[16px] sm:text-[18px] font-semibold text-[var(--color-darkest)]">
              Service Address
            </h3>
          </div>
          <div className="pl-6 sm:pl-7">
            <p className="text-[16px] sm:text-[16px] text-[var(--color-darkest)]">
              {orderConfirmation.address.street}
              {orderConfirmation.address.unit && `, ${orderConfirmation.address.unit}`}
            </p>
            <p className="text-[16px] sm:text-[16px] text-[var(--color-dark)]">
              {orderConfirmation.address.city}, {orderConfirmation.address.state}{' '}
              {orderConfirmation.address.zip}
            </p>
          </div>
        </div>

        {/* Move-in Date */}
        <div>
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-coral)]" aria-hidden="true" />
            <h3 className="text-[16px] sm:text-[18px] font-semibold text-[var(--color-darkest)]">
              Service Start Date
            </h3>
          </div>
          <div className="pl-6 sm:pl-7">
            <p className="text-[16px] sm:text-[16px] text-[var(--color-darkest)]">
              {formatDate(orderConfirmation.moveInDate)}
            </p>
          </div>
        </div>

        {/* Account Holder */}
        <div>
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-coral)]" aria-hidden="true" />
            <h3 className="text-[16px] sm:text-[18px] font-semibold text-[var(--color-darkest)]">
              Account Holder
            </h3>
          </div>
          <div className="pl-6 sm:pl-7 space-y-1">
            <p className="text-[16px] sm:text-[16px] font-medium text-[var(--color-darkest)]">
              {profile.firstName} {profile.lastName}
            </p>
            <div className="flex items-center gap-2 text-[16px] text-[var(--color-dark)]">
              <Mail className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              <span className="truncate">{profile.email}</span>
            </div>
            <div className="flex items-center gap-2 text-[16px] text-[var(--color-dark)]">
              <Phone className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              <span>{profile.phone}</span>
            </div>
          </div>
        </div>

        {/* Services */}
        <div>
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-coral)]" aria-hidden="true" />
            <h3 className="text-[16px] sm:text-[18px] font-semibold text-[var(--color-darkest)]">
              Services Ordered
            </h3>
          </div>
          <div className="space-y-3">
            {orderConfirmation.services.map((service) => {
              const plan = selectedPlans[service.type];
              return (
                <div
                  key={service.type}
                  className="p-3 sm:p-4 rounded-xl border border-[var(--color-light)] bg-white"
                >
                  {/* Service header - stacks badge below on mobile */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <ServiceIcon type={service.type} size="md" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[16px] sm:text-[16px] font-semibold text-[var(--color-darkest)]">
                          {SERVICE_INFO[service.type].label}
                        </p>
                        <p className="text-[16px] text-[var(--color-dark)]">
                          {service.provider}
                        </p>
                        {plan && (
                          <>
                            <p className="text-[16px] text-[var(--color-dark)] mt-1">
                              {plan.name} - {plan.rate}
                            </p>
                            <p className="text-[16px] text-[var(--color-dark)]">
                              {plan.contractLabel}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                    {/* Status badge - Practical UI: Minimum 12px for readable text */}
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[var(--color-warning-light)] self-start">
                      <Clock className="w-3.5 h-3.5 text-[var(--color-warning)]" aria-hidden="true" />
                      <span className="text-[12px] font-bold uppercase tracking-wider text-[var(--color-warning)] whitespace-nowrap">
                        Setting up
                      </span>
                    </div>
                  </div>
                  {plan && plan.setupFee > 0 && (
                    <div className="mt-3 pt-3 border-t border-[var(--color-light)] flex items-center gap-2">
                      <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--color-dark)]" aria-hidden="true" />
                      <span className="text-[16px] text-[var(--color-dark)]">
                        Setup fee: ${plan.setupFee}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer note */}
        <div className="bg-[var(--color-teal-light)] rounded-xl p-3 sm:p-4">
          <p className="text-[16px] text-[var(--color-darkest)]">
            You'll receive confirmation emails from each provider within 24 hours.
            Your services will be active on your move-in date.
          </p>
        </div>
      </div>
    </Modal>
  );
}

export { OrderDetailsModal };
