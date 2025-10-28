import { useEffect, useState } from "react";

import { getApp, initializeApp } from "@react-native-firebase/app";
import {
  AuthorizationStatus,
  FirebaseMessagingTypes,
  getMessaging,
  getToken,
  onMessage,
  requestPermission,
} from "@react-native-firebase/messaging";

import { PermissionsAndroid, Platform } from "react-native";

import googleServiceInfo from "../google-services.json";

function convertGoogleServiceInfoToFirebaseConfig() {
  return {
    appId: googleServiceInfo.client[0].client_info.mobilesdk_app_id,
    projectId: googleServiceInfo.project_info.project_id,
    messagingSenderId: googleServiceInfo.project_info.project_number,
    apiKey: googleServiceInfo.client[0].api_key[0].current_key,
    storageBucket: googleServiceInfo.project_info.storage_bucket,
    databaseURL: "",
  };
}

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
        let app = getApp();

        // android이고 초기화가 되지 않은 경우 json 파일을 이용해 초기화
        if (Platform.OS === "android" && app === null) {
          app = await initializeApp(convertGoogleServiceInfoToFirebaseConfig());
        }

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
