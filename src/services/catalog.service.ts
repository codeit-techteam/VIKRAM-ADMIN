import { API_ENDPOINTS } from "@/constants/api-endpoints";
import api from "@/services/api";
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from "@/types/api";
import type { HubInventorySkuDraft } from "@/types/hub-onboarding.types";

export interface CatalogProductVariant {
  id: string;
  label: string;
  displayUnit?: string | null;
  size?: number | string | null;
  sizeUnit?: string | null;
  price?: number | string;
  inStock?: boolean;
}

export interface CatalogProduct {
  id: string;
  name: string;
  sku?: string | null;
  unit: string;
  brand?: string | null;
  category?: { id: string; name: string } | null;
  variants?: CatalogProductVariant[];
  stockLeft?: number;
}

export interface CatalogCategory {
  id: string;
  name: string;
  slug?: string;
}

function mapProductToSku(
  product: CatalogProduct,
  index: number,
): HubInventorySkuDraft {
  const variant = product.variants?.[0];
  const variantLabel =
    variant?.label ||
    (variant?.size != null
      ? `${variant.size}${variant.sizeUnit ? ` ${variant.sizeUnit}` : ""}`
      : product.unit || "Unit");

  const opening = Math.max(product.stockLeft ?? 50, 10);
  const reorder = Math.max(Math.round(opening * 0.2), 5);
  const safety = Math.max(Math.round(opening * 0.1), 2);

  return {
    id: `catalog-${product.id}${variant ? `-${variant.id}` : ""}`,
    materialId: product.id,
    productId: product.id,
    variantId: variant?.id,
    sku: product.sku || product.id.slice(0, 8).toUpperCase(),
    category: product.category?.name || "Uncategorized",
    productName: product.name,
    variant: variantLabel,
    unit: variant?.displayUnit || product.unit || "Bag",
    openingStock: opening,
    reorderLevel: reorder,
    safetyStock: safety,
    maxStock: Math.max(opening * 3, 100),
    selected: index < 5,
  };
}

export const catalogService = {
  listProducts: async (
    params?: PaginationParams & { search?: string; categoryId?: string },
  ): Promise<PaginatedResponse<CatalogProduct>> => {
    const { data } = await api.get<
      ApiResponse<{
        data: CatalogProduct[];
        meta: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>
    >(API_ENDPOINTS.PRODUCTS.BASE, {
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 100,
        search: params?.search,
        categoryId: params?.categoryId,
      },
    });

    const payload = data.data;
    return {
      data: payload.data,
      meta: {
        page: payload.meta.page,
        limit: payload.meta.limit,
        total: payload.meta.total,
        totalPages: payload.meta.totalPages,
        hasNextPage: payload.meta.page < payload.meta.totalPages,
        hasPreviousPage: payload.meta.page > 1,
      },
    };
  },

  listCategories: async (): Promise<CatalogCategory[]> => {
    const { data } = await api.get<ApiResponse<CatalogCategory[]>>(
      API_ENDPOINTS.CATEGORIES.BASE,
    );
    return data.data;
  },

  fetchInventorySkus: async (): Promise<HubInventorySkuDraft[]> => {
    const result = await catalogService.listProducts({ page: 1, limit: 100 });
    return result.data.map((product, index) => mapProductToSku(product, index));
  },
};
