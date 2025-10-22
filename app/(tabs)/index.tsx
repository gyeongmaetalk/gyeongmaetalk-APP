import { useState } from "react";

import { WebviewEvent } from "@/constants/webview";
import { useWebView } from "@/hooks/use-webview";
import { api } from "@/lib/ky";
import { useTokenStore } from "@/lib/zustand/user";

import { Linking, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView, WebViewMessageEvent } from "react-native-webview";

import { getDeviceToken, requestUserPermission } from "../../lib/firebase";

const SERVICE_INTRODUCTION_URL = process.env.EXPO_PUBLIC_SERVICE_INTRODUCTION_URL ?? "";

export default function WebviewScreen() {
  const { webviewRef, postMessage } = useWebView();
  const setToken = useTokenStore((state) => state.setToken);

  // isWebReady가 false일 때 Loading 화면 보여주기
  const [isWebReady, setIsWebReady] = useState(false);

  const onMessage = async (e: WebViewMessageEvent) => {
    const { type, data } = JSON.parse(e.nativeEvent.data);

    if (type === WebviewEvent.WEB_READY) {
      setIsWebReady(true);
      return;
    }
    if (type === WebviewEvent.OPEN_SETTING) {
      return Linking.openSettings();
    }
    if (type === WebviewEvent.GET_ALARM_STATUS) {
      const { accessToken, refreshToken } = data;

      setToken({ accessToken, refreshToken });
      const alarmEnabled = await requestUserPermission();
      if (alarmEnabled) {
        const token = await getDeviceToken();
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
    <SafeAreaView style={styles.container}>
      <WebView source={{ uri: "http://localhost:5173" }} ref={webviewRef} onMessage={onMessage} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
});
