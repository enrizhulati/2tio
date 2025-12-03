// 2TIO API Client
// Handles all communication with 2TIO Consumer API and ERCOT (for Zillow data)

// Types for 2TIO API
export interface GetStartedRequest {
  address: string;
  unit?: string;
  city: string;
  state: string;
  zip: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  emailAddress: string;
  rentOrOwn: 'Own' | 'Rent';
  targetMoveInDate: string;
  propertyType: 'Residential' | 'Commercial';
  isBusiness: boolean;
}

export interface GetStartedResponse {
  userId: string;
  availableServices: TwotionService[];
}

export interface TwotionService {
  id: string;
  name: string;
  icon?: string;
  displayOrder: number;
  electric?: boolean;
}

export interface TwotionPlan {
  id: string;
  name: string;
  vendorId: string;
  vendorName: string;
  uPrice: number;      // Price per kWh
  mPrice: number;      // Monthly base fee
  kWh1000: number;     // Price at 1000 kWh (for comparison)
  term: number;        // Contract length in months
  cancellationFee: number;
  renewable: boolean;
  prepaid: boolean;
  bulletPoint1?: string;
  bulletPoint2?: string;
  bulletPoint3?: string;
  logo?: string;
  // Calculated fields (added by client)
  annualCost?: number;
  monthlyEstimate?: number;
}

export interface TwotionInternetPlan {
  id: string;
  name: string;
  vendorId: string;
  vendorName: string;
  serviceName: string;
  price: number;           // Monthly price
  term: number;            // Contract length in months
  downloadSpeed?: number;  // Mbps
  uploadSpeed?: number;    // Mbps
  dataCapGB?: number;      // Data cap in GB (null = unlimited)
  bulletPoint1?: string;
  bulletPoint2?: string;
  bulletPoint3?: string;
  bulletPoint4?: string;
  bulletPoint5?: string;
  logo?: string;
}

export interface PlanOption {
  id: string;
  type: 'single' | 'multi';
  selectedInt?: number;
  selectedValues?: string[];
}

export interface CartItem {
  planId: string;
  planOptions?: PlanOption[];
}

export interface Cart {
  items: CartItem[];
  total?: number;
}

export interface AppQuestion {
  id: string;
  question: string;
  type: 'text' | 'select' | 'date' | 'ssn';
  required: boolean;
  options?: string[];
}

export interface CheckoutStep {
  VendorId: string | null;
  VendorName: string | null;
  Logo: string | null;
  AppQuestions: AppQuestion[];
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

export interface CheckoutData {
  serviceStartDateSelection: string;
  appFields: Record<string, string>;
}

export interface CheckoutFiles {
  dlFile?: File;
  rentFile?: File;
  ownFile?: File;
}

export interface OrderConfirmation {
  confirmationId: string;
  orderNumber: string;
  status: string;
  services: {
    vendorName: string;
    planName: string;
    startDate: string;
  }[];
  // Deposit information (if credit check requires deposit)
  depositRequired?: boolean;
  depositAmount?: number;
  depositReason?: string;
  depositServiceName?: string;  // Which service requires deposit
  depositVendorName?: string;   // Which vendor requires deposit
}

export interface OrderStatus {
  status: string;
  services: {
    vendorName: string;
    planName: string;
    status: string;
  }[];
}

// User ID Management
const USER_ID_KEY = 'twotion-user-id';

export function getUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(USER_ID_KEY);
}

export function setUserId(id: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_ID_KEY, id);
}

export function clearUserId(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER_ID_KEY);
}

// API Functions

export async function generateUserId(): Promise<string> {
  const response = await fetch('/api/twotion?action=generate-user-id', {
    method: 'POST',
  });

  if (!response.ok) throw new Error('Failed to generate user ID');
  const data = await response.json();
  setUserId(data.userId);
  return data.userId;
}

export async function getStarted(data: GetStartedRequest): Promise<GetStartedResponse> {
  const userId = getUserId();
  if (!userId) throw new Error('User ID not found');

  const response = await fetch('/api/twotion?action=get-started', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error('Failed to initialize user');
  return response.json();
}

export async function getServices(zipCode: string): Promise<TwotionService[]> {
  const response = await fetch(`/api/twotion?action=services&zipCode=${zipCode}`);
  if (!response.ok) throw new Error('Failed to fetch services');
  return response.json();
}

export async function getPlans(serviceName: string, zipCode: string): Promise<TwotionPlan[]> {
  // Retry logic for rate limiting (429 errors)
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    if (attempt > 0) {
      // Exponential backoff: 1s, 2s, 4s
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }

    const response = await fetch(`/api/twotion?action=plans&service=${serviceName}&zipCode=${zipCode}`);

    if (response.ok) {
      return response.json();
    }

    // If rate limited (429), retry
    if (response.status === 429 && attempt < maxRetries - 1) {
      console.warn(`Rate limited fetching ${serviceName} plans, retrying (attempt ${attempt + 1}/${maxRetries})...`);
      continue;
    }

    // Other errors or final retry failed
    lastError = new Error(`Failed to fetch ${serviceName} plans: ${response.status}`);
  }

  throw lastError || new Error('Failed to fetch plans');
}

