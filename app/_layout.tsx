import { ActivityProvider } from "@/components/activity-context";
import { CartProvider } from "@/components/cart-context";
import { LikesProvider } from "@/components/likes-context";
import { SellerProductsProvider } from "@/components/seller-products-context";
import { UserProvider } from "@/components/use-context";
import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import "../global.css";

export default function RootLayout() {
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
