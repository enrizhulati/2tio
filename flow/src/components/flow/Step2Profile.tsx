'use client';

import { useState, useCallback } from 'react';
import { useFlowStore } from '@/store/flowStore';
import { Button, Input, Checkbox } from '@/components/ui';
import { ChevronLeft, ChevronRight, Mail, Phone, User } from 'lucide-react';

function Step2Profile() {
  const { profile, setProfile, nextStep, prevStep } = useFlowStore();

  // Local form state
  const [firstName, setFirstName] = useState(profile?.firstName || '');
  const [lastName, setLastName] = useState(profile?.lastName || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [smsOptIn, setSmsOptIn] = useState(profile?.smsOptIn || false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Format phone as user types
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'Enter your first name.';
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Enter your last name.';
    }

    if (!email.trim()) {
      newErrors.email = 'Enter your email address.';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Enter a valid email address like name@example.com';
    }

    const phoneNumbers = phone.replace(/\D/g, '');
    if (!phone.trim()) {
      newErrors.phone = 'Enter your phone number.';
    } else if (phoneNumbers.length !== 10) {
      newErrors.phone = 'Enter a 10-digit phone number.';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone,
        smsOptIn,
      });
      nextStep();
    }
  }, [firstName, lastName, email, phone, smsOptIn, setProfile, nextStep]);

  return (
    <div className="space-y-8">
      {/* Heading */}
      <div>
        <h1 className="text-[44px] font-bold text-[var(--color-darkest)] leading-tight mb-3">
          Tell us about yourself
        </h1>
        <p className="text-[18px] text-[var(--color-dark)]">
          We need this information to set up your accounts.
        </p>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Name row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="First name"
            placeholder="Jane"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            error={errors.firstName}
            autoComplete="given-name"
          />
          <Input
            label="Last name"
            placeholder="Smith"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            error={errors.lastName}
            autoComplete="family-name"
          />
        </div>

        <Input
          label="Email"
          hint="We'll send your confirmation and account details here."
          type="email"
          placeholder="jane@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          leftIcon={<Mail className="w-5 h-5" />}
          autoComplete="email"
        />

        <Input
          label="Phone"
          hint="For account setup and service notifications."
          type="tel"
          placeholder="(555) 123-4567"
          value={phone}
          onChange={handlePhoneChange}
          error={errors.phone}
          leftIcon={<Phone className="w-5 h-5" />}
          autoComplete="tel"
        />

        {/* SMS opt-in */}
        <Checkbox
          label="Text me service updates and reminders"
          checked={smsOptIn}
          onChange={(e) => setSmsOptIn(e.target.checked)}
        />
      </div>

      {/* Navigation buttons */}
      <div className="pt-4 flex flex-col sm:flex-row gap-3">
        <Button
          variant="secondary"
          onClick={prevStep}
          leftIcon={<ChevronLeft className="w-5 h-5" />}
          className="sm:order-1"
        >
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          fullWidth
          rightIcon={<ChevronRight className="w-5 h-5" />}
          className="sm:order-2 sm:flex-1"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}

export { Step2Profile };
