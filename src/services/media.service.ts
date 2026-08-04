import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { env } from "@/config/env";
import { getStoredAccessToken } from "@/store/auth-store";
import type { ApiResponse } from "@/types/api";

export interface MediaUploadResult {
  key: string;
  storageKey: string;
  url: string;
  publicUrl: string;
  mimeType: string;
  size: number;
  folder: string;
}

export type MediaFolder =
  | "videos"
  | "videos/home"
  | "videos/tutorial"
  | "videos/tutorials"
  | "videos/promotions"
  | "banners"
  | "offers"
  | "products"
  | "products/gallery"
  | "categories"
  | "brands"
  | "testimonials"
  | "icons"
  | "thumbnails"
  | "documents";

function parseUploadResponse(
  json: ApiResponse<MediaUploadResult> & {
    url?: string;
    storageKey?: string;
    size?: number;
    mimeType?: string;
  },
): MediaUploadResult {
  const data = json.data;
  const url = data?.publicUrl || data?.url || json.url || "";
  const storageKey = data?.storageKey || data?.key || json.storageKey || "";
  if (!url || !storageKey) {
    throw new Error(json.message || "Upload response missing url/storageKey");
  }
  return {
    key: data?.key || storageKey,
    storageKey,
    url,
    publicUrl: url,
    mimeType: data?.mimeType || json.mimeType || "",
    size: data?.size ?? json.size ?? 0,
    folder: data?.folder || "",
  };
}

export async function uploadMediaFile(
  file: File,
  folder: MediaFolder,
  options?: {
    onProgress?: (percent: number) => void;
    replaceKey?: string | null;
  },
): Promise<MediaUploadResult> {
  const form = new FormData();
  form.append("file", file);
  form.append("folder", folder);
  if (options?.replaceKey) {
    form.append("replaceKey", options.replaceKey);
  }

  const params = new URLSearchParams({ folder });
  if (options?.replaceKey) {
    params.set("replaceKey", options.replaceKey);
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      `${env.apiBaseUrl}${API_ENDPOINTS.ADMIN_CMS.MEDIA_UPLOAD}?${params.toString()}`,
    );
    const token = getStoredAccessToken();
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      options?.onProgress?.(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      try {
        const json = JSON.parse(
          xhr.responseText,
        ) as ApiResponse<MediaUploadResult> & {
          url?: string;
          storageKey?: string;
          size?: number;
          mimeType?: string;
        };
        if (xhr.status >= 200 && xhr.status < 300) {
          options?.onProgress?.(100);
          resolve(parseUploadResponse(json));
          return;
        }
        reject(new Error(json.message || `Upload failed (${xhr.status})`));
      } catch {
        reject(new Error(`Upload failed (${xhr.status})`));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(form);
  });
}

export async function deleteMediaFile(keyOrUrl: string): Promise<void> {
  const isUrl =
    keyOrUrl.startsWith("http://") || keyOrUrl.startsWith("https://");
  const params = new URLSearchParams(
    isUrl ? { url: keyOrUrl } : { key: keyOrUrl },
  );
  const token = getStoredAccessToken();
  const response = await fetch(
    `${env.apiBaseUrl}${API_ENDPOINTS.ADMIN_CMS.MEDIA_DELETE}?${params.toString()}`,
    {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    },
  );
  if (!response.ok) {
    const json = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(json?.message || `Delete failed (${response.status})`);
  }
}

/** Reject blob:/data: URLs — only remote HTTPS (R2) is allowed in the database. */
export function assertRemoteMediaUrl(url: string | null | undefined): string {
  if (!url?.trim()) {
    throw new Error(
      "Media URL is required. Upload a file to Cloudflare R2 first.",
    );
  }
  if (
    url.startsWith("blob:") ||
    url.startsWith("data:") ||
    url.startsWith("/")
  ) {
    throw new Error(
      "Local preview URLs cannot be saved. Upload the file to Cloudflare R2 first.",
    );
  }
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    throw new Error(
      "Media URL must be a public HTTPS link from Cloudflare R2.",
    );
  }
  return url.trim();
}
