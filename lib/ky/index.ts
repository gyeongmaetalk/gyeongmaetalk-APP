import type { BaseResponse } from "@/models";
import type { UserResponse } from "@/models/auth";

import ky from "ky";

import { useTokenStore } from "../zustand/user";

const baseUrl = process.env.EXPO_PUBLIC_BASE_URL;

const API_TIMEOUT = 10000; // 10초

export const api = ky.create({
  prefixUrl: baseUrl,
  timeout: API_TIMEOUT,
  retry: 0,
  hooks: {
    beforeRequest: [
      async (request) => {
        // 클라이언트측에서 필요한 헤더 추가 (예: 인증 토큰)
        const accessToken = useTokenStore.getState().token?.accessToken;
        if (accessToken) {
          request.headers.set("Authorization", `Bearer ${accessToken}`);
        }
      },
    ],
    afterResponse: [
      async (request, options, response) => {
        // 응답 처리 로직 (예: 토큰 갱신)
        if (response.status === 401) {
          const refreshToken = useTokenStore.getState().token?.refreshToken;
          if (refreshToken) {
            const refreshResponse = await ky
              .post<BaseResponse<UserResponse>>(baseUrl + "/auth/refresh", {
                headers: { RefreshToken: refreshToken },
                retry: 0,
              })
              .json();

            if (refreshResponse.isSuccess) {
              useTokenStore.setState({
                token: {
                  accessToken: refreshResponse.result.accessToken,
                  refreshToken: refreshResponse.result.refreshToken,
                },
              });

              // 새로운 토큰으로 기존 요청 재시도
              request.headers.set("Authorization", `Bearer ${refreshResponse.result.accessToken}`);
              return ky(request);
            } else {
              useTokenStore.setState({ token: { accessToken: null, refreshToken: null } });
            }
          }
        }

        return response;
      },
    ],
  },
});
