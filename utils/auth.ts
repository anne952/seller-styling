import * as AuthSession from "expo-auth-session";
import Constants from "expo-constants";
import { Platform } from "react-native";

type SocialProfile = {
    name?: string;
    email?: string;
    avatarUrl?: string;
    provider?: "google" | "facebook" | "apple";
};

const GOOGLE_DISCOVERY = {
    authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenEndpoint: "https://oauth2.googleapis.com/token",
    revocationEndpoint: "https://oauth2.googleapis.com/revoke",
};

const ensure = (value: string | undefined, message: string) => {
    if (!value) throw new Error(message);
    return value;
};

export async function signInWithGoogle(): Promise<SocialProfile> {
    const configExtra = (Constants?.expoConfig as any)?.extra || {};
    const clientId = configExtra.googleClientId || process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
    ensure(clientId, "GOOGLE client id manquant (EXPO_PUBLIC_GOOGLE_CLIENT_ID)");

    const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });

    const authUrl = `${GOOGLE_DISCOVERY.authorizationEndpoint}?` +
        `client_id=${encodeURIComponent(clientId!)}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=token&` +
        `scope=${encodeURIComponent("openid profile email")}&` +
        `include_granted_scopes=true&` +
        `prompt=select_account`;

    const result = await AuthSession.startAsync({ authUrl });
    if (result.type !== "success" || !("access_token" in (result.params || {}))) {
        throw new Error("Connexion Google annulée ou échouée");
    }
    const accessToken = (result.params as any).access_token as string;
    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    const user = await userInfoRes.json();
    return {
        name: user.name,
        email: user.email,
        avatarUrl: user.picture,
        provider: "google",
    };
}

export async function signInWithFacebook(): Promise<SocialProfile> {
    const appId = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID;
    ensure(appId, "FACEBOOK app id manquant (EXPO_PUBLIC_FACEBOOK_APP_ID)");

    const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });
    const scope = "public_profile,email";
    const authUrl = `https://www.facebook.com/v17.0/dialog/oauth?client_id=${encodeURIComponent(appId!)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scope)}`;

    const result = await AuthSession.startAsync({ authUrl });
    if (result.type !== "success" || !("access_token" in (result.params || {}))) {
        throw new Error("Connexion Facebook annulée ou échouée");
    }
    const accessToken = (result.params as any).access_token as string;
    const meRes = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${encodeURIComponent(accessToken)}`);
    const me = await meRes.json();
    return {
        name: me.name,
        email: me.email,
        avatarUrl: me?.picture?.data?.url,
        provider: "facebook",
    };
}

export async function signInWithApple(): Promise<SocialProfile> {
    if (Platform.OS !== "ios") throw new Error("Apple Sign In uniquement sur iOS");
    // Dynamic import to avoid bundling error when the package isn't installed
    const AppleAuthentication = await import("expo-apple-authentication");
    const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
            AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
    });
    const fullName = [credential.fullName?.givenName, credential.fullName?.familyName].filter(Boolean).join(" ");
    return {
        name: fullName || undefined,
        email: credential.email || undefined,
        provider: "apple",
    };
}


