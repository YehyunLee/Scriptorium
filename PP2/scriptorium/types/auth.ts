export interface TokenPayload {
    userId: number;
    type: 'access' | 'refresh';
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}


export interface UserProfile {
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string | null;
    avatarUrl: string | null;
    permission: string;
}


export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
}
