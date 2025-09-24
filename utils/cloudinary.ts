const CLOUDINARY_URL = process.env.EXPO_PUBLIC_CLOUDINARY_URL || process.env.CLOUDINARY_URL;
const EXPLICIT_CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
const API_BASE = process.env.EXPO_PUBLIC_CLOUDINARY_API_BASE || "https://api.cloudinary.com/v1_1";
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "";

function getCloudName(): string {
	if (!CLOUDINARY_URL) return "";
	// format: cloudinary://api_key:api_secret@cloud_name
	try {
		const withoutProtocol = CLOUDINARY_URL.replace(/^cloudinary:\/\//, "");
		const atIndex = withoutProtocol.lastIndexOf("@");
		if (atIndex === -1) return "";
		return withoutProtocol.slice(atIndex + 1);
	} catch {
		return "";
	}
}

export async function uploadImageToCloudinary(localUri: string): Promise<string> {
    const cloudName = EXPLICIT_CLOUD_NAME || getCloudName();
    if (!cloudName) throw new Error("Cloudinary cloud name introuvable (EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME ou CLOUDINARY_URL)");
	if (!UPLOAD_PRESET) throw new Error("Upload preset manquant (EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET)");

    const endpoint = `${API_BASE}/${cloudName}/image/upload`;
	const formData: any = new FormData();
	formData.append("file", {
		// @ts-ignore RN File type
		uri: localUri,
		type: "image/jpeg",
		name: "upload.jpg",
	});
	formData.append("upload_preset", UPLOAD_PRESET);

	const res = await fetch(endpoint, {
		method: "POST",
		body: formData,
	});
	if (!res.ok) {
		let message = `Upload échoué (${res.status})`;
		try { const j = await res.json(); message = j?.error?.message || message; } catch {}
		throw new Error(message);
	}
	const data = await res.json();
	return data.secure_url as string;
}
