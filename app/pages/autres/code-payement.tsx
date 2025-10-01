import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";

export default function PaymentCodeScreen() {
  const [pin, setPin] = useState("");
  const router = useRouter();

  const handleContinue = () => {
    // Simulation de paiement réussi - quelconque code PIN est accepté
    console.log("💳 Code PIN saisi:", pin);

    // Simuler paiement réussi automatiquement
    console.log("✅ Paiement simulé réussi");
    router.replace("/pages/autres/payement-sucess");
  };

  return (
    <View style={styles.container} className="mt-10">
      {/* Bouton retour */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      {/* Texte instruction */}
      <Text style={styles.title}>Entrez votre code PIN</Text>

      {/* Input PIN */}
      <TextInput
        style={styles.input}
        value={pin}
        onChangeText={setPin}
        placeholder="****"
        keyboardType="numeric"
        secureTextEntry
        maxLength={6} // Exemple code PIN sur 6 chiffres
      />

      {/* Bouton continuer */}
      <TouchableOpacity onPress={handleContinue} style={styles.button}>
        <Text style={styles.buttonText}>Continuer</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    
    padding: 20,
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 15,
    fontSize: 20,
    textAlign: "center",
    letterSpacing: 10,
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#606FEF",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    textAlign:'center'
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign:'center'
    
  },
});
