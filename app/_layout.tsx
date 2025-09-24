import { ActivityProvider } from "@/components/activity-context";
import { CartProvider } from "@/components/cart-context";
import { LikesProvider } from "@/components/likes-context";
import { SellerProductsProvider } from "@/components/seller-products-context";
import { UserProvider } from "@/components/use-context";
import { restoreAuthToken } from "@/utils/api";
import { UsersApi } from "@/utils/auth";
import { registerForPushNotificationsAsync } from "@/utils/notifications";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { StatusBar } from "react-native";
import "../global.css";

export default function RootLayout() {
  useEffect(() => {
    (async () => {
      await restoreAuthToken();
      const token = await registerForPushNotificationsAsync();
      if (token) {
        try { await UsersApi.postExpoPushToken({ expoPushToken: token }); } catch {}
      }
    })();
  }, []);
  return (
    <LikesProvider>
      <CartProvider>
        <UserProvider>
          <SellerProductsProvider>
            <ActivityProvider>
              <StatusBar barStyle="dark-content" translucent backgroundColor="transparent"  />
              <Stack screenOptions={{ headerShown: false }} />
            </ActivityProvider>
          </SellerProductsProvider>
        </UserProvider>
      </CartProvider>
    </LikesProvider>
  );
}
