import { apiFetch, setAuthToken } from "@/utils/api";

export type AuthUser = {
    id: string;
    name: string;
    email: string;
    role: "admin" | "vendeur" | "client";
    avatarUrl?: string;
    location?: string;
    contact?: string;
    types?: string;
    speciality?: string;
    comment?: string;
};

export type AuthResponse = {
    token: string;
    user: AuthUser;
};

const mapBackendUserToAuthUser = (u: any): AuthUser => ({
    id: String(u.id),
    name: u.nom ?? u.name ?? "",
    email: u.email ?? "",
    role: u.role,
    avatarUrl: u.photoProfil,
    location: u.localisation,
    contact: u.telephone,
    types: Array.isArray(u.typeCouture) ? u.typeCouture.join(", ") : u.typeCouture,
    speciality: Array.isArray(u.specialite) ? u.specialite.join(", ") : u.specialite,
    comment: u.commentaire,
});

export const AuthApi = {
    register: async (payload: {
        name: string;
        email: string;
        password: string;
        role?: "vendeur" | "client";
        localisation?: string;
        telephone?: string;
        typeCouture?: string[];
        specialite?: string[];
    }) => {
        const backendPayload: any = {
            nom: payload.name,
            email: payload.email,
            password: payload.password,
            role: payload.role ?? "client",
        };

        // Ajouter les champs spécifiques aux vendeurs
        if (payload.role === "vendeur") {
            backendPayload.localisation = payload.localisation;
            backendPayload.telephone = payload.telephone;
            backendPayload.typeCouture = payload.typeCouture;
            backendPayload.specialite = payload.specialite;
        }

        console.log('Register payload:', backendPayload);
        try {
            const raw = await apiFetch<any>(`/api/auth/register`, { method: "POST", body: backendPayload });
            console.log(' Register response:', raw);
        const user = mapBackendUserToAuthUser(raw.user);
        console.log("Mapped user avatarUrl:", user.avatarUrl);
        const mapped: AuthResponse = {
                token: raw.token,
                user,
            };
            setAuthToken(mapped.token);
            return mapped;
        } catch (error) {
            console.log('Register error:', error);
            throw error;
        }
    },
    login: async (payload: { email?: string; name?: string; password: string }) => {
        const backendPayload = payload.email ? { email: payload.email, password: payload.password, app: 'vendeur' } : { nom: payload.name, password: payload.password, app: 'vendeur' };
        console.log('🔐 Login payload:', backendPayload);
        try {
            const raw = await apiFetch<any>(`/api/auth/login`, { method: "POST", body: backendPayload });
            console.log('🔐 Login response:', raw);
            const user = mapBackendUserToAuthUser(raw.user);
            console.log("Mapped user avatarUrl:", user.avatarUrl);
            const mapped: AuthResponse = {
                token: raw.token,
                user,
            };
            setAuthToken(mapped.token);
            return mapped;
        } catch (error) {
            console.log('🔐 Login error:', error);
            throw error;
        }
    },
    logout: async () => {
        try { await apiFetch(`/api/auth/logout`, { method: "POST", auth: true }); } finally { setAuthToken(null); }
    },
    me: async () => {
        const raw = await apiFetch<any>(`/api/auth/me`, { auth: true });
        return mapBackendUserToAuthUser(raw);
    },
    updateProfile: async (payload: Partial<{ name: string; email: string; avatarUrl: string; location: string; contact: string; types: string; speciality: string; comment: string }>) => {
        // App dédié vendeurs: utiliser systématiquement /api/auth/profile
        const body: any = {
            nom: payload.name,
            email: payload.email,
            photoProfil: payload.avatarUrl,
            localisation: payload.location,
            telephone: payload.contact,
            commentaire: payload.comment,
        };
        // Facultatif: si types/speciality fournis sous forme de chaîne, ne pas envoyer (le backend attend des enums[])
        // Vous pourrez activer ci-dessous quand l'UI proposera un multi-choix normalisé
        // if (Array.isArray(payload.types)) body.typeCouture = payload.types;
        // if (Array.isArray(payload.speciality)) body.specialite = payload.specialite;

        Object.keys(body).forEach(key => {
            if (body[key] === undefined || body[key] === null || body[key] === '') {
                delete body[key];
            }
        });

        console.log('📝 UpdateProfile payload (/api/auth/profile):', body);
        const raw = await apiFetch<any>(`/api/auth/profile`, { method: "PUT", body, auth: true });
        // L'API renvoie { message, user } → utiliser raw.user si présent
        return mapBackendUserToAuthUser((raw as any)?.user ?? raw);
    },
};

