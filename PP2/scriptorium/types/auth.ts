export interface TokenPayload {
    userId: number;
    type: 'access' | 'refresh';
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}


export interface UserProfile {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    avatarUrl?: string;
    permission: string;
}
