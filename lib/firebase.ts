import { getApp } from "@react-native-firebase/app";
import {
  AuthorizationStatus,
  getMessaging,
  getToken,
  requestPermission,
} from "@react-native-firebase/messaging";

import { PermissionsAndroid, Platform } from "react-native";

const app = getApp();
const messaging = getMessaging(app);

// 기기 토큰 추출
export const getDeviceToken = async () => {
  return await getToken(messaging);
};

// 푸시 알람 권한 요청
export const requestUserPermission = async (): Promise<boolean> => {
  if (Platform.OS === "android") {
    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );
    if (!hasPermission) {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  }

  if (Platform.OS === "ios") {
    const authStatus = await requestPermission(messaging);

    return (
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL
    );
  }

  return false;
};