export const UsersApi = {
    meUpdate: (payload: Partial<{ name: string; email: string; avatarUrl: string }>) => {
        const body: any = {
            nom: payload.name,
            email: payload.email,
            photoProfil: payload.avatarUrl,
        };
        Object.keys(body).forEach((k) => (body[k] == null || body[k] === '') && delete body[k]);
        return apiFetch<AuthUser>(`/api/users/me`, { method: "PUT", body, auth: true });
    },
    postExpoPushToken: (payload: { expoPushToken: string }) =>
        apiFetch<void>(`/api/users/me/expo-push-token`, { method: "POST", body: payload, auth: true }),
};

export type ProductPayload = {
    nom: string;
    prix: number;
    promoPrice?: number;
    images: string[];
    description?: string;
    tailles: string[];
    categorieId?: number;
    couleurIds: number[];
};

export type Product = ProductPayload & {
    id: string;
    taille?: string;
    vendeurId?: number;
    enPromotion?: boolean;
    prixPromotion?: number;
    productImages?: Array<{id: number, url: string}>;
    couleurs?: Array<{couleur: {nom: string, hex?: string}}>;
};

export const ProductsApi = {
    list: () => apiFetch<Product[]>(`/api/products`),
    create: (payload: ProductPayload) => {
        // Payload directement compatible avec le backend
        const body: any = {
            nom: payload.nom,
            prix: payload.prix,
            description: payload.description,
            images: payload.images,
            categorieId: payload.categorieId,
            tailles: payload.tailles,
            prixPromotion: payload.promoPrice,
            couleurIds: payload.couleurIds,
            // Le backend attend également un champ `taille` (valeur unique)
            // On envoie la première taille si disponible pour satisfaire la contrainte
            taille: Array.isArray(payload.tailles) && payload.tailles.length > 0 ? payload.tailles[0] : undefined,
        };
        return apiFetch<Product>(`/api/products`, { method: "POST", body, auth: true });
    },
    remove: (id: string) => apiFetch<void>(`/api/products/${id}`, { method: "DELETE", auth: true }),
};

export type OrderItemPayload = {
    productId: string;
    quantity: number;
    price: number; // prix unitaire
};

export type OrderPayload = {
    items: OrderItemPayload[];
    totalAmount: number;
    location?: string;
    paymentMethod?: 'Tmoney' | 'Flooz';
    note?: string;
};

export type Order = {
    id: string;
    items: Array<{ produitId: number; quantite: number; prixUnitaire: number; total: number }>;
    total: number;
    status: "validation" | "en_cours" | "livree" | "annulee";
    payement?: { montant: number; moyenDePayement: 'Tmoney' | 'Flooz' };
};

const mapOrderStatus = (backendStatus: string) => {
    switch (backendStatus) {
        case 'enAttente': return 'validation';
        case 'en_cours_pour_la_livraison': return 'en_cours';
        case 'livree': return 'livree';
        case 'annulee': return 'annulee';
        case 'rupture': return 'annulee'; // treat as canceled
        default: return 'validation';
    }
};

const mapOrderFields = (order: any): Order => ({
    ...order,
    id: String(order.id),
    total: Number(order.montant),
    items: order.ligneCommande.map((ligne: any) => ({
        produitId: ligne.produitId,
        quantite: ligne.quantite,
        prixUnitaire: Number(ligne.prixUnitaire),
        total: Number(ligne.total),
    })),
    status: mapOrderStatus(order.status),
    payement: order.payement ? {
        montant: Number(order.payement.montant),
        moyenDePayement: order.payement.moyenDePayement,
    } : undefined,
});

