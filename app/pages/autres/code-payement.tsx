import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";




export default function PaymentCodeScreen() {
  const [pin, setPin] = useState("");

  const handleContinue = () => {
    // Ici tu peux valider ou envoyer le code PIN
    console.log("Code PIN saisi:", pin);
  
  };

  return (
    <View style={styles.container} className="mt-10">
      {/* Bouton retour */}
      
        <Link href="/pages/autres/payement" style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#333" />
         </Link>
            
      
     

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
      <Link href="/pages/autres/payement-sucess" style={styles.button}>
      <TouchableOpacity  onPress={handleContinue}>
        <Text style={styles.buttonText} className="text-center">Continuer</Text>
      </TouchableOpacity>      
      </Link>

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
