"use client";

import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/shared/EmptyState";
import { DataTableSkeleton } from "@/components/tables/data-table-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateProductDialog } from "@/components/warehouse/products/CreateProductDialog";
import {
  WAREHOUSE_PRODUCTS,
  WAREHOUSE_PRODUCT_CATEGORIES,
  type WarehouseProduct,
} from "@/mock/warehouse-products";
import { cn } from "@/lib/utils";

const statusStyles: Record<WarehouseProduct["status"], string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  LOW_STOCK: "bg-amber-100 text-amber-700",
  INACTIVE: "bg-gray-100 text-gray-600",
};

export function ProductsPage() {
  const [isLoading] = useState(false);
  const [products, setProducts] =
    useState<WarehouseProduct[]>(WAREHOUSE_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        query.length === 0 ||
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query);

      const categorySlug = product.category
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const matchesCategory = category === "all" || categorySlug === category;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, category]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#94A3B8]" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search products, SKU, brand..."
              className="h-10 pl-9"
            />
          </div>

          <Select
            value={category}
            onValueChange={(value) => setCategory(value ?? "all")}
          >
            <SelectTrigger className="h-10 w-full sm:w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {WAREHOUSE_PRODUCT_CATEGORIES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="button"
          className="h-10 gap-2 px-4"
          onClick={() => setCreateDialogOpen(true)}
        >
          <Plus className="size-4" />
          Create Product
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-semibold text-[#1A1A1A]">
            Product List
          </h2>
          <p className="mt-0.5 text-sm text-[#64748B]">
            Central warehouse product catalog and stock overview
          </p>
        </div>

        {isLoading ? (
          <div className="p-4">
            <DataTableSkeleton columns={7} rows={6} />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No products found"
              description="Adjust your search or category filter to find products."
            />
          </div>
        ) : (
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs font-semibold tracking-wide text-[#64748B] uppercase">
                    Product
                  </TableHead>
                  <TableHead className="text-xs font-semibold tracking-wide text-[#64748B] uppercase">
                    SKU
                  </TableHead>
                  <TableHead className="text-xs font-semibold tracking-wide text-[#64748B] uppercase">
                    Category
                  </TableHead>
                  <TableHead className="text-xs font-semibold tracking-wide text-[#64748B] uppercase">
                    Brand
                  </TableHead>
                  <TableHead className="text-xs font-semibold tracking-wide text-[#64748B] uppercase">
                    Stock
                  </TableHead>
                  <TableHead className="text-xs font-semibold tracking-wide text-[#64748B] uppercase">
                    Unit
                  </TableHead>
                  <TableHead className="text-xs font-semibold tracking-wide text-[#64748B] uppercase">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow
                    key={product.id}
                    className="transition-colors hover:bg-orange-50/40"
                  >
                    <TableCell className="font-medium text-[#1A1A1A]">
                      {product.name}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-[#64748B]">
                      {product.sku}
                    </TableCell>
                    <TableCell className="text-[#475569]">
                      {product.category}
                    </TableCell>
                    <TableCell className="text-[#475569]">
                      {product.brand}
                    </TableCell>
                    <TableCell className="font-medium text-[#1A1A1A]">
                      {product.stockUnits.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-[#64748B]">
                      {product.unit}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide uppercase",
                          statusStyles[product.status],
                        )}
                      >
                        {product.status.replace("_", " ")}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <CreateProductDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreated={(product) => {
          setProducts((current) => [product, ...current]);
        }}
      />
    </div>
  );
}
