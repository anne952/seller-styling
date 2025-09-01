import { Text, View } from "react-native";
import { ReactNode } from "react";

interface PositionnementProps {
  children: ReactNode; 
}

export default function Positionnement({ children }: PositionnementProps) {
  return (
    <View style={{        
        position: "relative",
        top: 60,
        flex: 1,
        }}>
            {children}
        </View>
  );
}
