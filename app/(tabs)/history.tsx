import { Text, View, Image } from "react-native";
import Positionnement from "@/components/positionnement";

export default function HomeScreen() {
  return (
    <Positionnement>
      <View>
        <Text className="m-4 text-lg underline font-bold">Août</Text>
      </View>

      <View style={{ margin: 4, padding: 4, flexDirection: 'row', alignItems: 'center', gap:10, borderColor: 'white', borderWidth: 1,}}>
          <Image source={require("@/assets/images/0 (1).jpeg")} style={{ width: 60, height: 40 }} />
          <View className=" flex flex-row justify-between gap-20">
            <View>
            <Text className=" font-bold text-lg">chicha</Text>
            <Text className="text-blue-500 font-bold">3000F</Text>
            </View>
            <Text className="font-semibold">3</Text>
          </View>
          <Text className="text-right mt-10 mr-10">7 Août 2022</Text>
      </View>
    </Positionnement>
  );
}
   