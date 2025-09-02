import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";



export default function PaymentSuccessScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      {/* Titre */}
      <Text style={styles.title}>Paiement réussi</Text>

      {/* Rond noir avec check */}
      <View style={styles.circle}>
        <Ionicons name="checkmark" size={60} color="#fff" />
      </View>

      {/* Bouton suivre la commande */}
      <Link href="/pages/autres/suivre-commande" style={styles.button} >
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
