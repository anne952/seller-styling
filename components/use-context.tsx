import { AuthApi } from "@/utils/auth";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type User = {
	name: string;
	email: string;
	types?: string;
	speciality?: string;
	contact?: string;
	location?: string;
	comment?: string;
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
				const userData = await AuthApi.me();
				setUserState({
					name: userData.name || "Utilisateur",
					email: userData.email || "",
					types: userData.types,
					speciality: userData.speciality,
					contact: userData.contact,
					location: userData.location,
					comment: userData.comment,
				});
			} catch (error) {
				console.log('Erreur chargement données utilisateur:', error);
				// Garder les données par défaut en cas d'erreur
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


