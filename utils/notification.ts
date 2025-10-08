import * as Notifications from "expo-notifications";

export const checkNotificationPermission = async () => {
  const { status } = await Notifications.getPermissionsAsync();

  if (status !== "granted") {
    const { status: newStatus } = await Notifications.requestPermissionsAsync();

    return newStatus === "granted";
  }

  return status === "granted";
};
