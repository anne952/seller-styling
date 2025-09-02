import React, { useState } from "react";
import { Text, View, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface InputTextProps {
  placeholder: string;
  name?: keyof typeof Ionicons.glyphMap;
  type?: "text" | "number" | "comment" | "password" | "email";
  value?: string;
  onChangeText?: (text: string) => void;
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}

export default function InputText({
  placeholder,
  name,
  type = "text",
  value,
  onChangeText,
  secureTextEntry,
  multiline,
  numberOfLines,
  keyboardType,
  autoCapitalize
}: InputTextProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Déterminer les propriétés en fonction du type
  const getInputProps = () => {
    switch (type) {
      case "number":
        return {
          keyboardType: keyboardType || "numeric",
          autoCapitalize: autoCapitalize || "none",
        };
      case "email":
        return {
          keyboardType: keyboardType || "email-address",
          autoCapitalize: autoCapitalize || "none",
          autoCorrect: false,
        };
      case "password":
        return {
          secureTextEntry: !isPasswordVisible,
          autoCapitalize: autoCapitalize || "none",
        };
      case "comment":
        return {
          multiline: true,
          numberOfLines: numberOfLines || 4,
          textAlignVertical: "top" as const,
        };
      default:
        return {
          autoCapitalize: autoCapitalize || "sentences",
        };
    }
  };

  const inputProps = getInputProps();

  return (
    <View className="relative w-[23rem]">
      <TextInput
        placeholder={placeholder}
        className={`bg-gray-300 rounded-lg p-4 pr-12 text-gray-700 ${
          type === "comment" ? "h-32" : "h-14"
        }`}
        value={value}
        onChangeText={onChangeText}
        {...inputProps}
      />
      
      {/* Icône standard ou toggle pour le mot de passe */}
      {type === "password" ? (
        <TouchableOpacity 
          className="absolute right-3 top-0 bottom-0 items-center justify-center"
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
        >
          <Ionicons 
            name={isPasswordVisible ? "eye-off" : "eye"} 
            size={24} 
            color="black" 
          />
        </TouchableOpacity>
      ) : name ? (
        <View className="absolute right-3 top-0 bottom-0 items-center justify-center">
          <Ionicons name={name} size={24} color="black" />
        </View>
      ) : null}
    </View>
  );
}