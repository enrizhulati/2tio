// Flow Types for 2TION Utility Setup

export interface Address {
  street: string;
  unit?: string;
  city: string;
  state: string;
  zip: string;
  formatted: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  smsOptIn: boolean;
}

export interface ServicePlan {
  id: string;
  provider: string;
  name: string;
  rate: string;
  rateType: 'flat' | 'variable' | 'tiered';
  contractMonths: number;
  contractLabel: string;
  setupFee: number;
  monthlyEstimate?: string;
  features: string[];
  badge?: 'RECOMMENDED' | 'POPULAR' | 'BEST_VALUE' | 'GREEN';
  badgeReason?: string;
}

export interface ServiceAvailability {
  available: boolean;
  provider?: string;
  providerCount?: number;
  startingRate?: string;
  plans: ServicePlan[];
}

export interface AvailableServices {
  water: ServiceAvailability;
  electricity: ServiceAvailability;
  internet: ServiceAvailability;
}

export type ServiceType = 'water' | 'electricity' | 'internet';

export interface SelectedServices {
  water: boolean;
  electricity: boolean;
  internet: boolean;
}

export interface SelectedPlans {
  water?: ServicePlan;
  electricity?: ServicePlan;
  internet?: ServicePlan;
}

export interface UploadedDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'uploaded' | 'error';
  progress?: number;
  errorMessage?: string;
}

export interface Documents {
  id?: UploadedDocument;
  proofOfResidence?: UploadedDocument;
}

export interface OrderConfirmation {
  orderId: string;
  address: Address;
  moveInDate: string;
  services: {
    type: ServiceType;
    provider: string;
    plan: string;
    status: 'pending' | 'processing' | 'confirmed';
  }[];
}

export type FlowStep = 1 | 2 | 3 | 4 | 5;

export interface FlowState {
  currentStep: FlowStep;

  // Step 1: Address
  address: Address | null;
  moveInDate: string | null;
  availableServices: AvailableServices | null;
  isCheckingAvailability: boolean;
  availabilityChecked: boolean;

  // Step 2: Profile
  profile: UserProfile | null;

  // Step 3: Services
  selectedServices: SelectedServices;
  selectedPlans: SelectedPlans;
  expandedService: ServiceType | null;

  // Step 4: Documents
  documents: Documents;

  // Step 5: Confirmation
  isSubmitting: boolean;
  orderConfirmation: OrderConfirmation | null;

  // Actions
  setAddress: (address: Address) => void;
  setMoveInDate: (date: string) => void;
  checkAvailability: () => Promise<void>;
  setProfile: (profile: UserProfile) => void;
  toggleService: (service: ServiceType) => void;
  selectPlan: (service: ServiceType, plan: ServicePlan) => void;
  setExpandedService: (service: ServiceType | null) => void;
  uploadDocument: (type: 'id' | 'proofOfResidence', file: File) => Promise<void>;
  removeDocument: (type: 'id' | 'proofOfResidence') => void;
  submitOrder: () => Promise<void>;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: FlowStep) => void;
  reset: () => void;
}

// Step metadata
export const STEP_INFO = {
  1: { name: 'Address', title: 'Where are you moving?' },
  2: { name: 'About you', title: 'Tell us about yourself' },
  3: { name: 'Your services', title: 'Choose your services' },
  4: { name: 'Verification', title: 'Verify your identity' },
  5: { name: 'Confirmation', title: 'Review your order' },
} as const;

export const SERVICE_INFO = {
  water: { label: 'Water' },
  electricity: { label: 'Electricity' },
  internet: { label: 'Internet' },
} as const;
