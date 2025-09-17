import "react-native-reanimated";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export const unstable_settings = {
  anchor: "(tabs)",
};

const stackOptions = {
  headerShown: false,
};

export default function RootLayout() {
  return (
    <>
      <Stack initialRouteName="(tabs)">
        <Stack.Screen name="(tabs)" options={stackOptions} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
