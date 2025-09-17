import IconNext from "@/components/IconNext";
import Positionnement from "@/components/positionnement";
import ViewNext from "@/components/ViewNext";
import { Alert, BackHandler, Text, View } from "react-native";


export default function SettingsScreen() {
  return (
    <Positionnement>
      <View className="flex-row items-center gap-10 p-2" >
        <IconNext lien="/user" />
        <Text className="text-center font-bold">Paramètres</Text>
      </View>
      <View className="mt-10 ">
      <ViewNext
        lien="/pages/autres/edit-profil"
        name="create-outline"
        title="Modifier le profil"
      />

      <ViewNext
        lien="/pages/autres/cart"
        name="cart-outline"
        title="Cart"
      />

      <ViewNext
        lien="/pages/autres/suivre-commande"
        name="checkbox-outline"
        title="Suivre la commande"
      />

      <ViewNext
        lien="/"
        name="settings-outline"
        title="Paramètres avancés"
      />

      <ViewNext
        lien="/pages/autres/aide"
        name="help-circle-outline"
        title="Aide"
      />

      <ViewNext
        onPress={() => {
          Alert.alert('Déconnexion', 'Voulez-vous quitter l\'application ?', [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Quitter', style: 'destructive', onPress: () => BackHandler.exitApp() },
          ]);
        }}
        name="arrow-forward-circle"
        title="Déconnexion"
      />      
    </View>
  </Positionnement>
);
}
    