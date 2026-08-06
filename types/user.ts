export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: number;
  isBlocked?: boolean;
  blockedAt?: unknown;
  deletedAt?: unknown;
  createdAt?: unknown;
}
