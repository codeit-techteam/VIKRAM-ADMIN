import {
  BANNER_MODIFICATIONS,
  BANNERS,
} from "@/features/cms/constants/banner.mock";
import type { BannerFormSchema } from "@/features/cms/schema/banner-form.schema";
import type {
  Banner,
  BannerModification,
  BannerStatus,
  ModificationStatus,
} from "@/features/cms/types/banner.types";

/** In-memory mock store — frontend only. Replace with real API later. */
let bannersStore: Banner[] = structuredClone(BANNERS);
let modificationsStore: BannerModification[] =
  structuredClone(BANNER_MODIFICATIONS);
let nextBannerId = BANNERS.length + 1;
let nextModificationId = BANNER_MODIFICATIONS.length + 1;

function delay(ms = 120): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function statusToModificationStatus(status: BannerStatus): ModificationStatus {
  return status === "LIVE" ? "ACTIVE" : "SCHEDULED";
}

export async function getBanners(): Promise<Banner[]> {
  await delay();
  return structuredClone(bannersStore);
}

export async function getBannerModifications(): Promise<BannerModification[]> {
  await delay();
  return structuredClone(modificationsStore);
}

export async function createBanner(
  data: BannerFormSchema,
  thumbnailUrl?: string,
): Promise<Banner> {
  await delay();

  const id = String(nextBannerId);
  nextBannerId += 1;
  const slug = slugify(data.title) || `banner-${id}`;

  const banner: Banner = {
    id,
    thumbnailUrl:
      thumbnailUrl ?? `https://picsum.photos/seed/${slug}-banner/120/72`,
    title: data.title.trim(),
    location: data.location.trim(),
    ctaLabel: data.ctaLabel.trim(),
    ctaPath: data.ctaPath.trim(),
    status: data.status,
  };

  bannersStore = [banner, ...bannersStore];

  const modification: BannerModification = {
    id: String(nextModificationId),
    thumbnailUrl:
      thumbnailUrl ?? `https://picsum.photos/seed/${slug}-mod/80/80`,
    name: banner.title,
    hubTargeting: banner.location,
    status: statusToModificationStatus(banner.status),
    clicks: 0,
    updatedBy: "Super Admin",
    updatedByAvatar: "https://picsum.photos/seed/super-admin/32/32",
  };
  nextModificationId += 1;
  modificationsStore = [modification, ...modificationsStore];

  return structuredClone(banner);
}

export async function updateBanner(
  id: string,
  data: BannerFormSchema,
  thumbnailUrl?: string,
): Promise<Banner | null> {
  await delay();

  const index = bannersStore.findIndex((banner) => banner.id === id);
  if (index === -1) return null;

  const existing = bannersStore[index];
  const updated: Banner = {
    ...existing,
    title: data.title.trim(),
    location: data.location.trim(),
    ctaLabel: data.ctaLabel.trim(),
    ctaPath: data.ctaPath.trim(),
    status: data.status,
    thumbnailUrl: thumbnailUrl ?? existing.thumbnailUrl,
  };

  bannersStore = bannersStore.map((banner) =>
    banner.id === id ? updated : banner,
  );

  return structuredClone(updated);
}

export async function deleteBanner(id: string): Promise<boolean> {
  await delay();
  const before = bannersStore.length;
  bannersStore = bannersStore.filter((banner) => banner.id !== id);
  return bannersStore.length < before;
}

export function queryBanners(
  banners: Banner[],
  filters: { search: string; status: string; pageSize: number },
): Banner[] {
  const search = filters.search.trim().toLowerCase();

  return banners
    .filter((banner) => {
      const matchesSearch =
        !search ||
        banner.title.toLowerCase().includes(search) ||
        banner.location.toLowerCase().includes(search) ||
        banner.ctaLabel.toLowerCase().includes(search) ||
        banner.ctaPath.toLowerCase().includes(search);

      const matchesStatus =
        filters.status === "all" ||
        banner.status.toLowerCase() === filters.status.toLowerCase();

      return matchesSearch && matchesStatus;
    })
    .slice(0, filters.pageSize);
}

export function queryBannerModifications(
  modifications: BannerModification[],
  filters: { search: string; status: string },
): BannerModification[] {
  const search = filters.search.trim().toLowerCase();

  return modifications.filter((item) => {
    const matchesSearch =
      !search ||
      item.name.toLowerCase().includes(search) ||
      item.hubTargeting.toLowerCase().includes(search) ||
      item.updatedBy.toLowerCase().includes(search);

    const matchesStatus =
      filters.status === "all" ||
      item.status.toLowerCase() === filters.status.toLowerCase();

    return matchesSearch && matchesStatus;
  });
}
