// ==========================================
// MODELOS COMPARTIDOS - TIPOS TYPESCRIPT
// Sincronizados con Prisma Schema (server/prisma/schema.prisma)
// ==========================================

// --- ENUMS ---

/** Roles de usuario en la plataforma */
export enum UserRole {
  REGULAR = 'REGULAR',
  PREMIUM = 'PREMIUM',
  ADMIN = 'ADMIN',
}

/** Tipo de cuenta del usuario */
export enum AccountType {
  PERSONAL = 'PERSONAL',
  PROFESSIONAL = 'PROFESSIONAL',
  COMBINED = 'COMBINED',
}

/** Contexto de una transacción o cuenta */
export enum AccountContext {
  PERSONAL = 'PERSONAL',
  PROFESSIONAL = 'PROFESSIONAL',
}

/** Proveedor de autenticación */
export enum AuthProvider {
  LOCAL = 'LOCAL',
  GOOGLE = 'GOOGLE',
  FACEBOOK = 'FACEBOOK',
}

/** Estado de la suscripción del usuario */
export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  CANCELED = 'CANCELED',
  EXPIRED = 'EXPIRED',
  FAILED = 'FAILED',
}

/** Proveedor de pago para la suscripción */
export enum PaymentProvider {
  BINANCE = 'BINANCE',
  PAYPAL = 'PAYPAL',
  MANUAL = 'MANUAL',
}

/** Tipo de transacción financiera */
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER',
}

/** Tipo de deuda o financiamiento */
export enum DebtType {
  CREDIT_LINE = 'CREDIT_LINE',
  LOAN = 'LOAN',
}

/** Estado de una factura */
export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  PAID = 'PAID',
  PARTIAL = 'PARTIAL',
  VOID = 'VOID',
  REFUNDED = 'REFUNDED',
}

/** Estado de una meta de ahorro */
export enum GoalStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  PAUSED = 'PAUSED',
}

/** Tipo de notificación */
export enum NotificationType {
  REMINDER = 'REMINDER',
  SYSTEM = 'SYSTEM',
  GOAL_REACHED = 'GOAL_REACHED',
  LOW_STOCK = 'LOW_STOCK',
  DEBT_DUE = 'DEBT_DUE',
  DEVALUATION_ALERT = 'DEVALUATION_ALERT',
  RENEWAL_REMINDER = 'RENEWAL_REMINDER',
}

/** Estado de un comprobante OCR procesado */
export enum OcrStatus {
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CONVERTED = 'CONVERTED',
}

/** Fuente de la tasa de cambio */
export enum ExchangeRateSource {
  BCV = 'BCV',
  CUSTOM = 'CUSTOM',
}

// --- INTERFACES PRINCIPALES ---

export interface UserPreferences {
  displayCurrency: 'USD' | 'VES';
  hasRecurringExpenses: boolean;
  hasFixedIncome: boolean;
  hasSavingsGoals: boolean;
  hasFreelanceIncome: boolean;
  hasClientInvoices: boolean;
  hasProviders?: boolean;
  preferredCurrency?: string;
  timezone?: string;
  dateFormat?: string;
  notifyOnDebtDue?: boolean;
  notifyOnLowStock?: boolean;
  notifyOnGoalReached?: boolean;
  notifyOnDevaluation?: boolean;
  customExchangeRate?: number | null;
  useCustomRate?: boolean;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  username?: string;
  avatarUrl?: string;
  accountType: AccountType;
  role: UserRole;
  isConfigured: boolean;
  provider?: AuthProvider;
  externalId?: string;
  preferences?: UserPreferences;
  subscription?: Subscription;
  createdAt?: string;
  updatedAt?: string;
}

export interface Plan {
  id: string;
  name: string;
  displayName: string;
  price: number;
  currency: string;
  billingCycle: string;
  durationDays: number;
  trialDays: number;
  features: string[];
  isActive: boolean;
}

export interface PaymentMethod {
  id: string;
  provider: PaymentProvider;
  externalEmail?: string;
  bankName?: string;
  idNumber?: string;
  phoneNumber?: string;
  isDefault: boolean;
  createdAt: string;
}

export interface Subscription {
  id: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate?: string;
  canceledAt?: string;
  expiredAt?: string;
  trialEndsAt?: string;
  gracePeriodEndsAt?: string;
  plan: Plan;
  paymentMethod?: PaymentMethod;
  planId: string;
  paymentMethodId?: string;
}

export interface SubscriptionRenewal {
  id: string;
  subscriptionId: string;
  renewedAt: string;
  newEndDate: string;
  amountPaid: number;
  paymentMethodId: string;
  paymentMethod?: PaymentMethod;
  subscription?: Subscription;
}

// --- DTOs / REQUESTS ---

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface LoginLocalRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  code: string;
  userAgent?: string;
}

export interface GoogleLoginRequest {
  email: string;
  name: string;
  externalId: string;
  avatarUrl?: string;
  userAgent?: string;
}

export interface OnboardingRequest {
  accountType: AccountType;
  displayCurrency?: 'USD' | 'VES';
  hasRecurringExpenses?: boolean;
  hasFixedIncome?: boolean;
  hasSavingsGoals?: boolean;
  hasFreelanceIncome?: boolean;
  hasClientInvoices?: boolean;
  hasProviders?: boolean;
}

export interface OnboardingResponse {
  success: boolean;
  message: string;
}

export interface CreatePaymentMethodRequest {
  provider: PaymentProvider;
  externalEmail?: string;
  bankName?: string;
  idNumber?: string;
  phoneNumber?: string;
  isDefault?: boolean;
}

export interface ProcessPaymentRequest {
  planId: string;
  paymentMethodId: string;
  amount: number;
  reference?: string;
  metadata?: Record<string, any>;
}

export interface VerifyBinancePaymentRequest {
  txHash: string;
  expectedAmount: number;
  expectedAddress: string;
}

export interface VerifyPayPalPaymentRequest {
  orderId: string;
  expectedAmount: number;
}

export interface VerifyMobilePaymentRequest {
  bankName: string;
  phoneNumber: string;
  amount: number;
  reference: string;
}

// --- RESPONSES ---

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// --- TIPOS DE UTILIDAD ---

export type UserRoleType = UserRole.REGULAR | UserRole.PREMIUM | UserRole.ADMIN;
export type AccountTypeType = AccountType.PERSONAL | AccountType.PROFESSIONAL | AccountType.COMBINED;
export type SubscriptionStatusType = SubscriptionStatus.ACTIVE | SubscriptionStatus.CANCELED | SubscriptionStatus.EXPIRED | SubscriptionStatus.FAILED;

// Type guards
export function isPremiumRole(role: UserRole): boolean {
  return role === UserRole.PREMIUM || role === UserRole.ADMIN;
}

export function isAdminRole(role: UserRole): boolean {
  return role === UserRole.ADMIN;
}

export function hasActivePremium(subscription: Subscription | undefined): boolean {
  return subscription?.status === SubscriptionStatus.ACTIVE && subscription?.plan.name.startsWith('PREMIUM');
}