import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { LikesApi } from "@/utils/auth";

type LikesContextValue = {
	likedIds: Set<number>;
	toggleLike: (id: number) => void;
	isLiked: (id: number) => boolean;
};

const LikesContext = createContext<LikesContextValue | undefined>(undefined);

export const LikesProvider = ({ children }: { children: React.ReactNode }) => {
	const [likedIdsState, setLikedIdsState] = useState<Set<number>>(new Set());

	useEffect(() => {
		LikesApi.list().then(likes => {
			setLikedIdsState(new Set(likes.map((l: any) => Number(l.produitId))));
		}).catch(err => console.error('Erreur chargement likes:', err));
	}, []);

	const toggleLike = useCallback((id: number) => {
		setLikedIdsState((prev) => {
			const next = new Set(prev);
			const wasLiked = next.has(id);
			if (wasLiked) {
				next.delete(id);
				// Remove from server (ignore error)
				LikesApi.remove(id).catch(err => console.error('Erreur remove like:', err));
			} else {
				next.add(id);
				// Add to server (ignore error)
				LikesApi.add(id).catch(err => console.error('Erreur add like:', err));
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
