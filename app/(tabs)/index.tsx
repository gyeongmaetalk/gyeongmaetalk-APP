import { useState } from "react";

import { WebviewEvent } from "@/constants/webview";
import { useFcm } from "@/hooks/use-fcm";
import { useWebView } from "@/hooks/use-webview";
import { api } from "@/lib/ky";
import { useTokenStore } from "@/lib/zustand/user";

import { ActivityIndicator, Linking, Platform, StyleSheet, View } from "react-native";
import WebView, { WebViewMessageEvent, WebViewNavigation } from "react-native-webview";

const SERVICE_INTRODUCTION_URL = process.env.EXPO_PUBLIC_SERVICE_INTRODUCTION_URL ?? "";
const WEBVIEW_URL = process.env.EXPO_PUBLIC_WEBVIEW_URL ?? "";

/**
 * URL이 앱스킴인지 확인하는 함수
 */
const noAppScheme = ["http", "https", "about", "data", "javascript", "file"];

const isAppScheme = (url: string): boolean => {
  if (!url) return false;
  const scheme = url.split("://")[0];
  return !noAppScheme.includes(scheme);
};

/**
 * iOS에서 앱스킴 URL 처리
 * Android는 네이티브 레벨에서 WebViewClient로 처리됨
 */
const onShouldStartLoadWithRequest = (request: WebViewNavigation): boolean => {
  // iOS만 React Native 레벨에서 처리
  if (Platform.OS === "ios") {
    const { url } = request;

    // 앱스킴 URL 처리 (http/https가 아닌 경우)
    if (isAppScheme(url)) {
      Linking.openURL(url).catch((error) => {
        console.error("앱 실행 실패:", error);
      });
      return false; // WebView에서 로드하지 않음
    }
  }

  // 일반 웹 URL은 WebView에서 로드
  return true;
};

export default function WebviewScreen() {
  const [isWebReady, setIsWebReady] = useState(false);

  const { webviewRef, postMessage } = useWebView();

  const setToken = useTokenStore((state) => state.setToken);

  const { getDeviceToken, requestUserPermission } = useFcm();

  const onLoad = () => {
    setIsWebReady(true);
  };

  const onMessage = async (e: WebViewMessageEvent) => {
    const { type, data } = JSON.parse(e.nativeEvent.data);

    if (type === WebviewEvent.OPEN_SETTING) {
      return Linking.openSettings();
    }

    if (type === WebviewEvent.GET_ALARM_STATUS) {
      const { accessToken, refreshToken } = data;

      setToken({ accessToken, refreshToken });
      const alarmEnabled = await requestUserPermission();
      if (alarmEnabled) {
        const token = await getDeviceToken();
        if (token === null) return;
        await api.post("fcm/token", { searchParams: { fcmToken: token } }).json();
      }
      postMessage(WebviewEvent.GET_ALARM_STATUS, { alarmEnabled });
      return;
    }

    if (type === WebviewEvent.OPEN_SERVICE_INTRODUCTION) {
      return Linking.openURL(SERVICE_INTRODUCTION_URL);
    }
  };

  return (
    <>
      {!isWebReady && (
        <View style={styles.activityIndicatorContainer}>
          <ActivityIndicator size="large" />
        </View>
      )}
      <View style={styles.container}>
        <WebView
          source={{ uri: WEBVIEW_URL }}
          ref={webviewRef}
          onLoad={onLoad}
          onMessage={onMessage}
          onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  activityIndicatorContainer: {
    flex: 1,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
});
