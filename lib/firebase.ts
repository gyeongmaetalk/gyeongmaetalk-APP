import { convertGoogleServiceInfoToFirebaseConfig } from "@/utils/firebase";
import { getApp, initializeApp } from "@react-native-firebase/app";
import {
  AuthorizationStatus,
  FirebaseMessagingTypes,
  getMessaging,
  getToken,
  requestPermission,
} from "@react-native-firebase/messaging";

import { PermissionsAndroid, Platform } from "react-native";

let messaging: FirebaseMessagingTypes.Module | null = null;
let appInitialized = false;

// firebase 초기화
export const initFirebase = async () => {
  if (appInitialized) return;

  try {
    let app;
    // android인 경우 json 파일을 이용해 초기화
    if (Platform.OS === "android") {
      app = await initializeApp(convertGoogleServiceInfoToFirebaseConfig());
    } else {
      // 그 외의 경우는 기존 앱 인스턴스 사용
      app = getApp();
    }

    messaging = getMessaging(app);
    appInitialized = true;
  } catch (e) {
    console.error("Firebase init failed:", e);
  }
};

// 기기 토큰 추출
export const getDeviceToken = async () => {
  if (!messaging) await initFirebase();
  return await getToken(messaging!);
};

// 푸시 알람 권한 요청
export const requestUserPermission = async (): Promise<boolean> => {
  if (!messaging) await initFirebase();

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
    const authStatus = await requestPermission(messaging!);
    return (
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL
    );
  }

  return false;
};