export async function getCart(): Promise<Cart> {
  const userId = getUserId();
  if (!userId) throw new Error('User ID not found');

  const response = await fetch('/api/twotion?action=cart', {
    headers: { 'x-user-id': userId },
  });

  if (!response.ok) throw new Error('Failed to fetch cart');
  return response.json();
}

export async function addPlanToCart(planId: string, options?: PlanOption[]): Promise<void> {
  const userId = getUserId();
  if (!userId) throw new Error('User ID not found');

  const response = await fetch('/api/twotion?action=add-to-cart', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId,
    },
    body: JSON.stringify({ planId, planOptions: options }),
  });

  if (!response.ok) throw new Error('Failed to add to cart');
}

export async function removePlanFromCart(planId: string): Promise<void> {
  const userId = getUserId();
  if (!userId) throw new Error('User ID not found');

  const response = await fetch(`/api/twotion?action=remove-from-cart&planId=${planId}`, {
    method: 'DELETE',
    headers: { 'x-user-id': userId },
  });

  if (!response.ok) throw new Error('Failed to remove from cart');
}

export async function getCheckoutSteps(): Promise<CheckoutStep[]> {
  const userId = getUserId();
  if (!userId) throw new Error('User ID not found');

  const response = await fetch('/api/twotion?action=checkout-steps', {
    headers: { 'x-user-id': userId },
  });

  if (!response.ok) throw new Error('Failed to fetch checkout steps');
  return response.json();
}

export async function completeCheckout(
  data: CheckoutData,
  files: CheckoutFiles
): Promise<OrderConfirmation> {
  const userId = getUserId();
  if (!userId) throw new Error('User ID not found');

  const formData = new FormData();
  formData.append('data', JSON.stringify(data));

  if (files.dlFile) formData.append('dlFile', files.dlFile);
  if (files.rentFile) formData.append('rentFile', files.rentFile);
  if (files.ownFile) formData.append('ownFile', files.ownFile);

  const response = await fetch('/api/twotion?action=checkout', {
    method: 'POST',
    headers: { 'x-user-id': userId },
    body: formData,
  });

  if (!response.ok) throw new Error('Failed to complete checkout');
  return response.json();
}

export async function getOrderStatus(
  confirmationId: string,
  lastName: string,
  zip: string
): Promise<OrderStatus> {
  const params = new URLSearchParams({
    action: 'order-status',
    confirmationId,
    lastName,
    zip,
  });

  const response = await fetch(`/api/twotion?${params}`);
  if (!response.ok) throw new Error('Failed to fetch order status');
  return response.json();
}

// ESIID lookup via 2TIO
export async function getEsiid(address: {
  streetNumber: string;
  streetName: string;
  city: string;
  state: string;
  zipCode: string;
}): Promise<{ ESIID: string }[]> {
  const userId = getUserId();
  if (!userId) throw new Error('User ID not found');

  const params = new URLSearchParams({
    action: 'get-esiid',
    ...address,
  });

  const response = await fetch(`/api/twotion?${params}`, {
    headers: { 'x-user-id': userId },
  });

  if (!response.ok) throw new Error('Failed to get ESIID');
  const data = await response.json();
  return data.results || [];
}

// Cost Calculation Utilities
// Note: API returns kWh1000 in cents (e.g., 9 = 9¢/kWh), uPrice is often 0

export function calculateAnnualCost(
  usage: number[],
  kWh1000: number,
  mPrice: number
): number {
  // Convert kWh1000 from cents to dollars (divide by 100)
  const ratePerKwh = kWh1000 / 100;
  const energyCost = usage.reduce((total, monthKwh) => total + (monthKwh * ratePerKwh), 0);
  const baseFees = mPrice * 12;
  return energyCost + baseFees;
}

export function calculateMonthlyEstimate(
  usage: number[],
  kWh1000: number,
  mPrice: number
): number {
  return calculateAnnualCost(usage, kWh1000, mPrice) / 12;
}

export function enrichPlansWithCosts(
  plans: TwotionPlan[],
  usage: number[]
): TwotionPlan[] {
  return plans.map((plan) => ({
    ...plan,
    annualCost: calculateAnnualCost(usage, plan.kWh1000, plan.mPrice),
    monthlyEstimate: calculateMonthlyEstimate(usage, plan.kWh1000, plan.mPrice),
  }));
}

// Format helpers
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return num.toLocaleString();
}
