import { useEffect, useState } from "react";

import { getApp } from "@react-native-firebase/app";
import type {
  FirebaseMessagingTypes} from "@react-native-firebase/messaging";
import {
  AuthorizationStatus,
  getMessaging,
  getToken,
  onMessage,
  requestPermission,
} from "@react-native-firebase/messaging";

import { PermissionsAndroid, Platform } from "react-native";

function onMessageReceived(messaging: FirebaseMessagingTypes.Module) {
  onMessage(messaging, async (remoteMessage) => {
    console.log(Platform.OS, "Message received:", remoteMessage);
  });
}

export const useFcm = () => {
  const [messaging, setMessaging] = useState<FirebaseMessagingTypes.Module | null>(null);

  // 기기 토큰 추출
  const getDeviceToken = async () => {
    if (!messaging) return null;

    return await getToken(messaging);
  };

  // 푸시 알람 권한 요청
  const requestUserPermission = async (): Promise<boolean> => {
    if (!messaging) return false;
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

  useEffect(() => {
    const initFirebase = async () => {
      try {
        const app = getApp();
        const initializedMessaging = getMessaging(app);

        setMessaging(initializedMessaging);
        onMessageReceived(initializedMessaging);
      } catch (e) {
        console.error("Firebase init failed:", e);
      }
    };

    initFirebase();
  }, []);

  return { getDeviceToken, requestUserPermission };
};
