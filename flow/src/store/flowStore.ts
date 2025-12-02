import { create } from 'zustand';
import type {
  FlowState,
  FlowStep,
  Address,
  UserProfile,
  ServiceType,
  ServicePlan,
  AvailableServices,
  SelectedServices,
  SelectedPlans,
  Documents,
  OrderConfirmation,
} from '@/types/flow';

// Mock data for available services (simulating API response)
const mockAvailableServices: AvailableServices = {
  water: {
    available: true,
    provider: 'City of Dallas Water Utilities',
    plans: [
      {
        id: 'dallas-water-standard',
        provider: 'City of Dallas Water Utilities',
        name: 'Standard Residential',
        rate: 'Tiered usage rates',
        rateType: 'tiered',
        contractMonths: 0,
        contractLabel: 'No contract',
        setupFee: 0,
        monthlyEstimate: '$45-65',
        features: ['24/7 emergency service', 'Online account management'],
      },
    ],
  },
  electricity: {
    available: true,
    providerCount: 12,
    startingRate: '$0.08/kWh',
    plans: [
      {
        id: 'txu-free-nights',
        provider: 'TXU Energy',
        name: 'Free Nights',
        rate: '$0.12/kWh days',
        rateType: 'variable',
        contractMonths: 12,
        contractLabel: '12 month contract',
        setupFee: 0,
        features: ['Free electricity 9pm-6am', 'No deposit with autopay'],
      },
      {
        id: 'reliant-prepaid',
        provider: 'Reliant',
        name: 'Simply Prepaid',
        rate: '$0.10/kWh',
        rateType: 'flat',
        contractMonths: 0,
        contractLabel: 'No contract',
        setupFee: 0,
        features: ['Pay as you go', 'No credit check', 'Real-time usage tracking'],
        badge: 'RECOMMENDED',
        badgeReason: 'No contract required, lowest rate per kWh, and no credit check needed. Perfect for new movers who want flexibility.',
      },
      {
        id: 'green-mountain-renewable',
        provider: 'Green Mountain',
        name: '100% Renewable',
        rate: '$0.11/kWh',
        rateType: 'flat',
        contractMonths: 24,
        contractLabel: '24 month contract',
        setupFee: 0,
        features: ['100% wind power', 'Carbon neutral'],
        badge: 'GREEN',
        badgeReason: 'Powered by 100% Texas wind energy. Supports local renewable infrastructure and reduces your carbon footprint.',
      },
    ],
  },
  internet: {
    available: true,
    providerCount: 5,
    startingRate: '$39.99/mo',
    plans: [
      {
        id: 'att-fiber-300',
        provider: 'AT&T Fiber',
        name: '300 Mbps',
        rate: '$55/mo',
        rateType: 'flat',
        contractMonths: 12,
        contractLabel: '12 month price lock',
        setupFee: 0,
        features: ['Symmetrical upload/download', 'No data caps'],
      },
      {
        id: 'spectrum-500',
        provider: 'Spectrum',
        name: '500 Mbps',
        rate: '$49.99/mo',
        rateType: 'flat',
        contractMonths: 0,
        contractLabel: 'No contract',
        setupFee: 0,
        features: ['Free modem', 'No data caps', 'Free installation this month'],
        badge: 'RECOMMENDED',
        badgeReason: 'Fastest speeds at the lowest price with no contract. Free modem and installation included this month.',
      },
      {
        id: 'frontier-gig',
        provider: 'Frontier',
        name: '1 Gbps',
        rate: '$79.99/mo',
        rateType: 'flat',
        contractMonths: 24,
        contractLabel: '2 year price lock',
        setupFee: 0,
        features: ['Fastest option available', 'Free eero mesh WiFi'],
      },
    ],
  },
};

const initialState = {
  currentStep: 1 as FlowStep,

  // Step 1
  address: null,
  moveInDate: null,
  availableServices: null,
  isCheckingAvailability: false,
  availabilityChecked: false,

  // Step 2
  profile: null,

  // Step 3
  selectedServices: {
    water: true, // Pre-selected since user clicked "Set Up My Water"
    electricity: false,
    internet: false,
  },
  selectedPlans: {},
  expandedService: 'water' as ServiceType | null, // Auto-expand water since it's pre-selected

  // Step 4
  documents: {},

  // Step 5
  isSubmitting: false,
  orderConfirmation: null,
};

