import { useEffect, useState } from "react";

import { WebviewEvent } from "@/constants/webview";
import { useFcm } from "@/hooks/use-fcm";
import { useWebView } from "@/hooks/use-webview";
import type { OrderProps } from "@/types/order";

import { ActivityIndicator, Linking, Platform, StyleSheet, View } from "react-native";
import Purchases, {
  LOG_LEVEL,
  PURCHASES_ERROR_CODE,
  type PurchasesError,
} from "react-native-purchases";
import WebView, { type WebViewMessageEvent } from "react-native-webview";

const SERVICE_INTRODUCTION_URL = process.env.EXPO_PUBLIC_SERVICE_INTRODUCTION_URL ?? "";
const WEBVIEW_URL = process.env.EXPO_PUBLIC_WEBVIEW_URL ?? "";

const IOS_PURCHASES_API_KEY = process.env.EXPO_PUBLIC_IOS_PURCHASES_API_KEY ?? "";
const ANDROID_PURCHASES_API_KEY = process.env.EXPO_PUBLIC_ANDROID_PURCHASES_API_KEY ?? "";

const isPurchasesError = (error: unknown): error is PurchasesError => {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  );
};

export default function WebviewScreen() {
  const [isWebReady, setIsWebReady] = useState(false);

  const { webviewRef, postMessage } = useWebView();

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
      const alarmEnabled = await requestUserPermission();
      postMessage(WebviewEvent.GET_ALARM_STATUS, { alarmEnabled });
      return;
    }

    if (type === WebviewEvent.OPEN_SERVICE_INTRODUCTION) {
      return Linking.openURL(SERVICE_INTRODUCTION_URL);
    }

    if (type === WebviewEvent.GET_DEVICE_TOKEN) {
      const fcmToken = await getDeviceToken();
      if (fcmToken === null) return;

      postMessage(WebviewEvent.REGISTER_DEVICE_TOKEN, { fcmToken });
      return;
    }

    if (type === WebviewEvent.OPEN_SERVICE_INTRODUCTION) {
      return Linking.openURL(SERVICE_INTRODUCTION_URL);
    }

    if (type === WebviewEvent.GET_DEVICE_TOKEN) {
      const fcmToken = await getDeviceToken();
      if (fcmToken === null) return;

      postMessage(WebviewEvent.REGISTER_DEVICE_TOKEN, { fcmToken });
      return;
    }

    if (type === WebviewEvent.REQUEST_ORDER) {
      const order = data as OrderProps;
      const storeProductId = order.storeProductId;

      try {
        const storeProducts = await Purchases.getProducts([storeProductId]);
        const targetStoreProduct = storeProducts[0];

        if (targetStoreProduct === undefined) {
          postMessage(WebviewEvent.REQUEST_ORDER_FAILED, { error: "해당 상품이 없습니다." });
          return;
        }

        const purchaseResult = await Purchases.purchaseStoreProduct(targetStoreProduct);
        postMessage(WebviewEvent.REQUEST_ORDER_SUCCESS, {
          orderId: order.orderId,
          productIdentifier: storeProductId,
          transactionIdentifier: purchaseResult.transaction.transactionIdentifier,
        });
      } catch (error: unknown) {
        if (isPurchasesError(error)) {
          if (error.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
            postMessage(WebviewEvent.REQUEST_ORDER_CANCELLED, { error: "결제가 취소되었습니다." });
            return;
          }
        }
        postMessage(WebviewEvent.REQUEST_ORDER_FAILED, { error });
      }

      return;
    }
  };

  useEffect(() => {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

    if (Platform.OS === "ios") {
      Purchases.configure({ apiKey: IOS_PURCHASES_API_KEY });
    } else if (Platform.OS === "android") {
      Purchases.configure({ apiKey: ANDROID_PURCHASES_API_KEY });
    }
  }, []);

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
          webviewDebuggingEnabled={__DEV__}
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
