import { useActivity } from "@/components/activity-context";
import { useCart } from "@/components/cart-context";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";



export default function PaymentSuccessScreen({ navigation }: any) {
  const { addActivity } = useActivity();
  const { items, totalPrice, totalCount } = useCart();
  // Build a simple order record; in real app fill from cart/checkout state
  const now = new Date();
  const first = items[0];
  const order = {
    id: String(now.getTime()),
    type: 'commande' as const,
    title: first ? (items.length > 1 ? `${first.name} + ${items.length - 1} autres` : first.name) : 'Commande',
    price: `${totalPrice}F`,
    quantity: totalCount || 1,
    date: now.toLocaleDateString(),
    step: 1,
    image: first?.image,
  };
  React.useEffect(() => {
    addActivity(order);
  }, []);
  return (
    <View style={styles.container}>
      {/* Titre */}
      <Text style={styles.title}>Paiement réussi</Text>

      {/* Rond noir avec check */}
      <View style={styles.circle}>
        <Ionicons name="checkmark" size={60} color="#fff" />
      </View>

      {/* Bouton suivre la commande */}
      <Link
        href={{ pathname: "/pages/autres/suivre-commande", params: { id: order.id, title: order.title, quantity: String(order.quantity), price: order.price, date: order.date, step: String(order.step) } }}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Suivre la commande</Text>

      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 40,
    textAlign: "center",
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 50,
  },
  button: {
    backgroundColor: "#606FEF",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
