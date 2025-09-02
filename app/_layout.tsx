import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { CartProvider } from "../components/cart-context";
import { LikesProvider } from "../components/likes-context";
import { SellerProductsProvider } from "../components/seller-products-context";
import { UserProvider } from "../components/use-context";
import "../global.css";

export default function RootLayout() {
  return (
    <LikesProvider>
      <CartProvider>
        <UserProvider>
          <SellerProductsProvider>
            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent"  />
            <Stack screenOptions={{ headerShown: false }} />
          </SellerProductsProvider>
        </UserProvider>
      </CartProvider>
    </LikesProvider>
  );
}