export const useFlowStore = create<FlowState>((set, get) => ({
  ...initialState,

  setAddress: (address: Address) => set({ address }),

  setMoveInDate: (date: string) => set({ moveInDate: date }),

  checkAvailability: async () => {
    set({ isCheckingAvailability: true });

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Set water plan as default selected
    const waterPlan = mockAvailableServices.water.plans[0];

    set({
      availableServices: mockAvailableServices,
      isCheckingAvailability: false,
      availabilityChecked: true,
      selectedPlans: {
        water: waterPlan,
      },
    });
  },

  setProfile: (profile: UserProfile) => set({ profile }),

  toggleService: (service: ServiceType) => {
    const { selectedServices, selectedPlans, availableServices } = get();

    // Can't toggle water off (it's required since they came for water)
    if (service === 'water') return;

    const isNowSelected = !selectedServices[service];

    // If selecting, auto-select the recommended plan
    let newSelectedPlans = { ...selectedPlans };
    if (isNowSelected && availableServices) {
      const plans = availableServices[service].plans;
      const recommendedPlan = plans.find((p) => p.badge === 'RECOMMENDED') || plans[0];
      newSelectedPlans[service] = recommendedPlan;
    } else if (!isNowSelected) {
      delete newSelectedPlans[service];
    }

    set({
      selectedServices: {
        ...selectedServices,
        [service]: isNowSelected,
      },
      selectedPlans: newSelectedPlans,
      expandedService: isNowSelected ? service : null,
    });
  },

  selectPlan: (service: ServiceType, plan: ServicePlan) => {
    set({
      selectedPlans: {
        ...get().selectedPlans,
        [service]: plan,
      },
    });
  },

  setExpandedService: (service: ServiceType | null) => {
    set({ expandedService: service });
  },

  uploadDocument: async (type: 'id' | 'proofOfResidence', file: File) => {
    const docId = `${type}-${Date.now()}`;

    // Set uploading state
    set({
      documents: {
        ...get().documents,
        [type]: {
          id: docId,
          name: file.name,
          size: file.size,
          type: file.type,
          status: 'uploading',
          progress: 0,
        },
      },
    });

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 20) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const currentDoc = get().documents[type];
      if (currentDoc?.status === 'uploading') {
        set({
          documents: {
            ...get().documents,
            [type]: { ...currentDoc, progress: i },
          },
        });
      }
    }

    // Complete upload
    set({
      documents: {
        ...get().documents,
        [type]: {
          id: docId,
          name: file.name,
          size: file.size,
          type: file.type,
          status: 'uploaded',
        },
      },
    });
  },

  removeDocument: (type: 'id' | 'proofOfResidence') => {
    const newDocs = { ...get().documents };
    delete newDocs[type];
    set({ documents: newDocs });
  },

  submitOrder: async () => {
    set({ isSubmitting: true });

    // Simulate order submission
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const { address, moveInDate, selectedServices, selectedPlans } = get();

    const services: OrderConfirmation['services'] = [];

    if (selectedServices.water && selectedPlans.water) {
      services.push({
        type: 'water',
        provider: selectedPlans.water.provider,
        plan: selectedPlans.water.name,
        status: 'processing',
      });
    }

    if (selectedServices.electricity && selectedPlans.electricity) {
      services.push({
        type: 'electricity',
        provider: selectedPlans.electricity.provider,
        plan: selectedPlans.electricity.name,
        status: 'processing',
      });
    }

    if (selectedServices.internet && selectedPlans.internet) {
      services.push({
        type: 'internet',
        provider: selectedPlans.internet.provider,
        plan: selectedPlans.internet.name,
        status: 'processing',
      });
    }

    const orderConfirmation: OrderConfirmation = {
      orderId: `2TION-${Math.floor(10000 + Math.random() * 90000)}`,
      address: address!,
      moveInDate: moveInDate!,
      services,
    };

    set({
      isSubmitting: false,
      orderConfirmation,
      currentStep: 5,
    });
  },

  nextStep: () => {
    const { currentStep } = get();
    if (currentStep < 5) {
      set({ currentStep: (currentStep + 1) as FlowStep });
    }
  },

  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 1) {
      set({ currentStep: (currentStep - 1) as FlowStep });
    }
  },

  goToStep: (step: FlowStep) => {
    set({ currentStep: step });
  },

  reset: () => set(initialState),
}));
