import React from "react";

import { Stack } from "expo-router";

const stackOptions = {
  headerShown: false,
};

export default function TabLayout() {
  return (
    <Stack screenOptions={stackOptions}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
