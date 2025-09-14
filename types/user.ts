export interface UserData {
  // Auth data
  id: string;
  email: string;
  emailConfirmedAt: string | null;
  phone: string | null;
  phoneConfirmedAt: string | null;
  dob: string | null; // date field from your schema
  gender: string | null;

  // Profile data
  username: string | null;
  fullName: string | null;
  role: 'subscriber' | 'member' | 'affiliate' | 'admin';
  avatarUrl: string | null;
  verificationCompleted: boolean;
  inviterId: string | null;
  affiliateRequestStatus: 'pending' | 'approved' | 'rejected' | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface UserContextType {
  userData: UserData | null;
  isLoading: boolean;
  error: string | null;
  refreshUserData: () => Promise<void>;
  resendEmailConfirmation: () => Promise<void>;
  updateProfile?: (updates: any) => Promise<any>;
}

export interface UserStats {
  totalPoints: number;
  tasksCompleted: number;
  vouchersEarned: number;
  memberSince: string;
}

export interface Achievement {
  id: number;
  title: string;
  description: string;
  date: string;
}