"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  CATALOG_UNITS,
  calculateVariantDiscount,
  createEmptyVariant,
  isUnitRequiredForAttribute,
  resolveFormAttributeName,
  type ProductVariantFormValue,
  type VariantAttribute,
} from "@/features/catalog/schema/product-form.schema";

const fieldLabelClassName =
  "text-[11px] font-semibold tracking-wider text-gray-400 uppercase";

interface VariantFormDialogProps {
  open: boolean;
  attribute: VariantAttribute;
  customAttributeName?: string;
  defaultUnit?: string;
  defaultMrp?: number;
  defaultPrice?: number;
  initial?: ProductVariantFormValue | null;
  existing: ProductVariantFormValue[];
  onOpenChange: (open: boolean) => void;
  onSave: (variant: ProductVariantFormValue) => void;
}

const VALUE_PLACEHOLDERS: Partial<Record<VariantAttribute, string>> = {
  Size: "e.g. 250",
  Weight: "e.g. 50",
  Volume: "e.g. 1",
  Pack: "e.g. 100",
  Dimensions: "e.g. 2x2",
  Length: "e.g. 3",
  Color: "e.g. White",
  Grade: "e.g. M20",
  Model: "e.g. XL",
  Capacity: "e.g. 20",
  Material: "e.g. PVC",
  Finish: "e.g. Matte",
  Custom: "e.g. value",
};

const UNIT_PLACEHOLDERS: Partial<Record<VariantAttribute, string>> = {
  Size: "e.g. ml",
  Weight: "e.g. kg",
  Volume: "e.g. L",
  Pack: "e.g. Pack",
  Dimensions: "e.g. ft",
  Length: "e.g. m",
  Capacity: "e.g. L",
};

function numberFieldText(value: number) {
  return value === 0 ? "" : String(value);
}

function parseNumberField(raw: string) {
  if (raw.trim() === "") return 0;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function sanitizeNumberFieldText(raw: string) {
  if (raw.trim() === "") return "";
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) return raw;
  if (parsed === 0 && !raw.includes(".")) return "";
  return raw;
}

