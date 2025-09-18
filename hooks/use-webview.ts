import { useRef } from "react";

import { WebView } from "react-native-webview";

const postMessageInstance = (webviewRef: React.RefObject<WebView | null>) => {
  return {
    postMessage: (type: string, data: unknown) => {
      webviewRef.current?.postMessage(JSON.stringify({ type, data }));
    },
  };
};

/**
 * @description WebView와 통신하기 위한 hook
 * @returns {Object} WebView 관련 객체
 * @returns {React.RefObject<WebView | null>} webviewRef - WebView에 할당하는 ref
 * @returns {Function} postMessage - WebView와 통신할 수 있는 postMessage 함수
 */
export const useWebView = () => {
  const webviewRef = useRef<WebView | null>(null);

  const { postMessage } = postMessageInstance(webviewRef);

  return { webviewRef, postMessage };
};
