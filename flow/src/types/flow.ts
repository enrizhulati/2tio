// Flow Types for 2TION Utility Setup

export interface Address {
  street: string;
  unit?: string;
  city: string;
  state: string;
  zip: string;
  formatted: string;
  esiid?: string; // ESIID from ERCOT address search
}

// ESIID (Electric Service Identifier ID) from ERCOT
export interface ESIID {
  _id: string;
  esiid: string;
  address: string;
  address_overflow: string;
  city: string;
  state: string;
  zip_code: string;
  zip_code_4?: string;
  county?: string;
  premise_type: string;
  status: string;
  power_region: string;
  station_name: string;
  duns: string;
}

// Usage profile from ERCOT (includes Zillow home data)
export interface UsageProfile {
  usage: number[];  // 12-month kWh array (Jan-Dec)
  home_age: number;
  square_footage: number;
  found_home_details: boolean;
}

// Home details for display
export interface HomeDetails {
  squareFootage: number;
  homeAge: number;
  yearBuilt: number;
  annualKwh: number;
  foundDetails: boolean;
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
  // Enriched fields from usage profile calculation
  annualCost?: number;
  renewable?: boolean;
  // Raw pricing fields for recalculation (electricity only)
  kWh1000?: number;  // Rate per kWh in cents (at 1000 kWh usage)
  mPrice?: number;   // Monthly base fee in dollars
  // Monthly cost range (from API - accounts for seasonal variation)
  lowMonthly?: number;   // Lowest monthly cost
  highMonthly?: number;  // Highest monthly cost
  // New fields from 2TIO API
  logo?: string;              // Base64 encoded provider logo
  leadTime?: number;          // Days until service starts
  vendorPhone?: string;       // Provider support phone
  vendorUrl?: string;         // Provider website
  shortDescription?: string;  // Plan summary
  longDescription?: string;   // Detailed plan info
  serviceName?: string;       // Service type from API (Water, Electricity, etc.)
  cancellationFee?: number;   // Early termination fee
  renewablePercent?: number;  // Percentage of renewable energy
  // Internet-specific fields
  downloadSpeed?: number;     // Mbps download speed
  uploadSpeed?: number;       // Mbps upload speed
  dataCapGB?: number;         // Data cap in GB (null = unlimited)
}

export interface ServiceAvailability {
  available: boolean;
  provider?: string;
  providerCount?: number;
  startingRate?: string;
  logo?: string;
  plans: ServicePlan[];
}

export interface AvailableServices {
  water: ServiceAvailability;
  electricity: ServiceAvailability;
  internet: ServiceAvailability;
}

export type ServiceType = 'water' | 'electricity' | 'internet';

// Water billing question for apartments
export type WaterAnswer = 'yes_separate' | 'no_included' | 'not_sure' | null;
export type OwnershipAnswer = 'renting' | 'own' | null;

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
  file?: File; // Actual file for upload to API
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
  // Deposit information (if credit check requires deposit)
  depositRequired?: boolean;
  depositAmount?: number;
  depositReason?: string;
  depositServiceName?: string;  // Which service requires deposit
  depositVendorName?: string;   // Which vendor requires deposit
  // CP order URL for completing electric enrollment (redirects to ComparePower.com)
  cpOrderUrl?: string;
}

export type FlowStep = 1 | 2 | 3 | 4 | 5;

// 2TIO Cart types
export interface TwotionCartItem {
  planId: string;
  planName: string;
  vendorName: string;
  serviceType: ServiceType;
  monthlyEstimate?: number;
}

export interface TwotionCart {
  items: TwotionCartItem[];
}

// 2TIO Checkout types
export interface TwotionCheckoutQuestion {
  id: string;
  question: string;
  type: 'text' | 'select' | 'date' | 'ssn';
  required: boolean;
  options?: string[];
}

export interface TwotionCheckoutStep {
  VendorId: string | null;
  VendorName: string | null;
  Logo: string | null;
  AppQuestions: TwotionCheckoutQuestion[];
  DocumentList: { name: string; required: boolean }[];
  IsStepOne: boolean;
  LeadTime: number;
  IsDLUpload: boolean;
  IsLeaseUpload: boolean;
  IsOwnUpload: boolean;
  // Terms and consent text from API
  Terms?: string;
  ConsentText?: string;
  TermsUrl?: string;
  EflUrl?: string;  // Electricity Facts Label
  YracUrl?: string; // Your Rights as a Customer
}

export interface FlowState {
  currentStep: FlowStep;

  // 2TIO User Session
  twotionUserId: string | null;
  isInitializingUser: boolean;

  // Step 1: Address
  address: Address | null;
  moveInDate: string | null;
  availableServices: AvailableServices | null;
  isCheckingAvailability: boolean;
  availabilityChecked: boolean;

  // Electricity ESIID (fetched from ERCOT when address is entered)
  esiidMatches: ESIID[];
  selectedEsiid: ESIID | null;
  esiidSearchComplete: boolean;
  esiidConfirmed: boolean;
  usageProfile: UsageProfile | null;
  homeDetails: HomeDetails | null;
  isLoadingElectricity: boolean;

  // Apartment water billing detection
  isApartment: boolean;
  waterAnswer: WaterAnswer;
  ownershipAnswer: OwnershipAnswer;

  // Step 2: Profile
  profile: UserProfile | null;

  // Step 3: Services
  selectedServices: SelectedServices;
  selectedPlans: SelectedPlans;
  expandedService: ServiceType | null;

  // 2TIO Cart
  cart: TwotionCart | null;
  isUpdatingCart: boolean;

  // Step 4: Documents / Checkout
  documents: Documents;
  checkoutSteps: TwotionCheckoutStep[] | null;
  checkoutAnswers: Record<string, string>;

  // Step 5: Confirmation
  isSubmitting: boolean;
  orderConfirmation: OrderConfirmation | null;

  // Actions
  setAddress: (address: Address) => void;
  setMoveInDate: (date: string) => void;
  setWaterAnswer: (answer: WaterAnswer) => void;
  setOwnershipAnswer: (answer: OwnershipAnswer) => void;
  checkAvailability: () => Promise<void>;
  setProfile: (profile: UserProfile) => void;
  toggleService: (service: ServiceType) => Promise<void>;
  selectPlan: (service: ServiceType, plan: ServicePlan) => Promise<void>;
  setExpandedService: (service: ServiceType | null) => void;
  uploadDocument: (type: 'id' | 'proofOfResidence', file: File) => Promise<void>;
  removeDocument: (type: 'id' | 'proofOfResidence') => void;
  submitOrder: () => Promise<void>;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: FlowStep) => void;
  reset: () => void;

  // 2TIO User actions
  initializeUser: () => Promise<void>;

  // Electricity actions (ERCOT for Zillow data)
  fetchESIIDs: (address: string, zip: string, userUnit?: string) => Promise<void>;
  selectESIID: (esiid: ESIID) => void;
  confirmEsiid: () => Promise<void>;
  fetchUsageProfile: () => Promise<void>;
  fetchElectricityPlans: (zipCode: string) => Promise<void>;
  updateMonthlyUsage: (monthlyKwh: number) => Promise<void>;

  // 2TIO Cart actions
  addToCart: (planId: string, plan: ServicePlan, serviceType: ServiceType) => Promise<void>;
  removeFromCart: (planId: string) => Promise<void>;
  fetchCheckoutSteps: () => Promise<void>;
  setCheckoutAnswer: (questionId: string, answer: string) => void;
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
