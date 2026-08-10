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

function statusToModificationStatus(status: BannerStatus): ModificationStatus {
  return status === "LIVE" ? "ACTIVE" : "SCHEDULED";
}

export async function getBanners(): Promise<Banner[]> {
  const items = await bannersService.list();
  return items.map((item) => {
    const ui = toUiBanner(item);
    return {
      id: ui.id,
      thumbnailUrl: ui.thumbnailUrl,
      title: ui.title,
      subtitle: item.subtitle ?? null,
      location: ui.location,
      ctaLabel: ui.ctaLabel,
      ctaPath: ui.ctaPath,
      status: ui.status,
      startsAt: item.startsAt ?? null,
      endsAt: item.endsAt ?? null,
    };
  });
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
  const payload: CreateAdminBannerInput = {
    title: data.title.trim(),
    slug: slugify(data.title) || `banner-${Date.now()}`,
    imageUrl: thumbnailUrl || data.imageUrl || "",
    mobileUrl: data.mobileUrl || thumbnailUrl,
    tabletUrl: data.tabletUrl,
    desktopUrl: data.desktopUrl,
    subtitle: data.subtitle,
    badge: data.badge,
    ctaLabel: data.ctaLabel.trim(),
    ctaColor: data.ctaColor,
    backgroundColor: data.backgroundColor,
    linkUrl: data.ctaPath.trim(),
    linkType: data.linkType || "ROUTE",
    linkTarget: data.ctaPath.trim(),
    placement: data.placement || data.location || "HOME_HERO",
    bannerType: data.bannerType || "IMAGE",
    displayOrder: data.displayOrder ?? 0,
    priority: data.priority ?? 0,
    startsAt: data.startsAt ? new Date(data.startsAt).toISOString() : undefined,
    endsAt: data.endsAt ? new Date(data.endsAt).toISOString() : undefined,
    publish: data.status === "LIVE",
  };

  const created = await bannersService.create(payload);
  if (data.status === "LIVE") {
    await bannersService.publish(created.id);
  }
  const ui = toUiBanner(created);
  return {
    id: ui.id,
    thumbnailUrl: ui.thumbnailUrl,
    title: ui.title,
    location: ui.location,
    ctaLabel: ui.ctaLabel,
    ctaPath: ui.ctaPath,
    status: data.status,
  };
}

export async function updateBanner(
  id: string,
  data: BannerFormSchema,
  thumbnailUrl?: string,
): Promise<Banner | null> {
  const updated = await bannersService.update(id, {
    title: data.title.trim(),
    imageUrl: thumbnailUrl || data.imageUrl,
    mobileUrl: data.mobileUrl || thumbnailUrl,
    tabletUrl: data.tabletUrl,
    desktopUrl: data.desktopUrl,
    subtitle: data.subtitle,
    badge: data.badge,
    ctaLabel: data.ctaLabel.trim(),
    ctaColor: data.ctaColor,
    backgroundColor: data.backgroundColor,
    linkUrl: data.ctaPath.trim(),
    linkType: data.linkType || "ROUTE",
    linkTarget: data.ctaPath.trim(),
    placement: data.placement || data.location || "HOME_HERO",
    bannerType: data.bannerType || "IMAGE",
    displayOrder: data.displayOrder,
    priority: data.priority,
    startsAt: data.startsAt ? new Date(data.startsAt).toISOString() : undefined,
    endsAt: data.endsAt ? new Date(data.endsAt).toISOString() : undefined,
  });

  if (data.status === "LIVE") {
    await bannersService.publish(id);
  } else {
    await bannersService.unpublish(id);
  }

  const ui = toUiBanner(updated);
  return {
    id: ui.id,
    thumbnailUrl: thumbnailUrl || ui.thumbnailUrl,
    title: ui.title,
    location: ui.location,
    ctaLabel: ui.ctaLabel,
    ctaPath: ui.ctaPath,
    status: data.status,
  };
}

export async function deleteBanner(id: string): Promise<boolean> {
  await bannersService.remove(id);
  return true;
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
