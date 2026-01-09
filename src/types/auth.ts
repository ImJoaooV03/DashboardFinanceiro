export interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  website: string | null;
  email?: string;
}

export interface AuthState {
  user: any | null; // Supabase User
  profile: UserProfile | null;
  isLoading: boolean;
}
