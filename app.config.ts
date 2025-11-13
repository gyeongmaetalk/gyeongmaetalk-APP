import { ConfigContext, ExpoConfig } from "@expo/config";

import { config } from "dotenv";

config();

const isProduction = process.env.ENV === "production";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "경매톡",
  slug: "gyeongmaetalk",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "gyeongmaetalk",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.gyeongmaetalk.gyeongmaetalk",
    googleServicesFile: process.env.GOOGLE_SERVICES_PLIST ?? "./GoogleService-Info.plist",
    entitlements: {
      "aps-environment": isProduction ? "production" : "development",
    },
    infoPlist: {
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: false,
        NSExceptionDomains: {
          localhost: { NSExceptionAllowsInsecureHTTPLoads: true },
        },
      },
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    versionCode: 1,
    adaptiveIcon: {
      backgroundColor: "#ffffff",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: "com.gyeongmaetalk.gyeongmaetalk",
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? "./google-services.json",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
      },
    ],
    "@react-native-firebase/app",
    "@react-native-firebase/messaging",
    [
      "expo-build-properties",
      {
        android: {
          compileSdkVersion: 35,
          targetSdkVersion: 35,
          buildToolsVersion: "35.0.0",
        },
        ios: {
          deploymentTarget: "15.1",
          useFrameworks: "static",
          buildReactNativeFromSource: true,
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    eas: {
      projectId: "173dd514-9f9c-410d-b9e5-9449b1f2bcb1",
    },
  },
  updates: {
    url: "https://u.expo.dev/173dd514-9f9c-410d-b9e5-9449b1f2bcb1",
  },
  runtimeVersion: {
    policy: "appVersion",
  },
});
