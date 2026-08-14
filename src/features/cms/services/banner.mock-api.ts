import {
  bannersService,
  toUiBanner,
  type CreateAdminBannerInput,
} from "@/services/cms-banners.service";
import type { BannerFormSchema } from "@/features/cms/schema/banner-form.schema";
import type {
  Banner,
  BannerModification,
  BannerStatus,
  ModificationStatus,
} from "@/features/cms/types/banner.types";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

function asRemoteUrl(value?: string | null): string | undefined {
  const url = value?.trim() || "";
  if (
    !url ||
    url.startsWith("blob:") ||
    url.startsWith("data:") ||
    url.startsWith("/")
  ) {
    return undefined;
  }
  return url;
}

function toIsoDate(value?: string): string | undefined {
  if (!value?.trim()) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

function statusToModificationStatus(status: BannerStatus): ModificationStatus {
  return status === "ACTIVE" || status === "SCHEDULED" ? "ACTIVE" : "SCHEDULED";
}

function toBanner(item: Parameters<typeof toUiBanner>[0]): Banner {
  const ui = toUiBanner(item);
  return {
    id: ui.id,
    thumbnailUrl: ui.thumbnailUrl,
    name: ui.name,
    description: ui.description,
    title: ui.title,
    subtitle: ui.subtitle,
    location: ui.location,
    ctaLabel: ui.ctaLabel,
    ctaPath: ui.ctaPath,
    linkType: ui.linkType,
    status: ui.status,
    startsAt: ui.startsAt,
    endsAt: ui.endsAt,
    priority: ui.priority,
    targetAudience: ui.targetAudience,
    backgroundColor: ui.backgroundColor,
    ctaColor: ui.ctaColor,
    badge: ui.badge,
    mobileUrl: ui.mobileUrl,
    desktopUrl: ui.desktopUrl,
    imageUrl: ui.imageUrl,
    updatedAt: ui.updatedAt,
  };
}

function toCreatePayload(
  data: BannerFormSchema,
  thumbnailUrl?: string,
  options?: { includeSlug?: boolean },
): CreateAdminBannerInput {
  const imageUrl =
    asRemoteUrl(thumbnailUrl) ||
    asRemoteUrl(data.mobileUrl) ||
    asRemoteUrl(data.imageUrl) ||
    asRemoteUrl(data.desktopUrl) ||
    "";
  return {
    title: data.title.trim(),
    name: data.name?.trim() || data.title.trim(),
    description: data.description?.trim() || undefined,
    ...(options?.includeSlug
      ? {
          slug: `${slugify(data.name || data.title) || "banner"}-${Date.now().toString(36)}`.slice(
            0,
            120,
          ),
        }
      : {}),
    imageUrl: imageUrl || undefined,
    mobileUrl: asRemoteUrl(data.mobileUrl) || asRemoteUrl(thumbnailUrl),
    tabletUrl: asRemoteUrl(data.tabletUrl),
    desktopUrl: asRemoteUrl(data.desktopUrl),
    subtitle: data.subtitle,
    badge: data.badge?.trim() || undefined,
    ctaLabel: (data.ctaLabel ?? "").trim() || "Shop Now",
    ctaColor: data.ctaColor?.trim() || undefined,
    backgroundColor: data.backgroundColor?.trim() || undefined,
    buttonAction: data.linkType || "ROUTE",
    linkUrl: data.ctaPath.trim(),
    linkType: data.linkType || "ROUTE",
    linkTarget: data.ctaPath.trim().slice(0, 200),
    placement: data.placement || data.location || "HOME_PROMO",
    targetAudience: data.targetAudience,
    bannerType:
      data.placement === "HOME_HERO" || data.location === "HOME_HERO"
        ? "IMAGE"
        : data.bannerType || "IMAGE",
    displayOrder: data.displayOrder ?? 0,
    priority: data.priority ?? 1,
    startsAt: toIsoDate(data.startsAt),
    endsAt: toIsoDate(data.endsAt),
    publish: data.status === "ACTIVE",
  };
}

export async function getBanners(): Promise<Banner[]> {
  const items = await bannersService.list();
  return items.map(toBanner);
}

export async function getBannerModifications(): Promise<BannerModification[]> {
  const items = await bannersService.list();
  return items.map((item) => {
    const ui = toUiBanner(item);
    return {
      id: ui.id,
      thumbnailUrl: ui.thumbnailUrl,
      name: ui.title,
      hubTargeting: ui.location,
      status: statusToModificationStatus(ui.status),
      clicks: 0,
      updatedBy: "Super Admin",
      updatedByAvatar: "https://picsum.photos/seed/super-admin/32/32",
    };
  });
}

export async function createBanner(
  data: BannerFormSchema,
  thumbnailUrl?: string,
): Promise<Banner> {
  const created = await bannersService.create(
    toCreatePayload(data, thumbnailUrl, { includeSlug: true }),
  );
  if (data.status === "ACTIVE") {
    await bannersService.publish(created.id);
  }
  return toBanner(created);
}

export async function updateBanner(
  id: string,
  data: BannerFormSchema,
  thumbnailUrl?: string,
): Promise<Banner | null> {
  const updated = await bannersService.update(
    id,
    toCreatePayload(data, thumbnailUrl),
  );

  if (data.status === "ACTIVE") {
    await bannersService.publish(id);
  } else {
    await bannersService.unpublish(id);
  }

  return toBanner(updated);
}

export async function deleteBanner(id: string): Promise<boolean> {
  await bannersService.remove(id);
  return true;
}

export async function duplicateBanner(id: string): Promise<Banner> {
  const copied = await bannersService.duplicate(id);
  return toBanner(copied);
}

export async function activateBanner(id: string): Promise<Banner> {
  const published = await bannersService.publish(id);
  return toBanner(published);
}

export async function deactivateBanner(id: string): Promise<Banner> {
  const unpublished = await bannersService.unpublish(id);
  return toBanner(unpublished);
}

export async function reorderBanners(banners: Banner[]): Promise<void> {
  await bannersService.reorder(
    banners.map((banner, index) => ({
      id: banner.id,
      displayOrder: index + 1,
      priority: index + 1,
    })),
  );
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
        (banner.name ?? "").toLowerCase().includes(search) ||
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
