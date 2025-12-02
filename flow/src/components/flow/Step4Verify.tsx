'use client';

import { useState, useCallback } from 'react';
import { useFlowStore } from '@/store/flowStore';
import { Button, FileUpload } from '@/components/ui';
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react';

function Step4Verify() {
  const { address, documents, uploadDocument, removeDocument, prevStep, nextStep } =
    useFlowStore();

  const [errors, setErrors] = useState<{ id?: string; proof?: string }>({});

  const handleSubmit = useCallback(() => {
    const newErrors: { id?: string; proof?: string } = {};

    if (!documents.id || documents.id.status !== 'uploaded') {
      newErrors.id = 'Upload your driver\'s license or state ID.';
    }

    if (!documents.proofOfResidence || documents.proofOfResidence.status !== 'uploaded') {
      newErrors.proof = 'Upload a lease agreement or utility bill.';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      nextStep();
    }
  }, [documents, nextStep]);

  const handleIdUpload = (file: File) => {
    setErrors((prev) => ({ ...prev, id: undefined }));
    uploadDocument('id', file);
  };

  const handleProofUpload = (file: File) => {
    setErrors((prev) => ({ ...prev, proof: undefined }));
    uploadDocument('proofOfResidence', file);
  };

  return (
    <div className="space-y-8">
      {/* Heading */}
      <div>
        <h1 className="text-[44px] font-bold text-[var(--color-darkest)] leading-tight mb-3">
          Verify your identity
        </h1>
        <p className="text-[18px] text-[var(--color-dark)]">
          Upload a photo ID and proof of residence to complete setup.
        </p>
      </div>

      {/* Document uploads */}
      <div className="space-y-6">
        <FileUpload
          label="Driver's license or state ID"
          requirement="Required by utility providers"
          hint="Accepted formats: JPG, PNG, PDF (max 10MB)"
          accept=".jpg,.jpeg,.png,.pdf"
          maxSizeMB={10}
          document={documents.id}
          onUpload={handleIdUpload}
          onRemove={() => removeDocument('id')}
          error={errors.id}
        />

        <FileUpload
          label="Lease agreement or utility bill"
          requirement={`Proves you'll live at ${address?.street || 'your new address'}`}
          hint="First page with your name and address is fine."
          accept=".jpg,.jpeg,.png,.pdf"
          maxSizeMB={10}
          document={documents.proofOfResidence}
          onUpload={handleProofUpload}
          onRemove={() => removeDocument('proofOfResidence')}
          error={errors.proof}
        />
      </div>

      {/* Privacy notice */}
      <div className="flex items-start gap-2 p-4 rounded-xl bg-[var(--color-lightest)] text-[14px] text-[var(--color-dark)]">
        <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p>
          Your documents are encrypted and only shared with utility providers. We delete
          them after setup.
        </p>
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
          Submit for review
        </Button>
      </div>
    </div>
  );
}

export { Step4Verify };