export function VariantFormDialog({
  open,
  attribute,
  customAttributeName,
  defaultUnit,
  defaultMrp,
  defaultPrice,
  initial,
  existing,
  onOpenChange,
  onSave,
}: VariantFormDialogProps) {
  const [draft, setDraft] = useState<ProductVariantFormValue>(
    initial ??
      createEmptyVariant(0, {
        unit: defaultUnit,
        mrp: defaultMrp,
        price: defaultPrice,
      }),
  );
  const [mrpText, setMrpText] = useState(() => numberFieldText(draft.mrp));
  const [priceText, setPriceText] = useState(() => numberFieldText(draft.price));
  const [stockText, setStockText] = useState(() => numberFieldText(draft.stock));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const next =
      initial ??
      createEmptyVariant(0, {
        unit: defaultUnit,
        mrp: defaultMrp,
        price: defaultPrice,
      });
    setDraft(next);
    setMrpText(numberFieldText(next.mrp));
    setPriceText(numberFieldText(next.price));
    setStockText(numberFieldText(next.stock));
    setError(null);
  }, [open, initial, defaultUnit, defaultMrp, defaultPrice]);

  const discount = useMemo(
    () => calculateVariantDiscount(draft.mrp, draft.price),
    [draft.mrp, draft.price],
  );
  const unitRequired = isUnitRequiredForAttribute(attribute, customAttributeName);
  const resolvedAttribute =
    resolveFormAttributeName(attribute, customAttributeName) || attribute;

  const setField = <K extends keyof ProductVariantFormValue>(
    key: K,
    value: ProductVariantFormValue[K],
  ) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const handleSave = () => {
    const value = draft.value.trim();
    const unit = draft.unit.trim();
    const sku = draft.sku.trim();

    if (!value) {
      setError("Variant value is required");
      return;
    }
    if (unitRequired && !unit) {
      setError("Unit is required");
      return;
    }
    if (draft.price <= 0 || draft.mrp <= 0) {
      setError("MRP and selling price must be greater than 0");
      return;
    }
    if (draft.mrp < draft.price) {
      setError("MRP must be greater than or equal to selling price");
      return;
    }
    if (draft.stock < 0) {
      setError("Stock cannot be negative");
      return;
    }
    if (sku && !/^[A-Za-z0-9][A-Za-z0-9._-]{1,79}$/.test(sku)) {
      setError("SKU must be 2–80 characters: letters, numbers, . _ -");
      return;
    }

    const identity = `${value.toLowerCase()}|${unit.toLowerCase()}`;
    const duplicate = existing.some((item) => {
      if (item.clientKey === draft.clientKey) return false;
      return (
        `${item.value.trim().toLowerCase()}|${item.unit.trim().toLowerCase()}` ===
        identity
      );
    });
    if (duplicate) {
      setError(`A variant with ${value}${unit ? ` ${unit}` : ""} already exists`);
      return;
    }

    onSave({
      ...draft,
      value,
      unit,
      sku,
      imageUrl: draft.imageUrl?.trim() ?? "",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" showCloseButton>
        <DialogHeader>
          <DialogTitle>
            {initial?.id || initial?.value ? "Edit Variant" : "Add Variant"}
          </DialogTitle>
          <DialogDescription>
            {resolvedAttribute} option for this product. Value + Unit appear as
            the pack choice in the Customer App (for example 100 Pack). Price
            updates when the customer selects that pack.
          </DialogDescription>
        </DialogHeader>

        <div className="grid max-h-[70vh] gap-4 overflow-y-auto py-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className={fieldLabelClassName}>Value</Label>
              <Input
                value={draft.value}
                onChange={(event) => setField("value", event.target.value)}
                placeholder={VALUE_PLACEHOLDERS[attribute] ?? "e.g. value"}
              />
            </div>
            <div className="space-y-2">
              <Label className={fieldLabelClassName}>
                Unit{unitRequired ? "" : " (optional)"}
              </Label>
              <Input
                value={draft.unit}
                onChange={(event) => setField("unit", event.target.value)}
                list="variant-unit-options"
                placeholder={UNIT_PLACEHOLDERS[attribute] ?? "e.g. kg"}
              />
              <datalist id="variant-unit-options">
                {CATALOG_UNITS.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="space-y-2">
            <Label className={fieldLabelClassName}>SKU</Label>
            <Input
              value={draft.sku}
              onChange={(event) => setField("sku", event.target.value)}
              placeholder="e.g. VAR-250"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className={fieldLabelClassName}>MRP (₹)</Label>
              <Input
                type="number"
                min={0}
                inputMode="decimal"
                placeholder="e.g. 99"
                value={mrpText}
                onFocus={(event) => event.target.select()}
                onChange={(event) => {
                  const raw = event.target.value;
                  setMrpText(sanitizeNumberFieldText(raw));
                  setField("mrp", parseNumberField(raw));
                }}
                onBlur={(event) =>
                  setMrpText(numberFieldText(parseNumberField(event.target.value)))
                }
              />
            </div>
            <div className="space-y-2">
              <Label className={fieldLabelClassName}>Selling Price (₹)</Label>
              <Input
                type="number"
                min={0}
                inputMode="decimal"
                placeholder="e.g. 89"
                value={priceText}
                onFocus={(event) => event.target.select()}
                onChange={(event) => {
                  const raw = event.target.value;
                  setPriceText(sanitizeNumberFieldText(raw));
                  setField("price", parseNumberField(raw));
                }}
                onBlur={(event) =>
                  setPriceText(
                    numberFieldText(parseNumberField(event.target.value)),
                  )
                }
              />
            </div>
          </div>

          <p className="text-sm text-gray-500">
            Customer App:{" "}
            {draft.price > 0
              ? `${new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                }).format(draft.price)}/${draft.unit.trim() || "unit"}`
              : "—"}
            {discount.percent > 0
              ? ` · ${discount.percent}% OFF (₹${discount.amount})`
              : ""}
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className={fieldLabelClassName}>Stock</Label>
              <Input
                type="number"
                min={0}
                inputMode="numeric"
                placeholder="e.g. 10"
                value={stockText}
                onFocus={(event) => event.target.select()}
                onChange={(event) => {
                  const raw = event.target.value;
                  setStockText(sanitizeNumberFieldText(raw));
                  setField("stock", parseNumberField(raw));
                }}
                onBlur={(event) =>
                  setStockText(
                    numberFieldText(parseNumberField(event.target.value)),
                  )
                }
              />
            </div>
            <div className="flex items-end justify-between rounded-lg border border-gray-100 px-3 py-2">
              <Label className={fieldLabelClassName}>Active</Label>
              <Switch
                checked={draft.isActive}
                onCheckedChange={(checked) => setField("isActive", checked)}
              />
            </div>
          </div>

          {error ? <p className="text-destructive text-sm">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save Variant
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
