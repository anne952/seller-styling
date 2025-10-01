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
        const backendPayload = payload.email ? { email: payload.email, password: payload.password } : { nom: payload.name, password: payload.password };
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
        // if (Array.isArray(payload.speciality)) body.specialite = payload.speciality;

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
    name: string;
    price: number;
    promoPrice?: number;
    images: string[];
    description?: string;
    colors?: string[];
    sizes?: string[];
    categorieId?: number;
    couleurId?: number;
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
        // Mapper les champs du payload vers les champs attendus par le backend
        const body: any = {
            nom: payload.name,
            prix: payload.price,
            description: payload.description,
            images: payload.images, // Backend attend images comme array de URLs
            categorieId: payload.categorieId,
            couleurId: payload.couleurId, // Garder couleurId pour compatibilité
            // Envoyer toutes les tailles si multiples (backend peut traiter array)
            tailles: payload.sizes, // Nouveaux champs pour multiples
            couleurs: payload.colors, // Nouveaux champs pour multiples
        };
        // Pour taille, utiliser la première pour compatibilité mais ajoutez aussi les array
        if (payload.sizes && payload.sizes.length > 0) {
            body.taille = payload.sizes[0]; // Garde compatibilité avec ancienne API
        }
        return apiFetch<Product>(`/api/products`, { method: "POST", body, auth: true });
    },
    remove: (id: string) => apiFetch<void>(`/api/products/${id}`, { method: "DELETE", auth: true }),
};

export type Order = {
    id: string;
    items: Array<{ productId: string; quantity: number; price: number }>;
    total: number;
    status: "validation" | "en_cours" | "livree" | "annulee";
};

export const OrdersApi = {
    create: (payload: { items: Array<{ productId: string; quantity: number }>; note?: string }) =>
        apiFetch<Order>(`/api/orders`, { method: "POST", body: payload, auth: true }),
    order: (payload: { productId: string; quantity: number; note?: string }) =>
        apiFetch<Order>(`/api/order`, { method: "POST", body: payload, auth: true }),
    myOrders: () => apiFetch<Order[]>(`/api/orders/mine`, { auth: true }),
    validate: (id: string) => apiFetch<Order>(`/api/orders/${id}/validate`, { method: "POST", auth: true }),
    cancel: (id: string) => apiFetch<Order>(`/api/orders/${id}/cancel`, { method: "POST", auth: true }),
    deliver: (id: string) => apiFetch<Order>(`/api/orders/${id}/deliver`, { method: "POST", auth: true }),
};

export const ReviewsApi = {
    create: (payload: { vendorId: string; rating: number; comment?: string }) =>
        apiFetch(`/api/reviews`, { method: "POST", body: payload, auth: true }),
    byVendor: (vendeurId: string) => apiFetch(`/api/reviews/vendor/${vendeurId}`),
    byUser: (userId: string) => apiFetch(`/api/reviews/user/${userId}`, { auth: true }),
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

export const StatsApi = {
    dashboardCards: () => apiFetch(`/api/stats/dashboard-cards`, { auth: true }),
    salesYearly: () => apiFetch(`/api/stats/sales/yearly`, { auth: true }),
    usersLine: () => apiFetch(`/api/stats/users/line`, { auth: true }),
};
