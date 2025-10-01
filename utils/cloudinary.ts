// Temporaire pour test - remplacer par vos vraies valeurs
const CLOUDINARY_URL =
  process.env.EXPO_PUBLIC_CLOUDINARY_URL || process.env.CLOUDINARY_URL;
const EXPLICIT_CLOUD_NAME =
  process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || "dwxxerm66";
const API_BASE =
  process.env.EXPO_PUBLIC_CLOUDINARY_API_BASE ||
  "https://api.cloudinary.com/v1_1";
const UPLOAD_PRESET =
  process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "dwxxerm66";

function getCloudName(): string {
  if (!CLOUDINARY_URL) return "";
  // format attendu: cloudinary://api_key:api_secret@cloud_name
  try {
    const withoutProtocol = CLOUDINARY_URL.replace(/^cloudinary:\/\//, "");
    const atIndex = withoutProtocol.lastIndexOf("@");
    if (atIndex === -1) return "";
    return withoutProtocol.slice(atIndex + 1);
  } catch {
    return "";
  }
}

export interface CloudinaryUploadResult {
  asset_id: string;
  public_id: string;
  version: number;
  version_id: string;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  folder?: string;
  original_filename: string;
  [key: string]: any; // fallback pour champs additionnels
}

export async function uploadImageToCloudinary(
  localUri: string,
  mimeType: string = "image/jpeg"
): Promise<CloudinaryUploadResult> {
  console.log("EXPLICIT_CLOUD_NAME:", EXPLICIT_CLOUD_NAME);
  console.log("UPLOAD_PRESET:", UPLOAD_PRESET);
  const cloudName = EXPLICIT_CLOUD_NAME || getCloudName();
  console.log("cloudName:", cloudName);
  if (!cloudName)
    throw new Error(
      "Cloudinary cloud name introuvable (EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME ou CLOUDINARY_URL)"
    );
  if (!UPLOAD_PRESET)
    throw new Error(
      "Upload preset manquant (EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET)"
    );

  // déterminer extension en fonction du mimeType
  const extension = mimeType.split("/")[1] || "jpg";

  const endpoint = `${API_BASE}/${cloudName}/image/upload`;
  console.log("endpoint:", endpoint);
  const formData = new FormData();

  formData.append("file", {
    // @ts-ignore React Native type
    uri: localUri,
    type: mimeType,
    name: `upload.${extension}`,
  } as any);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    let message = `Upload échoué (${res.status})`;
    try {
      const j = await res.json();
      message = j?.error?.message || message;
    } catch {}
    throw new Error(message);
  }

  const data: CloudinaryUploadResult = await res.json();
  return data;
}