export const OrdersApi = {
    // Créer une commande (aligné backend)
    create: async (payload: OrderPayload) => {
        const response = await apiFetch<{ message: string; order: any }>(`/api/orders`, {
            method: "POST",
            body: {
                items: payload.items.map(i => ({
                    produitId: Number(i.productId),
                    quantite: i.quantity,
                    prixUnitaire: i.price,
                })),
                localisation: payload.location,
                payement: {
                    montant: payload.totalAmount,
                    moyenDePayement: payload.paymentMethod || 'Flooz',
                },
                note: payload.note,
            },
            auth: true,
        });
        return mapOrderFields(response.order);
    },

    // Traitement de paiement séparé si nécessaire
    processPayment: (payload: {
        items: Array<{ productId: string; quantity: number; price: number }>;
        totalAmount: number;
        paymentMethod: 'Tmoney' | 'Flooz';
        buyerLocation?: string;
        buyerInfo?: { id: string; name: string; email: string; phone?: string };
    }) =>
        apiFetch<Order>(`/api/orders/payment`, {
            method: "POST",
            body: {
                items: payload.items.map(i => ({
                    produitId: Number(i.productId),
                    quantite: i.quantity,
                    prixUnitaire: i.price,
                })),
                payement: {
                    montant: payload.totalAmount,
                    moyenDePayement: payload.paymentMethod,
                },
                localisation: payload.buyerLocation,
                buyerInfo: payload.buyerInfo,
            },
            auth: true,
        }),

    // Ajouter un seul produit à une commande existante ou temporaire
    order: (payload: { productId: string; quantity: number; price: number; note?: string }) =>
        apiFetch<Order>(`/api/order`, {
            method: "POST",
            body: {
                items: [
                    {
                        produitId: Number(payload.productId),
                        quantite: payload.quantity,
                        prixUnitaire: payload.price,
                    },
                ],
                note: payload.note,
            },
            auth: true,
        }),

    // Liste des commandes de l'utilisateur
    myOrders: async () => {
        const orders = await apiFetch<any[]>(`/api/orders/me`, { auth: true });
        return orders.map(mapOrderFields);
    }, // for clients purchases

    // Liste des commandes du vendeur (leurs ventes)
    sellerOrders: () => apiFetch<any[]>(`/api/orders/mine`, { auth: true }), // for sellers sales

    // Valider une commande
    validate: (id: string) => apiFetch<Order>(`/api/orders/${id}/validate`, { method: "POST", auth: true }),

    // Annuler une commande
    cancel: (id: string) => apiFetch<Order>(`/api/orders/${id}/cancel`, { method: "POST", auth: true }),

    // Marquer une commande comme livrée
    deliver: (id: string) => apiFetch<Order>(`/api/orders/${id}/deliver`, { method: "POST", auth: true }),
};

export const ReviewsApi = {
    create: (payload: { vendorId: string; rating: number; comment?: string }) =>
        apiFetch(`/api/reviews`, { method: "POST", body: payload, auth: true }),
    byVendor: (vendeurId: string) => apiFetch(`/api/reviews/vendor/${vendeurId}`),
    byUser: (userId: string) => apiFetch(`/api/reviews/user/${userId}`, { auth: true }),
    byProduct: (productId: string) => apiFetch(`/api/reviews/product/${productId}`), // publique
    update: (reviewId: string, payload: { rating?: number; comment?: string }) =>
        apiFetch(`/api/reviews/${reviewId}`, { method: "PUT", body: payload, auth: true }),
    remove: (reviewId: string) => apiFetch(`/api/reviews/${reviewId}`, { method: "DELETE", auth: true }),
    list: () => apiFetch(`/api/reviews`, { auth: true }),
};

export const CategoriesApi = {
    list: () => apiFetch(`/api/categories`),
    create: (payload: { name: string }) => apiFetch(`/api/categories`, { method: "POST", body: payload, auth: true }),
};

export const ColorsApi = {
    list: () => apiFetch(`/api/colors`),
    create: (payload: { name: string; hex: string }) => apiFetch(`/api/colors`, { method: "POST", body: payload, auth: true }),
};

export const LikesApi = {
    // Liste des likes de l'utilisateur
    list: () => apiFetch<any[]>(`/api/likes`, { auth: true }),
    // Ajouter un like
    add: (produitId: number) => apiFetch(`/api/likes`, { method: 'POST', body: { produitId }, auth: true }),
    // Supprimer un like
    remove: (produitId: number) => apiFetch(`/api/likes/${produitId}`, { method: 'DELETE', auth: true }),
};

export const StatsApi = {
    dashboardCards: () => apiFetch(`/api/stats/dashboard-cards`, { auth: true }),
    salesYearly: () => apiFetch(`/api/stats/sales/yearly?t=${Date.now()}`, { auth: true }),
    usersLine: () => apiFetch(`/api/stats/users/line`, { auth: true }),
    // API pour les statistiques du vendeur
    sellerStats: () => apiFetch(`/api/stats/seller`, { auth: true }),
    // API pour les gains du vendeur
    sellerEarnings: () => apiFetch(`/api/stats/vendeur/earnings`, { auth: true }),
};
