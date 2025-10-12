import { create } from "zustand";

type Token = string | null;

interface TokenProps {
  accessToken: Token;
  refreshToken: Token;
}

interface TokenStore {
  token: TokenProps | null;
  setToken: (token: TokenProps) => void;
}

export const useTokenStore = create<TokenStore>((set) => ({
  token: null,
  setToken: (token: TokenProps) => set({ token }),
}));
