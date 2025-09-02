import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

type LikesContextValue = {
	likedIds: Set<number>;
	toggleLike: (id: number) => void;
	isLiked: (id: number) => boolean;
};

const LikesContext = createContext<LikesContextValue | undefined>(undefined);

export const LikesProvider = ({ children }: { children: React.ReactNode }) => {
	const [likedIdsState, setLikedIdsState] = useState<Set<number>>(new Set());

	const toggleLike = useCallback((id: number) => {
		setLikedIdsState((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	}, []);

	const isLiked = useCallback((id: number) => likedIdsState.has(id), [likedIdsState]);

	const value = useMemo(
		() => ({ likedIds: likedIdsState, toggleLike, isLiked }),
		[likedIdsState, toggleLike, isLiked]
	);

	return <LikesContext.Provider value={value}>{children}</LikesContext.Provider>;
};

export const useLikes = () => {
	const ctx = useContext(LikesContext);
	if (!ctx) {
		throw new Error("useLikes must be used within LikesProvider");
	}
	return ctx;
};



