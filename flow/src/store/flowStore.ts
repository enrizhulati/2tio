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
  completeCheckout,
  type TwotionPlan,
  type CheckoutData,
  type CheckoutFiles,
} from '@/lib/api/twotion';

// Default usage profile for cost estimates (when Zillow data unavailable)
const DEFAULT_USAGE = [900, 850, 900, 1000, 1200, 1400, 1500, 1500, 1300, 1100, 950, 900];

// Full 2TIO API plan response type
interface RawServicePlan {
  id: string;
  name: string;
  vendorId: string;
  vendorName: string;
  serviceId?: string;
  serviceName?: string;
  regionId?: string;
  uPrice?: number;        // Price per kWh or usage-based
  mPrice?: number;        // Monthly base price
  price?: number;         // Alternative monthly price field
  kWh1000?: number;       // Price at 1000 kWh (cents)
  term: number;
  cancellationFee?: number;
  bundleOnly?: boolean;
  prepaid?: boolean;
  favorite?: boolean;
  business?: boolean;
  active?: boolean;
  renewable?: boolean;
  renewablePercent?: number;
  bounty?: number;
  shortDescription?: string;
  longDescription?: string;
  bulletPoint1?: string;
  bulletPoint2?: string;
  bulletPoint3?: string;
  bulletPoint4?: string;
  bulletPoint5?: string;
  logo?: string;
  leadTime?: number;      // Days until service starts
  vendorPhone?: string;
  vendorUrl?: string;
  callCenterPhone?: string;
  // Service availability days
  isSaturday?: boolean;
  isSunday?: boolean;
  isMonday?: boolean;
  isTuesday?: boolean;
  isWednesday?: boolean;
  isThursday?: boolean;
  isFriday?: boolean;
  tdspId?: string;
  duns?: string;
  offerCode?: string;
  bannerText?: string;
  // Internet-specific fields
  downloadSpeed?: number;
  uploadSpeed?: number;
  dataCapGB?: number;
  // Server-calculated pricing fields (from pricing API when electricityUsage is provided)
  low?: number;   // Lowest monthly cost
  high?: number;  // Highest monthly cost
}

