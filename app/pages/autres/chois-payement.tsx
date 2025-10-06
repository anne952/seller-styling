import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type PaymentMethod = {
  id: string;
  name: string;
  image: string;
};

export default function ChoosePaymentScreen() {
  const [selected, setSelected] = useState<string | null>(null);

  const paymentMethods: PaymentMethod[] = [
    { id: "flooz", name: "Flooz", image: "https://via.placeholder.com/60" },
    { id: "mixx", name: "Mixx by Yas", image: "https://via.placeholder.com/60" },
  ];

  return (
    <View style={styles.container} className="mt-16">
      {/* Bouton retour */}
      <Link href="/pages/autres/cart" style={styles.backLink}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </Link>

      {/* Titre */}
      <Text style={styles.title}>Choisir un moyen de paiement</Text>

      {/* Liste des moyens de paiement */}
      {paymentMethods.map((method) => (
        <TouchableOpacity
          key={method.id}
          style={styles.paymentRow}
          onPress={() => setSelected(method.id)}
        >
          <Image source={{ uri: method.image }} style={styles.paymentImage} />
          <Text style={styles.paymentName}>{method.name}</Text>
          <View style={styles.radioOuter}>
            {selected === method.id && <View style={styles.radioInner} />}
          </View>
        </TouchableOpacity>
      ))}

      {/* Bouton continuer (link vers la page suivante) */}
      {selected ? (
        <Link href={{
          pathname: "/pages/autres/code-payement",
          params: { method: selected }
        }} style={styles.button}>
          <Text style={styles.buttonText}>Continuer</Text>
        </Link>
      ) : (
        <View style={[styles.button, { backgroundColor: "#ccc" }]}>
          <Text style={styles.buttonText}>Continuer</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, },
  backLink: { marginBottom: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 30, textAlign: "center" },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
  },
  paymentImage: { width: 60, height: 60, borderRadius: 8, marginRight: 15 },
  paymentName: { flex: 1, fontSize: 16, fontWeight: "600" },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#606FEF",
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#606FEF",
  },
  button: {
    backgroundColor: "#606FEF",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 30,
    textAlign: "center"
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" , textAlign:"center"},
});
