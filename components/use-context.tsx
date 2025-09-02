import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

type User = {
	name: string;
	email: string;
};

type UserContextValue = {
	user: User;
	updateUser: (updates: Partial<User>) => void;
};

const defaultUser: User = {
	name: "Amaka",
	email: "Amaka@gmail.com",
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


