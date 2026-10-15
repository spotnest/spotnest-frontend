import type {
  ChatMessage,
  FallbackStep,
  MatchedProperty,
  PropertySearchCriteria,
} from "@/src/modules/ai/types/ai";

export type UserRole =
  | "user"
  | "tenant"
  | "admin"
  | "owner";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  image?: string;
  isVerified?: boolean;
  isBlock?: boolean;
  status?: string;
  verificationStatus?: "unsubmitted" | "pending" | "approved" | "rejected";
  locationName?: string;
  locationResolvedName?: string;
}

export type AuthStatus =
  | "idle"
  | "loading"
  | "succeeded"
  | "failed";

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  status: AuthStatus;
  error: string | null;
  pendingEmail: string | null;
  otpPurpose: "login" | "forgot-password" | null;
}

export interface AiAssistantState {
  isOpen: boolean;
  messages: ChatMessage[];
  /** Backs the sequential chat message ids (`user-1`, `assistant-2`, …). */
  messageSeq: number;

  /** The user's original requirements preserved across broadening passes. */
  originalCriteria: PropertySearchCriteria;
  /** The criteria applied to the currently displayed results (original or relaxed fallback). */
  activeCriteria: PropertySearchCriteria;

  fallbackSteps: FallbackStep[];
  currentStepIndex: number;
  attemptedSteps: string[];

  matches: MatchedProperty[];
  /** True once a search has run, so the results area knows to render. */
  hasSearched: boolean;

  isThinking: boolean;
  isSearching: boolean;
  error: string | null;

  /**
   * Guards against overlapping turns (double-click, Enter spam) so one user
   * message never fires two extraction + search passes.
   */
  isTurnInFlight: boolean;
  lastUserMessage: string | null;
}
