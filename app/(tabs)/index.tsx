import { useState } from "react";

import { WebviewEvent } from "@/constants/webview";
import { useWebView } from "@/hooks/use-webview";
import { checkNotificationPermission } from "@/utils/notification";

import { Linking, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView, WebViewMessageEvent } from "react-native-webview";

export default function WebviewScreen() {
  const { webviewRef, postMessage } = useWebView();

  // isWebReady가 false일 때 Loading 화면 보여주기
  const [isWebReady, setIsWebReady] = useState(false);

  const onMessage = async (e: WebViewMessageEvent) => {
    const payload = JSON.parse(e.nativeEvent.data);
    if (payload?.type === WebviewEvent.WEB_READY) {
      setIsWebReady(true);
      return;
    }
    if (payload?.type === WebviewEvent.OPEN_SETTING) {
      return Linking.openSettings();
    }
    if (payload?.type === WebviewEvent.GET_ALARM_STATUS) {
      const alarmEnabled = await checkNotificationPermission();
      postMessage(WebviewEvent.GET_ALARM_STATUS, { alarmEnabled });
      return;
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
