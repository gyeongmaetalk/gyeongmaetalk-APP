export interface UserResponse {
  memberId: number;
  accessToken: string;
  refreshToken: string;
  registered: boolean;
}

export interface SignupResponse {
  memberId: number;
}
