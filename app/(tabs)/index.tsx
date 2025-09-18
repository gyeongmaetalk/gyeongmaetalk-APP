import { useState } from "react";

import { useWebView } from "@/hooks/use-webview";

import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView, WebViewMessageEvent } from "react-native-webview";

export default function WebviewScreen() {
  const { webviewRef, postMessage } = useWebView();

  // isWebReady가 true일 때만 postMessage 호출하기
  const [isWebReady, setIsWebReady] = useState(false);

  const onMessage = (e: WebViewMessageEvent) => {
    const payload = JSON.parse(e.nativeEvent.data);
    if (payload?.type === "WEB_READY") {
      setIsWebReady(true);
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