// Alias for backwards compatibility
type RawInternetPlan = RawServicePlan;
type RawWaterPlan = RawServicePlan;

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
  esiidSearchComplete: false, // True when ESIID search is done (show selection UI)
  esiidConfirmed: false, // True after user confirms their address/ESIID
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
    const { address, usageProfile } = get();
    set({ isCheckingAvailability: true });

    try {
      const zipCode = address?.zip || '75205';

      // Use usage profile or default for cost calculations
      const usageArray = usageProfile?.usage || DEFAULT_USAGE;

      // Fetch all service plans in parallel from 2TIO API
      // Each has catch handler to prevent rate limiting errors from killing all services
      // Pass usage to electricity API for server-side cost calculation
      const [rawElectricityPlans, rawInternetPlans, rawWaterPlans] = await Promise.all([
        getPlans('electricity', zipCode, usageArray).catch((err) => {
          console.error('Error fetching electricity plans:', err);
          return [] as TwotionPlan[];
        }),
        getPlans('internet', zipCode).catch((err) => {
          console.error('Error fetching internet plans:', err);
          return [] as RawInternetPlan[];
        }),
        getPlans('water', zipCode).catch((err) => {
          console.error('Error fetching water plans:', err);
          return [] as RawWaterPlan[];
        }),
      ]);

      // Use API's server-calculated costs if available, otherwise fallback to client calculation
      // Server costs include bill credits, tiered pricing, etc. for accurate comparison
      const enrichedPlans = rawElectricityPlans.map((plan) => {
        const clientCosts = enrichPlansWithCosts([plan], usageArray)[0];
        return {
          ...plan,
          annualCost: plan.totalCost ?? clientCosts?.annualCost,
          monthlyEstimate: plan.averageCostPerMonth ?? (plan.totalCost ? plan.totalCost / 12 : clientCosts?.monthlyEstimate),
        };
      });

      // Convert electricity plans to ServicePlan format with all API fields
      const electricityPlans: ServicePlan[] = enrichedPlans.map((plan, index) => {
        const rawPlan = rawElectricityPlans[index] as unknown as RawServicePlan;
        return {
          id: plan.id,
          provider: plan.vendorName,
          name: plan.name,
          rate: `$${(plan.kWh1000 / 100).toFixed(3)}/kWh`,
          rateType: 'flat' as const,
          contractMonths: plan.term,
          contractLabel: plan.term > 0 ? `${plan.term} month contract` : 'No contract',
          setupFee: 0,
          monthlyEstimate: plan.monthlyEstimate ? `$${Math.round(plan.monthlyEstimate)}` : undefined,
          features: [
            rawPlan?.bulletPoint1,
            rawPlan?.bulletPoint2,
            rawPlan?.bulletPoint3,
            rawPlan?.bulletPoint4,
            rawPlan?.bulletPoint5,
          ].filter(Boolean) as string[],
          badge: plan.renewable ? 'GREEN' as const : index === 0 ? 'RECOMMENDED' as const : undefined,
          badgeReason: plan.renewable
            ? '100% renewable energy from Texas wind and solar'
            : index === 0
            ? 'Best value based on estimated usage'
            : undefined,
          // New fields from 2TIO API
          logo: rawPlan?.logo,
          leadTime: rawPlan?.leadTime,
          vendorPhone: rawPlan?.vendorPhone || rawPlan?.callCenterPhone,
          vendorUrl: rawPlan?.vendorUrl,
          shortDescription: rawPlan?.shortDescription,
          longDescription: rawPlan?.longDescription,
          serviceName: rawPlan?.serviceName,
          cancellationFee: rawPlan?.cancellationFee,
          renewable: plan.renewable,
          renewablePercent: rawPlan?.renewablePercent,
          // Calculated cost fields from enrichment
          annualCost: plan.annualCost,
          // Monthly cost range from API (accounts for seasonal variation)
          lowMonthly: rawPlan?.low,
          highMonthly: rawPlan?.high,
        };
      });

      // Convert internet plans to ServicePlan format with all API fields
      const internetPlans: ServicePlan[] = rawInternetPlans.map((plan, index) => {
        const rawPlan = plan as RawServicePlan;
        const monthlyPrice = rawPlan.uPrice || rawPlan.mPrice || rawPlan.price || 0;
        return {
          id: rawPlan.id,
          provider: rawPlan.vendorName,
          name: rawPlan.name,
          rate: monthlyPrice > 0 ? `$${monthlyPrice.toFixed(2)}/mo` : 'Contact for pricing',
          rateType: 'flat' as const,
          contractMonths: rawPlan.term || 0,
          contractLabel: rawPlan.term > 0 ? `${rawPlan.term} month contract` : 'No contract',
          setupFee: 0,
          monthlyEstimate: monthlyPrice > 0 ? `$${Math.round(monthlyPrice)}` : undefined,
          features: [
            rawPlan.bulletPoint1,
            rawPlan.bulletPoint2,
            rawPlan.bulletPoint3,
            rawPlan.bulletPoint4,
            rawPlan.bulletPoint5,
          ].filter(Boolean) as string[],
          badge: index === 0 ? 'RECOMMENDED' as const : undefined,
          badgeReason: index === 0 ? 'Best value for your area' : undefined,
          // New fields from 2TIO API
          logo: rawPlan.logo,
          leadTime: rawPlan.leadTime,
          vendorPhone: rawPlan.vendorPhone || rawPlan.callCenterPhone,
          vendorUrl: rawPlan.vendorUrl,
          shortDescription: rawPlan.shortDescription,
          longDescription: rawPlan.longDescription,
          serviceName: rawPlan.serviceName,
          cancellationFee: rawPlan.cancellationFee,
          renewable: rawPlan.renewable,
          renewablePercent: rawPlan.renewablePercent,
          // Internet-specific fields
          downloadSpeed: rawPlan.downloadSpeed,
          uploadSpeed: rawPlan.uploadSpeed,
          dataCapGB: rawPlan.dataCapGB,
        };
      });

      // Convert water plans to ServicePlan format with all API fields
      const waterPlans: ServicePlan[] = rawWaterPlans.map((plan, index) => {
        const rawPlan = plan as RawServicePlan;
        const monthlyPrice = rawPlan.mPrice || rawPlan.uPrice || rawPlan.price || 0;
        return {
          id: rawPlan.id,
          provider: rawPlan.vendorName,
          name: rawPlan.name,
          rate: monthlyPrice > 0 ? `$${monthlyPrice.toFixed(2)}/mo base` : 'Usage-based',
          rateType: 'tiered' as const,
          contractMonths: rawPlan.term || 0,
          contractLabel: 'No contract',
          setupFee: 0,
          monthlyEstimate: monthlyPrice > 0 ? `$${Math.round(monthlyPrice)}+` : undefined,
          features: [
            rawPlan.bulletPoint1,
            rawPlan.bulletPoint2,
            rawPlan.bulletPoint3,
            rawPlan.bulletPoint4,
            rawPlan.bulletPoint5,
          ].filter(Boolean) as string[],
          badge: index === 0 ? 'RECOMMENDED' as const : undefined,
          badgeReason: index === 0 ? 'Your local water utility' : undefined,
          // New fields from 2TIO API
          logo: rawPlan.logo,
          leadTime: rawPlan.leadTime,
          vendorPhone: rawPlan.vendorPhone || rawPlan.callCenterPhone,
          vendorUrl: rawPlan.vendorUrl,
          shortDescription: rawPlan.shortDescription,
          longDescription: rawPlan.longDescription,
          serviceName: rawPlan.serviceName,
          cancellationFee: rawPlan.cancellationFee,
          renewable: rawPlan.renewable,
          renewablePercent: rawPlan.renewablePercent,
        };
      });

      // Build available services with real data from API
      const availableServices: AvailableServices = {
        water: {
          available: waterPlans.length > 0,
          provider: waterPlans.length > 0 ? waterPlans[0].provider : undefined,
          providerCount: new Set(waterPlans.map(p => p.provider)).size,
          startingRate: waterPlans.length > 0 ? waterPlans[0].rate : undefined,
          logo: rawWaterPlans.length > 0 ? rawWaterPlans[0].logo : undefined,
          plans: waterPlans,
        },
        electricity: {
          available: electricityPlans.length > 0,
          providerCount: new Set(electricityPlans.map(p => p.provider)).size,
          startingRate: electricityPlans.length > 0 ? electricityPlans[0].rate : undefined,
          logo: rawElectricityPlans.length > 0 ? rawElectricityPlans[0].logo : undefined,
          plans: electricityPlans,
        },
        internet: {
          available: internetPlans.length > 0,
          providerCount: new Set(internetPlans.map(p => p.provider)).size,
          startingRate: internetPlans.length > 0 ? internetPlans[0].rate : undefined,
          logo: rawInternetPlans.length > 0 ? rawInternetPlans[0].logo : undefined,
          plans: internetPlans,
        },
      };

      set({
        availableServices,
        isCheckingAvailability: false,
        availabilityChecked: true,
        selectedPlans: {
          water: waterPlans.length > 0 ? waterPlans[0] : undefined,
        },
      });
    } catch (error) {
      console.error('Error fetching plans:', error);
      // Still show availability but with empty plans on error
      set({
        availableServices: {
          water: {
            available: false,
            providerCount: 0,
            plans: [],
          },
          electricity: {
            available: false,
            providerCount: 0,
            plans: [],
          },
          internet: {
            available: false,
            providerCount: 0,
            plans: [],
          },
        },
        isCheckingAvailability: false,
        availabilityChecked: true,
        selectedPlans: {},
      });
    }
  },

  setProfile: (profile: UserProfile) => set({ profile }),

  toggleService: async (service: ServiceType) => {
    const { selectedServices, selectedPlans, availableServices, address, cart } = get();

    // Water is pre-selected and required - can't be toggled off
    if (service === 'water' && selectedServices.water) return;

    // LOCK SCROLL: Prevent any scroll during state updates
    const scrollY = typeof window !== 'undefined' ? window.scrollY : 0;
    if (typeof document !== 'undefined') {
      // Fix body position to prevent scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';
    }

    const isNowSelected = !selectedServices[service];

    // If selecting electricity, fetch real plans from 2TIO
    if (service === 'electricity' && isNowSelected && address?.zip) {
      get().fetchElectricityPlans(address.zip);
    }

    // If selecting, auto-select the recommended plan and add to cart
    let newSelectedPlans = { ...selectedPlans };
    if (isNowSelected && availableServices) {
      const plans = availableServices[service].plans;
      const recommendedPlan = plans.find((p) => p.badge === 'RECOMMENDED') || plans[0];
      newSelectedPlans[service] = recommendedPlan;

      // Add to 2TIO cart for all services
      if (recommendedPlan) {
        try {
          await apiAddToCart(recommendedPlan.id);
          const newItems = [...(cart?.items || [])];
          newItems.push({
            planId: recommendedPlan.id,
            planName: recommendedPlan.name,
            vendorName: recommendedPlan.provider,
            serviceType: service,
            monthlyEstimate: recommendedPlan.monthlyEstimate ? parseFloat(recommendedPlan.monthlyEstimate.replace('$', '')) : undefined,
          });
          set({ cart: { items: newItems } });
        } catch (error) {
          console.error('Error adding to cart:', error);
        }
      }
    } else if (!isNowSelected) {
      // Remove from cart when deselecting
      const previousPlan = selectedPlans[service];
      if (previousPlan) {
        try {
          await apiRemoveFromCart(previousPlan.id);
          const newItems = (cart?.items || []).filter(item => item.planId !== previousPlan.id);
          set({ cart: { items: newItems } });
        } catch (error) {
          console.error('Error removing from cart:', error);
        }
      }
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

    // UNLOCK SCROLL: Restore scroll position after state updates
    if (typeof document !== 'undefined') {
      // Wait for React to finish rendering
      requestAnimationFrame(() => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      });
    }
  },

  selectPlan: async (service: ServiceType, plan: ServicePlan) => {
    const { selectedPlans, cart } = get();
    const previousPlan = selectedPlans[service];

    // Update local state immediately for responsive UI
    set({
      selectedPlans: {
        ...selectedPlans,
        [service]: plan,
      },
    });

    // Sync all services with 2TIO cart
    if (service === 'water' || service === 'electricity' || service === 'internet') {
      try {
        // Remove previous plan from cart if exists
        if (previousPlan && previousPlan.id !== plan.id) {
          const previousCartItem = cart?.items.find(item => item.planId === previousPlan.id);
          if (previousCartItem) {
            await apiRemoveFromCart(previousPlan.id);
          }
        }

        // Add new plan to cart
        await apiAddToCart(plan.id);

        // Update cart state
        const newItems = (cart?.items || []).filter(item => item.planId !== previousPlan?.id);
        newItems.push({
          planId: plan.id,
          planName: plan.name,
          vendorName: plan.provider,
          serviceType: service,
          monthlyEstimate: plan.monthlyEstimate ? parseFloat(plan.monthlyEstimate.replace('$', '')) : undefined,
        });

        set({ cart: { items: newItems } });
      } catch (error) {
        console.error('Error syncing cart:', error);
        // Cart sync failed, but local selection still works
      }
    }
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
          file, // Store actual file for later upload
        },
      },
    });

    // Show upload progress (actual upload happens at checkout)
    for (let i = 0; i <= 100; i += 20) {
      await new Promise((resolve) => setTimeout(resolve, 100));
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

    // Mark as ready for upload (file stored locally, will be sent at checkout)
    set({
      documents: {
        ...get().documents,
        [type]: {
          id: docId,
          name: file.name,
          size: file.size,
          type: file.type,
          status: 'uploaded',
          file, // Keep file reference for checkout
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

    const { address, moveInDate, selectedServices, selectedPlans, documents, checkoutAnswers } = get();

    try {
      // Prepare checkout data for 2TIO API
      const checkoutData: CheckoutData = {
        serviceStartDateSelection: moveInDate || new Date().toISOString().split('T')[0],
        appFields: checkoutAnswers,
      };

      // Prepare files for upload
      const checkoutFiles: CheckoutFiles = {};
      if (documents.id?.file) {
        checkoutFiles.dlFile = documents.id.file;
      }
      if (documents.proofOfResidence?.file) {
        // Map proofOfResidence to rentFile (for renters) or ownFile (for owners)
        // Default to rentFile since most users are renters
        checkoutFiles.rentFile = documents.proofOfResidence.file;
      }

      // Call 2TIO checkout API
      const apiResponse = await completeCheckout(checkoutData, checkoutFiles);

      // Build services list for confirmation display
      const services: OrderConfirmation['services'] = [];

      if (selectedServices.water && selectedPlans.water) {
        services.push({
          type: 'water',
          provider: selectedPlans.water.provider,
          plan: selectedPlans.water.name,
          status: 'confirmed',
        });
      }

      if (selectedServices.electricity && selectedPlans.electricity) {
        services.push({
          type: 'electricity',
          provider: selectedPlans.electricity.provider,
          plan: selectedPlans.electricity.name,
          status: 'confirmed',
        });
      }

      if (selectedServices.internet && selectedPlans.internet) {
        services.push({
          type: 'internet',
          provider: selectedPlans.internet.provider,
          plan: selectedPlans.internet.name,
          status: 'confirmed',
        });
      }

      const orderConfirmation: OrderConfirmation = {
        orderId: apiResponse.confirmationId || apiResponse.orderNumber || `2TION-${Date.now()}`,
        address: address!,
        moveInDate: moveInDate!,
        services,
        // Extract deposit info from API response (if credit check requires deposit)
        depositRequired: apiResponse.depositRequired,
        depositAmount: apiResponse.depositAmount,
        depositReason: apiResponse.depositReason,
        depositServiceName: apiResponse.depositServiceName,
        depositVendorName: apiResponse.depositVendorName,
        // CP order URL for completing electric enrollment (redirects to ComparePower.com)
        cpOrderUrl: apiResponse.cpOrderUrl,
      };

      set({
        isSubmitting: false,
        orderConfirmation,
        currentStep: 5,
      });
    } catch (error) {
      console.error('Checkout error:', error);

      // Fallback: create local confirmation on error (so user doesn't lose progress)
      const services: OrderConfirmation['services'] = [];
      if (selectedServices.water && selectedPlans.water) {
        services.push({
          type: 'water',
          provider: selectedPlans.water.provider,
          plan: selectedPlans.water.name,
          status: 'pending',
        });
      }
      if (selectedServices.electricity && selectedPlans.electricity) {
        services.push({
          type: 'electricity',
          provider: selectedPlans.electricity.provider,
          plan: selectedPlans.electricity.name,
          status: 'pending',
        });
      }
      if (selectedServices.internet && selectedPlans.internet) {
        services.push({
          type: 'internet',
          provider: selectedPlans.internet.provider,
          plan: selectedPlans.internet.name,
          status: 'pending',
        });
      }

      const orderConfirmation: OrderConfirmation = {
        orderId: `2TION-${Date.now()}`,
        address: address!,
        moveInDate: moveInDate!,
        services,
      };

      set({
        isSubmitting: false,
        orderConfirmation,
        currentStep: 5,
      });
    }
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
  // userUnit is passed explicitly to avoid race condition with state updates
  fetchESIIDs: async (address: string, zip: string, userUnit?: string) => {
    set({ isLoadingElectricity: true });

    try {
      const params = new URLSearchParams({ action: 'search-esiids', address });
      if (zip) params.append('zip_code', zip);

      const response = await fetch(`/api/twotion?${params}`);
      if (!response.ok) throw new Error('Failed to fetch ESIIDs');

      const esiids: ESIID[] = await response.json();

      // Extract digits only from userUnit (e.g., "1214" from "Apt 1214")
      const normalizedUnit = userUnit?.replace(/\D/g, '') || null;

      // Auto-select logic:
      // 1. Only one match -> auto-select and confirm
      // 2. Multiple matches + user specified unit -> find matching address_overflow
      let autoSelected: ESIID | null = null;
      let shouldAutoConfirm = false;

      if (esiids.length === 1) {
        autoSelected = esiids[0];
        shouldAutoConfirm = true;
      } else if (normalizedUnit && esiids.length > 1) {
        // Match user's unit against address field (e.g., "3031 OLIVER ST APT 1214")
        // ERCOT stores apartment in address field, not address_overflow
        autoSelected = esiids.find((e: ESIID) => {
          // Extract apartment number from address (e.g., "APT 1214" -> "1214")
          const aptMatch = e.address?.match(/APT\s*(\d+)/i);
          const addressUnit = aptMatch ? aptMatch[1] : null;
          return addressUnit === normalizedUnit;
        }) || null;

        if (autoSelected) {
          shouldAutoConfirm = true;
        }
      }

      set({
        esiidMatches: esiids,
        isLoadingElectricity: false,
        selectedEsiid: autoSelected,
        esiidSearchComplete: true,
        esiidConfirmed: shouldAutoConfirm,
      });

      // Auto-fetch usage profile if auto-confirmed
      if (shouldAutoConfirm && autoSelected) {
        get().fetchUsageProfile();
      }
    } catch (error) {
      console.error('Error fetching ESIIDs:', error);
      set({
        esiidMatches: [],
        isLoadingElectricity: false,
        esiidSearchComplete: true,
        esiidConfirmed: false,
      });
    }
  },

  selectESIID: (esiid: ESIID) => {
    set({ selectedEsiid: esiid });
    // Don't auto-fetch usage profile - wait for confirmation
  },

  // User confirms their ESIID/address selection
  confirmEsiid: async () => {
    const { selectedEsiid, checkAvailability, fetchUsageProfile } = get();
    if (!selectedEsiid) return;

    set({ esiidConfirmed: true, isLoadingElectricity: true });

    // Fetch usage profile FIRST, then check availability with real usage data
    // This ensures electricity plans are sorted by actual estimated cost
    await fetchUsageProfile();
    await checkAvailability();

    set({ isLoadingElectricity: false });
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
      // Use usage profile or default usage for cost calculations
      const usage = usageProfile?.usage || DEFAULT_USAGE;

      // Fetch plans from 2TIO with usage for server-side cost calculation
      const rawPlans: TwotionPlan[] = await getPlans('electricity', zipCode, usage);

      // Convert to ServicePlan format for the store with all API fields
      // Note: API returns kWh1000 in cents (e.g., 9 = 9¢/kWh), uPrice is often 0
      // Use API's server-calculated costs if available (includes bill credits, tiered pricing)
      const servicePlans: ServicePlan[] = rawPlans.map((plan, index) => {
        const rawPlan = plan as unknown as RawServicePlan;

        // Prefer server-calculated costs which include bill credits, tiered pricing, etc.
        const clientCosts = enrichPlansWithCosts([plan], usage)[0];
        const annualCost = plan.totalCost ?? clientCosts?.annualCost;
        const monthlyEstimate = plan.averageCostPerMonth ?? (plan.totalCost ? plan.totalCost / 12 : clientCosts?.monthlyEstimate);

        return {
          id: plan.id,
          provider: plan.vendorName,
          name: plan.name,
          rate: `$${(plan.kWh1000 / 100).toFixed(3)}/kWh`,
          rateType: 'flat' as const,
          contractMonths: plan.term,
          contractLabel: plan.term > 0 ? `${plan.term} month contract` : 'No contract',
          setupFee: 0,
          monthlyEstimate: monthlyEstimate ? `$${Math.round(monthlyEstimate)}` : undefined,
          features: [
            rawPlan?.bulletPoint1,
            rawPlan?.bulletPoint2,
            rawPlan?.bulletPoint3,
            rawPlan?.bulletPoint4,
            rawPlan?.bulletPoint5,
          ].filter(Boolean) as string[],
          badge: plan.renewable ? 'GREEN' : index === 0 ? 'RECOMMENDED' : undefined,
          badgeReason: plan.renewable
            ? '100% renewable energy from Texas wind and solar'
            : index === 0
            ? 'Best value based on your home\'s usage profile'
            : undefined,
          // Enriched fields from usage calculation
          annualCost,
          renewable: plan.renewable,
          // New fields from 2TIO API
          logo: rawPlan?.logo,
          leadTime: rawPlan?.leadTime,
          vendorPhone: rawPlan?.vendorPhone || rawPlan?.callCenterPhone,
          vendorUrl: rawPlan?.vendorUrl,
          shortDescription: rawPlan?.shortDescription,
          longDescription: rawPlan?.longDescription,
          serviceName: rawPlan?.serviceName,
          cancellationFee: rawPlan?.cancellationFee,
          renewablePercent: rawPlan?.renewablePercent,
          // Monthly cost range from API (accounts for seasonal variation)
          lowMonthly: rawPlan?.low,
          highMonthly: rawPlan?.high,
        };
      });

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

  // Update monthly usage estimate and recalculate plans
  updateMonthlyUsage: async (monthlyKwh: number) => {
    const { address, usageProfile } = get();
    if (!address?.zip) return;

    // Apply Texas seasonal pattern to monthly average
    // Summer months (Jun-Sep) are ~40% higher, winter/spring are ~20% lower
    const seasonalMultipliers = [0.85, 0.80, 0.85, 0.95, 1.10, 1.30, 1.40, 1.40, 1.20, 1.00, 0.90, 0.85];
    const usage = seasonalMultipliers.map(m => Math.round(monthlyKwh * m));
    const annualKwh = usage.reduce((sum, val) => sum + val, 0);

    // Update usage profile with new estimates
    set({
      usageProfile: {
        usage,
        home_age: usageProfile?.home_age || 0,
        square_footage: usageProfile?.square_footage || 0,
        found_home_details: false, // User-adjusted, not from Zillow
      },
      homeDetails: {
        squareFootage: usageProfile?.square_footage || 0,
        homeAge: usageProfile?.home_age || 0,
        yearBuilt: 0,
        annualKwh,
        foundDetails: false, // User-adjusted
      },
    });

    // Refetch plans with new usage
    await get().fetchElectricityPlans(address.zip);
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
