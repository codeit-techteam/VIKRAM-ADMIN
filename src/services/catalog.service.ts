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

export interface CatalogProductImage {
  id: string;
  url: string;
  isPrimary?: boolean;
  displayOrder?: number;
}

export interface CatalogProduct {
  id: string;
  name: string;
  slug?: string;
  sku?: string | null;
  unit: string;
  brand?: string | null;
  description?: string | null;
  retailPrice?: number | string;
  mrp?: number | string | null;
  bulkPrice?: number | string | null;
  bulkThreshold?: number | null;
  status?: string;
  stockLeft?: number;
  entityStatus?: string;
  isVisible?: boolean;
  categoryId?: string;
  category?: { id: string; name: string } | null;
  images?: CatalogProductImage[];
  variants?: CatalogProductVariant[];
}

export interface CatalogCategory {
  id: string;
  name: string;
  slug?: string;
  imageUrl?: string | null;
  iconUrl?: string | null;
  displayOrder?: number;
  isVisible?: boolean;
  status?: string;
  updatedAt?: string;
  _count?: { products?: number; children?: number };
}

export interface CreateCatalogProductInput {
  name: string;
  slug: string;
  sku?: string;
  categoryId: string;
  brand?: string;
  description?: string;
  retailPrice: number;
  mrp?: number;
  bulkPrice?: number | null;
  bulkThreshold?: number | null;
  membershipPrice?: number;
  unit?: string;
  isFeatured?: boolean;
  imageUrls?: string[];
  isVisible?: boolean;
  displayOrder?: number;
  gst?: number;
  initialStock?: number;
  lowStockThreshold?: number;
  minimumStock?: number;
  maximumStock?: number;
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
    params?: PaginationParams & {
      search?: string;
      categoryId?: string;
      status?: string;
    },
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
        limit: params?.limit ?? 20,
        search: params?.search,
        categoryId: params?.categoryId,
        status: params?.status,
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

  getProduct: async (id: string): Promise<CatalogProduct> => {
    const { data } = await api.get<ApiResponse<CatalogProduct>>(
      API_ENDPOINTS.PRODUCTS.BY_ID(id),
    );
    return data.data;
  },

  createProduct: async (
    payload: CreateCatalogProductInput,
  ): Promise<CatalogProduct> => {
    const { data } = await api.post<ApiResponse<CatalogProduct>>(
      API_ENDPOINTS.PRODUCTS.BASE,
      payload,
    );
    return data.data;
  },

  updateProduct: async (
    id: string,
    payload: Partial<CreateCatalogProductInput> & {
      entityStatus?: string;
      isVisible?: boolean;
      bulkThreshold?: number;
    },
  ): Promise<CatalogProduct> => {
    const { data } = await api.patch<ApiResponse<CatalogProduct>>(
      API_ENDPOINTS.PRODUCTS.BY_ID(id),
      payload,
    );
    return data.data;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.PRODUCTS.BY_ID(id));
  },

  setImages: async (
    id: string,
    images: Array<{ url: string; isPrimary?: boolean }>,
  ) => {
    const { data } = await api.patch<ApiResponse<CatalogProduct>>(
      `${API_ENDPOINTS.PRODUCTS.BY_ID(id)}/images`,
      { images },
    );
    return data.data;
  },

  listCategories: async (): Promise<CatalogCategory[]> => {
    const { data } = await api.get<ApiResponse<CatalogCategory[]>>(
      API_ENDPOINTS.CATEGORIES.BASE,
    );
    return data.data;
  },

  getCategory: async (id: string): Promise<CatalogCategory> => {
    const { data } = await api.get<ApiResponse<CatalogCategory>>(
      API_ENDPOINTS.CATEGORIES.BY_ID(id),
    );
    return data.data;
  },

  createCategory: async (payload: {
    name: string;
    slug: string;
    displayOrder?: number;
    imageUrl?: string;
    iconUrl?: string;
    isVisible?: boolean;
    status?: string;
  }) => {
    const { data } = await api.post<ApiResponse<CatalogCategory>>(
      API_ENDPOINTS.CATEGORIES.BASE,
      payload,
    );
    return data.data;
  },

  updateCategory: async (
    id: string,
    payload: Partial<{
      name: string;
      displayOrder: number;
      imageUrl: string;
      iconUrl: string;
      isVisible: boolean;
      status: string;
    }>,
  ) => {
    const { data } = await api.patch<ApiResponse<CatalogCategory>>(
      API_ENDPOINTS.CATEGORIES.BY_ID(id),
      payload,
    );
    return data.data;
  },

  deleteCategory: async (id: string) => {
    await api.delete(API_ENDPOINTS.CATEGORIES.BY_ID(id));
  },

  toggleCategory: async (id: string) => {
    const { data } = await api.patch<ApiResponse<CatalogCategory>>(
      `${API_ENDPOINTS.CATEGORIES.BY_ID(id)}/toggle`,
    );
    return data.data;
  },

  fetchInventorySkus: async (): Promise<HubInventorySkuDraft[]> => {
    const result = await catalogService.listProducts({ page: 1, limit: 100 });
    return result.data.map((product, index) => mapProductToSku(product, index));
  },
};
