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
  ESIID,
  UsageProfile,
  HomeDetails,
  TwotionCart,
  TwotionCheckoutStep,
} from '@/types/flow';
import {
  getUserId,
  setUserId,
  generateUserId,
  getPlans,
  enrichPlansWithCosts,
  addPlanToCart as apiAddToCart,
  removePlanFromCart as apiRemoveFromCart,
  getCheckoutSteps,
  type TwotionPlan,
} from '@/lib/api/twotion';

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

  // 2TIO User Session
  twotionUserId: null as string | null,
  isInitializingUser: false,

  // Step 1
  address: null,
  moveInDate: null,
  availableServices: null,
  isCheckingAvailability: false,
  availabilityChecked: false,

  // Electricity ESIID (fetched from ERCOT when address is entered)
  esiidMatches: [] as ESIID[],
  selectedEsiid: null as ESIID | null,
  usageProfile: null as UsageProfile | null,
  homeDetails: null as HomeDetails | null,
  isLoadingElectricity: false,

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

  // 2TIO Cart
  cart: null as TwotionCart | null,
  isUpdatingCart: false,

  // Step 4
  documents: {},
  checkoutSteps: null as TwotionCheckoutStep[] | null,
  checkoutAnswers: {} as Record<string, string>,

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
    const { selectedServices, selectedPlans, availableServices, address } = get();

    // Can't toggle water off (it's required since they came for water)
    if (service === 'water') return;

    const isNowSelected = !selectedServices[service];

    // If selecting electricity, fetch real plans from 2TIO
    if (service === 'electricity' && isNowSelected && address?.zip) {
      get().fetchElectricityPlans(address.zip);
    }

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

  // Electricity actions (ERCOT for Zillow data, will proxy through twotion route)
  fetchESIIDs: async (address: string, zip: string) => {
    set({ isLoadingElectricity: true });

    try {
      const params = new URLSearchParams({ action: 'search-esiids', address });
      if (zip) params.append('zip_code', zip);

      const response = await fetch(`/api/twotion?${params}`);
      if (!response.ok) throw new Error('Failed to fetch ESIIDs');

      const esiids: ESIID[] = await response.json();

      // Extract unit from search address if present (e.g., "3031 Oliver St APT 1214" -> "1214")
      const unitMatch = address.match(/APT\s+(\w+)/i);
      const searchedUnit = unitMatch ? unitMatch[1].toUpperCase() : null;

      // Auto-select if:
      // 1. Only one match, OR
      // 2. User searched with a unit and the first result contains that unit
      let autoSelected: ESIID | null = null;
      if (esiids.length === 1) {
        autoSelected = esiids[0];
      } else if (searchedUnit && esiids.length > 0) {
        // Check if first result matches the searched unit
        const firstAddress = esiids[0].address.toUpperCase();
        if (firstAddress.includes(`APT ${searchedUnit}`) || firstAddress.includes(`#${searchedUnit}`)) {
          autoSelected = esiids[0];
        }
      }

      set({
        esiidMatches: esiids,
        isLoadingElectricity: false,
        selectedEsiid: autoSelected,
      });

      // If auto-selected, fetch usage profile
      if (autoSelected) {
        await get().fetchUsageProfile();
      }
    } catch (error) {
      console.error('Error fetching ESIIDs:', error);
      set({ esiidMatches: [], isLoadingElectricity: false });
    }
  },

  selectESIID: (esiid: ESIID) => {
    set({ selectedEsiid: esiid });
    // Fetch usage profile for the selected ESIID
    get().fetchUsageProfile();
  },

  fetchUsageProfile: async () => {
    const { selectedEsiid } = get();
    if (!selectedEsiid) return;

    set({ isLoadingElectricity: true });

    // Helper to calculate annual kWh from monthly usage array
    const calculateAnnualKwh = (usage: number[]): number =>
      usage.reduce((sum, kWh) => sum + kWh, 0);

    try {
      // Will be updated to use 2TIO proxy route
      const params = new URLSearchParams({
        action: 'usage-profile',
        esiid: selectedEsiid.esiid,
      });

      const response = await fetch(`/api/twotion?${params}`);
      if (!response.ok) throw new Error('Failed to fetch usage profile');

      const profile: UsageProfile = await response.json();

      // Calculate home details from profile
      const annualKwh = calculateAnnualKwh(profile.usage);
      const currentYear = new Date().getFullYear();
      const homeDetails: HomeDetails = {
        squareFootage: profile.square_footage,
        homeAge: profile.home_age,
        yearBuilt: profile.home_age > 0 ? currentYear - profile.home_age : 0,
        annualKwh,
        foundDetails: profile.found_home_details,
      };

      set({
        usageProfile: profile,
        homeDetails,
        isLoadingElectricity: false,
      });
    } catch (error) {
      console.error('Error fetching usage profile:', error);
      // Set default profile on error
      const defaultUsage = [900, 850, 900, 1000, 1200, 1400, 1500, 1500, 1300, 1100, 950, 900];
      set({
        usageProfile: {
          usage: defaultUsage,
          home_age: 0,
          square_footage: 0,
          found_home_details: false,
        },
        homeDetails: {
          squareFootage: 0,
          homeAge: 0,
          yearBuilt: 0,
          annualKwh: calculateAnnualKwh(defaultUsage),
          foundDetails: false,
        },
        isLoadingElectricity: false,
      });
    }
  },

  fetchElectricityPlans: async (zipCode: string) => {
    const { usageProfile, availableServices } = get();

    set({ isLoadingElectricity: true });

    try {
      // Fetch plans from 2TIO
      const rawPlans: TwotionPlan[] = await getPlans('electricity', zipCode);

      // Use usage profile or default usage for cost calculations
      const usage = usageProfile?.usage || [900, 850, 900, 1000, 1200, 1400, 1500, 1500, 1300, 1100, 950, 900];

      // Enrich plans with annual cost calculations
      const enrichedPlans = enrichPlansWithCosts(rawPlans, usage);

      // Convert to ServicePlan format for the store
      const servicePlans: ServicePlan[] = enrichedPlans.map((plan, index) => ({
        id: plan.id,
        provider: plan.vendorName,
        name: plan.name,
        rate: `$${plan.uPrice.toFixed(3)}/kWh`,
        rateType: 'flat' as const,
        contractMonths: plan.term,
        contractLabel: plan.term > 0 ? `${plan.term} month contract` : 'No contract',
        setupFee: 0,
        monthlyEstimate: plan.monthlyEstimate ? `$${Math.round(plan.monthlyEstimate)}` : undefined,
        features: [
          plan.bulletPoint1,
          plan.bulletPoint2,
          plan.bulletPoint3,
        ].filter(Boolean) as string[],
        badge: plan.renewable ? 'GREEN' : index === 0 ? 'RECOMMENDED' : undefined,
        badgeReason: plan.renewable
          ? '100% renewable energy from Texas wind and solar'
          : index === 0
          ? 'Best value based on your home\'s usage profile'
          : undefined,
      }));

      // Update available services with real electricity plans
      const updatedServices: AvailableServices = {
        ...availableServices!,
        electricity: {
          available: true,
          providerCount: new Set(servicePlans.map(p => p.provider)).size,
          startingRate: servicePlans.length > 0 ? servicePlans[0].rate : undefined,
          plans: servicePlans,
        },
      };

      set({
        availableServices: updatedServices,
        isLoadingElectricity: false,
      });
    } catch (error) {
      console.error('Error fetching electricity plans:', error);
      set({ isLoadingElectricity: false });
    }
  },

  // 2TIO User actions
  initializeUser: async () => {
    // Check if we already have a user ID
    const existingId = getUserId();
    if (existingId) {
      set({ twotionUserId: existingId, isInitializingUser: false });
      return;
    }

    set({ isInitializingUser: true });

    try {
      const newUserId = await generateUserId();
      setUserId(newUserId);
      set({ twotionUserId: newUserId, isInitializingUser: false });
    } catch (error) {
      console.error('Error initializing user:', error);
      set({ isInitializingUser: false });
    }
  },

  // 2TIO Cart actions
  addToCart: async (planId: string, plan: ServicePlan, serviceType: ServiceType) => {
    set({ isUpdatingCart: true });

    try {
      await apiAddToCart(planId);

      // Update local cart state
      const { cart } = get();
      const newItem = {
        planId,
        planName: plan.name,
        vendorName: plan.provider,
        serviceType,
        monthlyEstimate: plan.monthlyEstimate ? parseFloat(plan.monthlyEstimate.replace('$', '')) : undefined,
      };

      set({
        cart: {
          items: [...(cart?.items || []), newItem],
        },
        isUpdatingCart: false,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      set({ isUpdatingCart: false });
    }
  },

  removeFromCart: async (planId: string) => {
    set({ isUpdatingCart: true });

    try {
      await apiRemoveFromCart(planId);

      // Update local cart state
      const { cart } = get();
      set({
        cart: {
          items: (cart?.items || []).filter(item => item.planId !== planId),
        },
        isUpdatingCart: false,
      });
    } catch (error) {
      console.error('Error removing from cart:', error);
      set({ isUpdatingCart: false });
    }
  },

  fetchCheckoutSteps: async () => {
    try {
      const steps = await getCheckoutSteps();
      set({ checkoutSteps: steps as TwotionCheckoutStep[] });
    } catch (error) {
      console.error('Error fetching checkout steps:', error);
    }
  },

  setCheckoutAnswer: (questionId: string, answer: string) => {
    const { checkoutAnswers } = get();
    set({
      checkoutAnswers: {
        ...checkoutAnswers,
        [questionId]: answer,
      },
    });
  },
}));
