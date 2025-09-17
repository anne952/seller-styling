import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

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

	const value = useMemo(() => ({ user: userState, updateUser }), [userState, updateUser]);

	return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
	const ctx = useContext(UserContext);
	if (!ctx) throw new Error("useUser must be used within UserProvider");
	return ctx;
};


