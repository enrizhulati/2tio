'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { useFlowStore } from '@/store/flowStore';
import { Button, Input, FileUpload } from '@/components/ui';
import { ChevronLeft, ChevronRight, Lock, Loader2, Building2, AlertCircle } from 'lucide-react';
import type { TwotionCheckoutStep, TwotionCheckoutQuestion } from '@/types/flow';

// Question input component
function QuestionInput({
  question,
  value,
  onChange,
  error,
}: {
  question: TwotionCheckoutQuestion;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  if (question.type === 'select' && question.options) {
    const selectId = `select-${question.id}`;
    const errorId = `error-${question.id}`;
    return (
      <div className="space-y-1.5">
        <label
          htmlFor={selectId}
          className="block text-[16px] font-medium text-[var(--color-darkest)]"
        >
          {question.question}
          {question.required && <span className="text-[var(--color-error)]"> *</span>}
        </label>
        <select
          id={selectId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-required={question.required}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={`
            w-full px-4 py-3 rounded-xl border-2 bg-white
            text-[16px] text-[var(--color-darkest)]
            transition-colors duration-150
            focus:outline-none focus:border-[var(--color-teal)]
            ${error ? 'border-[var(--color-error)]' : 'border-[var(--color-border)] hover:border-[var(--color-dark)]'}
          `}
        >
          <option value="">Select...</option>
          {question.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {error && (
          <div id={errorId} className="flex items-center gap-2 text-[16px] text-[var(--color-error)]" role="alert">
            <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }

  if (question.type === 'date') {
    // Add hint for DOB explaining why it's needed
    const isDob = question.id === 'dob' || question.question.toLowerCase().includes('birth');
    return (
      <Input
        label={question.question}
        hint={isDob ? "Used to verify your identity with providers" : undefined}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={question.required}
        error={error}
      />
    );
  }

  if (question.type === 'ssn') {
    const inputId = `ssn-${question.id}`;
    const errorId = `error-${question.id}`;
    const hintId = `hint-${question.id}`;

    // Format SSN as user types
    const formatSSN = (input: string) => {
      const digits = input.replace(/\D/g, '').slice(0, 9);
      if (digits.length <= 3) return digits;
      if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
      return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
    };

    // Practical UI: Hints and errors should appear ABOVE the input field
    // Practical UI: Field width should match expected input length
    return (
      <div className="space-y-2 max-w-[240px]">
        <label
          htmlFor={inputId}
          className="block text-[16px] font-semibold text-[var(--color-darkest)]"
        >
          {question.question}
          {question.required && <span className="text-[var(--color-error)]"> *</span>}
        </label>
        {/* Hint above input per Practical UI - Address credit score concern upfront */}
        <p id={hintId} className="text-[16px] text-[var(--color-dark)]">
          Soft credit check only — won't affect your credit score. Required by utility providers.
        </p>
        {/* Error above input per Practical UI - Icon + color for accessibility */}
        {error && (
          <div id={errorId} className="flex items-center gap-2 text-[16px] text-[var(--color-error)]" role="alert">
            <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}
        <input
          id={inputId}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={formatSSN(value)}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
          placeholder="XXX-XX-XXXX"
          maxLength={11}
          aria-required={question.required}
          aria-invalid={!!error}
          aria-describedby={`${hintId}${error ? ` ${errorId}` : ''}`}
          className={`
            w-full h-14 px-4 rounded-xl border-2 bg-white
            text-[16px] text-[var(--color-darkest)]
            transition-colors duration-150
            focus:outline-none focus:border-[var(--color-teal)]
            ${error ? 'border-[var(--color-error)]' : 'border-[var(--color-border)] hover:border-[var(--color-dark)]'}
          `}
        />
      </div>
    );
  }

  // Default: text input
  return (
    <Input
      label={question.question}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={question.required}
      error={error}
    />
  );
}

// Vendor checkout section
function VendorSection({
  step,
  answers,
  onAnswerChange,
  errors,
  documents,
  onDocumentUpload,
  onDocumentRemove,
}: {
  step: TwotionCheckoutStep;
  answers: Record<string, string>;
  onAnswerChange: (questionId: string, value: string) => void;
  errors: Record<string, string>;
  documents: {
    dl?: { name: string; status: string };
    lease?: { name: string; status: string };
    own?: { name: string; status: string };
  };
  onDocumentUpload: (type: 'dl' | 'lease' | 'own', file: File) => void;
  onDocumentRemove: (type: 'dl' | 'lease' | 'own') => void;
}) {
  const isGeneralStep = step.IsStepOne;

  return (
    <div className="space-y-6">
      {/* Vendor header (only for vendor-specific steps) */}
      {!isGeneralStep && step.VendorName && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--color-lightest)] border border-[var(--color-light)]">
          {step.Logo ? (
            <Image
              src={step.Logo}
              alt={step.VendorName}
              width={48}
              height={48}
              className="w-12 h-12 object-contain"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-[var(--color-teal-light)] flex items-center justify-center">
              <Building2 className="w-6 h-6 text-[var(--color-teal)]" aria-hidden="true" />
            </div>
          )}
          <div>
            <p className="text-[16px] font-semibold text-[var(--color-darkest)]">
              {step.VendorName}
            </p>
            {step.LeadTime > 0 && (
              <p className="text-[16px] text-[var(--color-dark)]">
                Service starts in {step.LeadTime} business day{step.LeadTime > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Application questions */}
      {step.AppQuestions.length > 0 && (
        <div className="space-y-4">
          {step.AppQuestions.map((q) => (
            <QuestionInput
              key={q.id}
              question={q}
              value={answers[q.id] || ''}
              onChange={(value) => onAnswerChange(q.id, value)}
              error={errors[q.id]}
            />
          ))}
        </div>
      )}

      {/* Document uploads */}
      {(step.IsDLUpload || step.IsLeaseUpload || step.IsOwnUpload) && (
        <div className="space-y-4">
          {step.IsDLUpload && (
            <FileUpload
              label="Driver's license or state ID"
              requirement="Required for identity verification"
              hint="Accepted formats: JPG, PNG, PDF (max 10MB)"
              accept=".jpg,.jpeg,.png,.pdf"
              maxSizeMB={10}
              document={documents.dl ? {
                id: 'dl',
                name: documents.dl.name,
                size: 0,
                type: '',
                status: documents.dl.status as 'uploading' | 'uploaded' | 'error',
              } : undefined}
              onUpload={(file) => onDocumentUpload('dl', file)}
              onRemove={() => onDocumentRemove('dl')}
              error={errors['dl']}
            />
          )}

          {step.IsLeaseUpload && (
            <FileUpload
              label="Lease agreement"
              requirement="Proves your residency at this address"
              hint="First page with your name and address is fine"
              accept=".jpg,.jpeg,.png,.pdf"
              maxSizeMB={10}
              document={documents.lease ? {
                id: 'lease',
                name: documents.lease.name,
                size: 0,
                type: '',
                status: documents.lease.status as 'uploading' | 'uploaded' | 'error',
              } : undefined}
              onUpload={(file) => onDocumentUpload('lease', file)}
              onRemove={() => onDocumentRemove('lease')}
              error={errors['lease']}
            />
          )}

          {step.IsOwnUpload && (
            <FileUpload
              label="Proof of ownership"
              requirement="Deed, mortgage statement, or property tax bill"
              hint="Document showing you own the property"
              accept=".jpg,.jpeg,.png,.pdf"
              maxSizeMB={10}
              document={documents.own ? {
                id: 'own',
                name: documents.own.name,
                size: 0,
                type: '',
                status: documents.own.status as 'uploading' | 'uploaded' | 'error',
              } : undefined}
              onUpload={(file) => onDocumentUpload('own', file)}
              onRemove={() => onDocumentRemove('own')}
              error={errors['own']}
            />
          )}
        </div>
      )}
    </div>
  );
}

function Step4Verify() {
  const {
    checkoutSteps,
    checkoutAnswers,
    documents: storeDocuments,
    fetchCheckoutSteps,
    setCheckoutAnswer,
    uploadDocument,
    removeDocument,
    prevStep,
    nextStep,
  } = useFlowStore();

  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Map store documents to component's expected format
  const documents = {
    dl: storeDocuments.id ? { name: storeDocuments.id.name, status: storeDocuments.id.status } : undefined,
    lease: storeDocuments.proofOfResidence ? { name: storeDocuments.proofOfResidence.name, status: storeDocuments.proofOfResidence.status } : undefined,
    own: storeDocuments.proofOfResidence ? { name: storeDocuments.proofOfResidence.name, status: storeDocuments.proofOfResidence.status } : undefined,
  };

  // Mock checkout steps for fallback when API fails
  const mockCheckoutSteps: TwotionCheckoutStep[] = [
    {
      VendorId: null,
      VendorName: null,
      Logo: null,
      AppQuestions: [
        {
          id: 'ssn',
          question: 'Social Security Number',
          type: 'ssn',
          required: true,
        },
        {
          id: 'dob',
          question: 'Date of Birth',
          type: 'date',
          required: true,
        },
      ],
      DocumentList: [],
      IsStepOne: true,
      LeadTime: 0,
      IsDLUpload: true,
      IsLeaseUpload: false,
      IsOwnUpload: false,
    },
  ];

  // Fetch checkout steps on mount
  useEffect(() => {
    const loadSteps = async () => {
      setIsLoading(true);
      await fetchCheckoutSteps();
      setIsLoading(false);
    };
    loadSteps();
  }, [fetchCheckoutSteps]);

  // Use mock steps if API returned nothing
  const effectiveSteps = (checkoutSteps && checkoutSteps.length > 0) ? checkoutSteps : mockCheckoutSteps;

  const handleDocumentUpload = useCallback((type: 'dl' | 'lease' | 'own', file: File) => {
    // Map component types to store types
    if (type === 'dl') {
      uploadDocument('id', file);
    } else if (type === 'lease' || type === 'own') {
      uploadDocument('proofOfResidence', file);
    }
  }, [uploadDocument]);

  const handleDocumentRemove = useCallback((type: 'dl' | 'lease' | 'own') => {
    // Map component types to store types
    if (type === 'dl') {
      removeDocument('id');
    } else if (type === 'lease' || type === 'own') {
      removeDocument('proofOfResidence');
    }
  }, [removeDocument]);

  const validateAndSubmit = useCallback(() => {
    const newErrors: Record<string, string> = {};

    // Validate all required questions
    effectiveSteps?.forEach((step) => {
      step.AppQuestions.forEach((q) => {
        if (q.required && !checkoutAnswers[q.id]) {
          // Generate specific error based on question type
          if (q.type === 'date') {
            newErrors[q.id] = 'Select a date';
          } else if (q.type === 'select') {
            newErrors[q.id] = 'Select an option';
          } else {
            newErrors[q.id] = `Enter your ${q.question.toLowerCase()}`;
          }
        }

        // SSN validation - Practical UI: Be direct, avoid "Please"
        if (q.type === 'ssn' && checkoutAnswers[q.id]) {
          const digits = checkoutAnswers[q.id].replace(/\D/g, '');
          if (digits.length !== 9) {
            newErrors[q.id] = 'Enter a valid 9-digit SSN';
          } else if (
            digits === '000000000' ||
            digits.startsWith('000') ||
            digits.slice(3, 5) === '00' ||
            digits.slice(5) === '0000' ||
            digits.startsWith('666') ||
            digits.startsWith('9')
          ) {
            // IRS invalid SSN patterns
            newErrors[q.id] = 'Enter a valid SSN';
          }
        }
      });

      // Validate required documents - Practical UI: Direct, concise error messages
      if (step.IsDLUpload && (!documents.dl || documents.dl.status !== 'uploaded')) {
        newErrors['dl'] = 'Upload your ID to continue';
      }
      if (step.IsLeaseUpload && (!documents.lease || documents.lease.status !== 'uploaded')) {
        newErrors['lease'] = 'Upload your lease agreement to continue';
      }
      if (step.IsOwnUpload && (!documents.own || documents.own.status !== 'uploaded')) {
        newErrors['own'] = 'Upload proof of ownership to continue';
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      nextStep();
    }
  }, [effectiveSteps, checkoutAnswers, documents, nextStep]);

  // Loading state - skeleton for better perceived performance
  if (isLoading) {
    return (
      <div className="space-y-8" aria-busy="true" aria-label="Loading verification requirements">
        {/* Heading skeleton */}
        <div>
          <div className="h-12 w-3/4 bg-[var(--color-light)] rounded-lg animate-pulse mb-3" />
          <div className="h-5 w-1/2 bg-[var(--color-light)] rounded animate-pulse" />
        </div>

        {/* Form skeleton */}
        <div className="p-6 rounded-xl border-2 border-[var(--color-light)] space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-light)] animate-pulse" />
            <div className="h-6 w-40 bg-[var(--color-light)] rounded animate-pulse" />
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-32 bg-[var(--color-light)] rounded animate-pulse" />
              <div className="h-14 w-full bg-[var(--color-light)] rounded-xl animate-pulse" />
            </div>
          ))}
        </div>

        {/* Button skeleton */}
        <div className="pt-4 flex gap-3">
          <div className="h-14 w-24 bg-[var(--color-light)] rounded-xl animate-pulse" />
          <div className="h-14 flex-1 bg-[var(--color-light)] rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  // Separate general step and vendor steps
  const generalStep = effectiveSteps?.find((s) => s.IsStepOne);
  const vendorSteps = effectiveSteps?.filter((s) => !s.IsStepOne) || [];

  return (
    <div className="space-y-8">
      {/* Heading */}
      <div>
        <h1 className="text-[32px] sm:text-[44px] font-bold text-[var(--color-darkest)] leading-[1.15] tracking-tight mb-3">
          Complete your application
        </h1>
        <p className="text-[18px] text-[var(--color-dark)]">
          {vendorSteps.length > 0
            ? `Answer a few questions from your utility provider${vendorSteps.length > 1 ? 's' : ''}.`
            : 'Verify your identity to complete setup.'}
        </p>
      </div>

      {/* General questions first */}
      {generalStep && (
        <VendorSection
          step={generalStep}
          answers={checkoutAnswers}
          onAnswerChange={setCheckoutAnswer}
          errors={errors}
          documents={documents}
          onDocumentUpload={handleDocumentUpload}
          onDocumentRemove={handleDocumentRemove}
        />
      )}

      {/* Vendor-specific sections */}
      {vendorSteps.map((step, index) => (
        <div key={step.VendorId || index}>
          {/* Divider between vendors */}
          {index > 0 && <hr className="border-[var(--color-light)]" />}
          <VendorSection
            step={step}
            answers={checkoutAnswers}
            onAnswerChange={setCheckoutAnswer}
            errors={errors}
            documents={documents}
            onDocumentUpload={handleDocumentUpload}
            onDocumentRemove={handleDocumentRemove}
          />
        </div>
      ))}

      {/* Privacy and credit check notice */}
      <div className="space-y-3">
        <div className="flex items-start gap-2 p-4 rounded-xl bg-[var(--color-lightest)] text-[16px] text-[var(--color-dark)]">
          <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <p>
            Your information is encrypted and only shared with your selected utility providers.
            We securely store your SSN only for this transaction — it's not retained after setup.
          </p>
        </div>
        <p className="text-[16px] text-[var(--color-dark)] px-1">
          If a provider requires a deposit based on credit history, we'll let you know the amount before finalizing.
        </p>
      </div>

      {/* Navigation buttons */}
      <div className="pt-4 flex flex-col-reverse sm:flex-row gap-3">
        <Button
          variant="secondary"
          onClick={prevStep}
          leftIcon={<ChevronLeft className="w-5 h-5" />}
        >
          Back
        </Button>
        <Button
          onClick={validateAndSubmit}
          fullWidth
          rightIcon={<ChevronRight className="w-5 h-5" />}
          className="sm:flex-1"
        >
          Review and submit
        </Button>
      </div>
    </div>
  );
}

export { Step4Verify };
