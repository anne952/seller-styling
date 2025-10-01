import { AuthApi } from "@/utils/auth";
import { restoreAuthToken } from "@/utils/api";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type User = {
	id?: string; // Ajouter id pour identifier le vendeur
	name: string;
	email: string;
	role?: string; // Ajouter role
	types?: string;
	speciality?: string;
	contact?: string;
	location?: string;
	comment?: string;
	avatarUrl?: string;
};

type UserContextValue = {
	user: User;
	updateUser: (updates: Partial<User>) => void;
};

const defaultUser: User = {
	name: "Amaka",
	email: "Amaka@gmail.com",
	types: "Homme, Femme, Enfant",
	speciality: "Couture sur mesure, Retouche",
	contact: "+228 90 00 00 00",
	location: "Lomé, agoué",
	comment: "Nous sommes très heureux de vous voir ici !",
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
	const [userState, setUserState] = useState<User>(defaultUser);

	const updateUser = useCallback((updates: Partial<User>) => {
		setUserState((prev) => ({ ...prev, ...updates }));
	}, []);

	// Charger les données utilisateur depuis le backend au démarrage
	useEffect(() => {
		const loadUserData = async () => {
			try {
				// S'assurer que le token est restauré depuis SecureStore
				console.log('🔑 Restauration du token...');
				await restoreAuthToken();
				console.log('✅ Token restauré');

				console.log('🔄 Chargement données utilisateur depuis AuthApi.me()...');
				const userData = await AuthApi.me();
				console.log('✅ Données utilisateur reçues:', {
					id: userData.id,
					name: userData.name,
					avatarUrl: userData.avatarUrl,
					hasAvatar: !!userData.avatarUrl
				});
				const newUserData = {
					id: userData.id, // Ajouter id
					name: userData.name || "Utilisateur",
					email: userData.email || "",
					role: userData.role, // Ajouter role
					types: userData.types,
					speciality: userData.speciality,
					contact: userData.contact,
					location: userData.location,
					comment: userData.comment,
					avatarUrl: userData.avatarUrl,
				};
				setUserState(newUserData);
				console.log('📝 État utilisateur mis à jour avec avatarUrl:', userData.avatarUrl);
				return newUserData; // Retourner pour la comparaison
			} catch (error) {
				console.log('❌ Erreur chargement données utilisateur:', error);
				// Garder les données par défaut en cas d'erreur
				console.log('⚠️ Utilisation des données par défaut');
			}
		};

		loadUserData();
	}, []);

	const value = useMemo(() => ({ user: userState, updateUser }), [userState, updateUser]);

	return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
	const ctx = useContext(UserContext);
	if (!ctx) throw new Error("useUser must be used within UserProvider");
	return ctx;
};
