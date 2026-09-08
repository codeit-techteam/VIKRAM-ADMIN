import { API_ENDPOINTS } from "@/constants/api-endpoints";
import api, { getApiErrorMessage } from "@/services/api";
import axios from "axios";
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from "@/types/api";
import type { HubInventorySkuDraft } from "@/types/hub-onboarding.types";

export interface CatalogProductVariant {
  id: string;
  attributes?: Record<string, string>;
  attribute?: string | null;
  value?: string | null;
  label: string;
  unit?: string | null;
  displayUnit?: string | null;
  size?: number | string | null;
  sizeUnit?: string | null;
  sku?: string | null;
  price?: number | string;
  sellingPrice?: number | string;
  mrp?: number | string | null;
  discount?: number;
  discountAmount?: number;
  discountPercent?: number;
  stock?: number;
  inStock?: boolean;
  isActive?: boolean;
  imageUrl?: string | null;
  displayOrder?: number;
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
  category?: { id: string; name: string; slug?: string | null } | null;
  productType?: string | null;
  grade?: string | null;
  images?: CatalogProductImage[];
  variants?: CatalogProductVariant[];
  hasVariants?: boolean;
  defaultVariantId?: string | null;
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
  productType?: string | null;
  grade?: string | null;
  isFeatured?: boolean;
  imageUrls?: string[];
  isVisible?: boolean;
  displayOrder?: number;
  gst?: number;
  initialStock?: number;
  lowStockThreshold?: number;
  minimumStock?: number;
  maximumStock?: number;
  hasVariants?: boolean;
}

export interface CatalogVariantInput {
  attribute: string;
  customAttribute?: string;
  attributes?: Record<string, string>;
  value: string;
  unit?: string;
  sku?: string;
  price: number;
  mrp?: number;
  stock?: number;
  isActive?: boolean;
  imageUrl?: string;
  displayOrder?: number;
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

function compactPayload<T extends Record<string, unknown>>(input: T): Partial<T> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === null) continue;
    if (typeof value === "string" && value.trim() === "") continue;
    out[key] = value;
  }
  return out as Partial<T>;
}

function forbiddenPropertyNames(message: string): string[] {
  return [...message.matchAll(/property\s+(\w+)\s+should not exist/gi)].map(
    (match) => match[1],
  );
}

async function patchDroppingUnknownProperties<T>(
  request: (payload: Record<string, unknown>) => Promise<T>,
  payload: object,
): Promise<T> {
  let body = compactPayload({ ...payload } as Record<string, unknown>);
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      return await request(body);
    } catch (error) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      if (status !== 400) throw error;
      const forbidden = forbiddenPropertyNames(getApiErrorMessage(error));
      if (!forbidden.length) throw error;
      let dropped = false;
      const next = { ...body };
      for (const key of forbidden) {
        if (key in next) {
          delete next[key];
          dropped = true;
        }
      }
      if (!dropped) throw error;
      body = next;
    }
  }
  throw new Error("Request failed with status code 400");
}

export const catalogService = {
  listProducts: async (
    params?: PaginationParams & {
      search?: string;
      categoryId?: string;
      status?: string;
      productType?: string;
      grade?: string;
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
        productType: params?.productType,
        grade: params?.grade,
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
    return patchDroppingUnknownProperties(async (body) => {
      const { data } = await api.post<ApiResponse<CatalogProduct>>(
        API_ENDPOINTS.PRODUCTS.BASE,
        body,
      );
      return data.data;
    }, payload);
  },

  updateProduct: async (
    id: string,
    payload: Partial<CreateCatalogProductInput> & {
      entityStatus?: string;
      isVisible?: boolean;
      bulkThreshold?: number;
      hasVariants?: boolean;
      unit?: string;
    },
  ): Promise<CatalogProduct> => {
    return patchDroppingUnknownProperties(async (body) => {
      const { data } = await api.patch<ApiResponse<CatalogProduct>>(
        API_ENDPOINTS.PRODUCTS.BY_ID(id),
        body,
      );
      return data.data;
    }, payload);
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

  listVariants: async (productId: string): Promise<CatalogProductVariant[]> => {
    const { data } = await api.get<ApiResponse<CatalogProductVariant[]>>(
      API_ENDPOINTS.PRODUCTS.VARIANTS(productId),
    );
    return data.data;
  },

  createVariant: async (
    productId: string,
    payload: CatalogVariantInput,
  ): Promise<CatalogProductVariant> => {
    return patchDroppingUnknownProperties(async (body) => {
      const { data } = await api.post<ApiResponse<CatalogProductVariant>>(
        API_ENDPOINTS.PRODUCTS.VARIANTS(productId),
        body,
      );
      return data.data;
    }, payload);
  },

  updateVariant: async (
    productId: string,
    variantId: string,
    payload: Partial<CatalogVariantInput>,
  ): Promise<CatalogProductVariant> => {
    return patchDroppingUnknownProperties(async (body) => {
      const { data } = await api.patch<ApiResponse<CatalogProductVariant>>(
        API_ENDPOINTS.PRODUCTS.VARIANT(productId, variantId),
        body,
      );
      return data.data;
    }, payload);
  },

  deleteVariant: async (productId: string, variantId: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.PRODUCTS.VARIANT(productId, variantId));
  },

  setVariantStatus: async (
    productId: string,
    variantId: string,
    isActive: boolean,
  ): Promise<CatalogProductVariant> => {
    const { data } = await api.patch<ApiResponse<CatalogProductVariant>>(
      API_ENDPOINTS.PRODUCTS.VARIANT_STATUS(productId, variantId),
      { isActive },
    );
    return data.data;
  },

  duplicateVariant: async (
    productId: string,
    variantId: string,
  ): Promise<CatalogProductVariant> => {
    const { data } = await api.post<ApiResponse<CatalogProductVariant>>(
      API_ENDPOINTS.PRODUCTS.VARIANT_DUPLICATE(productId, variantId),
    );
    return data.data;
  },

  reorderVariants: async (
    productId: string,
    variantIds: string[],
  ): Promise<CatalogProductVariant[]> => {
    const { data } = await api.patch<ApiResponse<CatalogProductVariant[]>>(
      API_ENDPOINTS.PRODUCTS.VARIANTS_REORDER(productId),
      { variantIds },
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
