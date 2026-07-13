import {
  INITIAL_OFFERS,
  OFFER_PRODUCT_CATALOG,
  computeOfferStats,
} from "@/features/cms/constants/offer.mock";
import type { OfferFormSchema } from "@/features/cms/schema/offer-form.schema";
import type {
  Offer,
  OfferListFilters,
  OfferProduct,
  OfferStats,
} from "@/features/cms/types/offer.types";

/** In-memory mock store — frontend only. Replace with real API later. */
let offersStore: Offer[] = structuredClone(INITIAL_OFFERS);
let nextId = INITIAL_OFFERS.length + 1;

function delay(ms = 120): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function resolveProducts(productIds: string[]): OfferProduct[] {
  return productIds
    .map((id) => OFFER_PRODUCT_CATALOG.find((product) => product.id === id))
    .filter((product): product is OfferProduct => Boolean(product));
}

function formToOffer(
  data: OfferFormSchema,
  id: string,
  existing?: Offer,
): Offer {
  return {
    id,
    name: data.name,
    slug: data.slug,
    description: data.description,
    desktopBanner:
      data.desktopBanner ||
      existing?.desktopBanner ||
      `https://picsum.photos/seed/${data.slug}-desk/1200/400`,
    mobileBanner:
      data.mobileBanner ||
      existing?.mobileBanner ||
      `https://picsum.photos/seed/${data.slug}-mob/800/600`,
    offerType: data.offerType,
    products: resolveProducts(data.productIds),
    priority: data.priority,
    visibility: data.visibility,
    status: data.status,
    startDate: data.startDate,
    endDate: data.endDate,
    ctaLabel: data.ctaLabel,
  };
}

export async function getOffers(): Promise<Offer[]> {
  await delay();
  return structuredClone(offersStore);
}

export async function getOfferById(id: string): Promise<Offer | null> {
  await delay();
  const offer = offersStore.find((item) => item.id === id);
  return offer ? structuredClone(offer) : null;
}

export async function getOfferStats(): Promise<OfferStats> {
  await delay();
  return computeOfferStats(offersStore);
}

export async function getPublishedCarouselOffers(): Promise<Offer[]> {
  await delay();
  return structuredClone(
    offersStore
      .filter(
        (offer) =>
          offer.status === "ACTIVE" &&
          (offer.visibility === "home-carousel" || offer.visibility === "both"),
      )
      .sort((a, b) => b.priority - a.priority),
  );
}

export function queryOffers(
  offers: Offer[],
  filters: OfferListFilters,
): { rows: Offer[]; total: number } {
  let rows = [...offers];

  if (filters.search.trim()) {
    const query = filters.search.trim().toLowerCase();
    rows = rows.filter(
      (offer) =>
        offer.name.toLowerCase().includes(query) ||
        offer.slug.toLowerCase().includes(query) ||
        offer.description.toLowerCase().includes(query),
    );
  }

  if (filters.status !== "all") {
    rows = rows.filter((offer) => offer.status === filters.status);
  }

  if (filters.offerType !== "all") {
    rows = rows.filter((offer) => offer.offerType === filters.offerType);
  }

  if (filters.visibility !== "all") {
    rows = rows.filter((offer) => offer.visibility === filters.visibility);
  }

  rows.sort((a, b) =>
    filters.sortByPriority === "asc"
      ? a.priority - b.priority
      : b.priority - a.priority,
  );

  const total = rows.length;
  const start = (filters.page - 1) * filters.pageSize;
  const paged = rows.slice(start, start + filters.pageSize);

  return { rows: paged, total };
}

export async function createOffer(data: OfferFormSchema): Promise<Offer> {
  await delay();
  const id = `offer-${String(nextId).padStart(3, "0")}`;
  nextId += 1;
  const offer = formToOffer(data, id);
  offersStore = [offer, ...offersStore];
  return structuredClone(offer);
}

export async function updateOffer(
  id: string,
  data: OfferFormSchema,
): Promise<Offer | null> {
  await delay();
  const index = offersStore.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const updated = formToOffer(data, id, offersStore[index]);
  offersStore = [
    ...offersStore.slice(0, index),
    updated,
    ...offersStore.slice(index + 1),
  ];
  return structuredClone(updated);
}

export async function deleteOffer(id: string): Promise<boolean> {
  await delay();
  const before = offersStore.length;
  offersStore = offersStore.filter((item) => item.id !== id);
  return offersStore.length < before;
}

export async function duplicateOffer(id: string): Promise<Offer | null> {
  await delay();
  const source = offersStore.find((item) => item.id === id);
  if (!source) return null;

  const newId = `offer-${String(nextId).padStart(3, "0")}`;
  nextId += 1;
  const duplicate: Offer = {
    ...structuredClone(source),
    id: newId,
    name: `${source.name} (Copy)`,
    slug: `${source.slug}-copy-${newId}`,
    status: "DRAFT",
  };
  offersStore = [duplicate, ...offersStore];
  return structuredClone(duplicate);
}

export async function publishOffer(id: string): Promise<Offer | null> {
  await delay();
  const index = offersStore.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const updated: Offer = { ...offersStore[index], status: "ACTIVE" };
  offersStore = [
    ...offersStore.slice(0, index),
    updated,
    ...offersStore.slice(index + 1),
  ];
  return structuredClone(updated);
}

export async function unpublishOffer(id: string): Promise<Offer | null> {
  await delay();
  const index = offersStore.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const updated: Offer = { ...offersStore[index], status: "DRAFT" };
  offersStore = [
    ...offersStore.slice(0, index),
    updated,
    ...offersStore.slice(index + 1),
  ];
  return structuredClone(updated);
}

export function getOfferProductCatalog(): OfferProduct[] {
  return structuredClone(OFFER_PRODUCT_CATALOG);
}

/** Reset store — useful for tests / hard refresh scenarios */
export function resetOffersStore(): void {
  offersStore = structuredClone(INITIAL_OFFERS);
  nextId = INITIAL_OFFERS.length + 1;
}
