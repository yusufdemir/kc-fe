export type IUser = {
  uid?: string;
  email?: string | null;
  photoURL?: string | null;
  metadata?: { creationTime?: string | null } | null;
} | null;
