"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import {
  FileDropzone,
  type MockUploadFile,
} from "@/components/shared/FileDropzone";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { getNavBreadcrumbsFromPath } from "@/constants/navigation.constants";
import {
  cmsAdminService,
  type AdminAdvertisement,
} from "@/services/cms-admin.service";
import {
  assertRemoteMediaUrl,
  uploadMediaFile,
} from "@/services/media.service";
import { notify } from "@/utils/notify";

const EMPTY = {
  title: "",
  brandName: "",
  imageUrl: "",
  logoUrl: "",
  buttonText: "Shop Now",
  redirectType: "ROUTE",
  redirectId: "/(tabs)/catalog",
  priority: 0,
  startsAt: "",
  endsAt: "",
};

export function BrandAdsPageContent() {
  const [ads, setAds] = useState<AdminAdvertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerUpload, setBannerUpload] = useState<MockUploadFile | null>(null);
  const [logoUpload, setLogoUpload] = useState<MockUploadFile | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setAds(await cmsAdminService.listAds());
    } catch (error) {
      notify.error(
        error instanceof Error ? error.message : "Failed to load brand ads",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const resetDialog = () => {
    if (bannerPreview?.startsWith("blob:")) URL.revokeObjectURL(bannerPreview);
    if (logoPreview?.startsWith("blob:")) URL.revokeObjectURL(logoPreview);
    setForm(EMPTY);
    setBannerFile(null);
    setLogoFile(null);
    setBannerUpload(null);
    setLogoUpload(null);
    setBannerPreview(null);
    setLogoPreview(null);
  };

  const onCreate = async () => {
    if (!form.title || !form.brandName) {
      notify.error("Title and brand name are required");
      return;
    }
    if (!bannerFile && !form.imageUrl) {
      notify.error("Upload a banner image to Cloudflare R2");
      return;
    }

    setSaving(true);
    try {
      let imageUrl = form.imageUrl;
      let logoUrl = form.logoUrl;

      if (bannerFile) {
        const uploaded = await uploadMediaFile(bannerFile, "brands", {
          onProgress: (percent) => {
            setBannerUpload({ name: bannerFile.name, progress: percent });
          },
        });
        imageUrl = uploaded.publicUrl;
      }

      if (logoFile) {
        const uploaded = await uploadMediaFile(logoFile, "brands", {
          onProgress: (percent) => {
            setLogoUpload({ name: logoFile.name, progress: percent });
          },
        });
        logoUrl = uploaded.publicUrl;
      }

      assertRemoteMediaUrl(imageUrl);

      const created = await cmsAdminService.createAd({
        ...form,
        imageUrl,
        logoUrl: logoUrl || undefined,
        startsAt: form.startsAt || undefined,
        endsAt: form.endsAt || undefined,
        isActive: true,
      });
      await cmsAdminService.activateAd(created.id);
      setOpen(false);
      resetDialog();
      await refresh();
      notify.success("Brand advertisement published");
    } catch (error) {
      notify.error(
        error instanceof Error ? error.message : "Failed to create ad",
      );
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (ad: AdminAdvertisement) => {
    try {
      if (ad.isActive) await cmsAdminService.deactivateAd(ad.id);
      else await cmsAdminService.activateAd(ad.id);
      await refresh();
    } catch (error) {
      notify.error(
        error instanceof Error ? error.message : "Failed to update ad",
      );
    }
  };

  const remove = async (id: string) => {
    try {
      await cmsAdminService.removeAd(id);
      await refresh();
      notify.success("Advertisement deleted");
    } catch (error) {
      notify.error(
        error instanceof Error ? error.message : "Failed to delete ad",
      );
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Brand Advertisement Management"
        description="Large horizontal brand cards for the Customer App home screen."
        breadcrumbs={getNavBreadcrumbsFromPath("/customer-app-cms/brand-ads")}
        actions={
          <Button
            onClick={() => {
              resetDialog();
              setOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Brand Ad
          </Button>
        }
      />

      <div className="overflow-hidden rounded-xl border bg-white">
        {loading ? (
          <p className="text-muted-foreground p-6 text-sm">Loading…</p>
        ) : ads.length === 0 ? (
          <p className="text-muted-foreground p-6 text-sm">
            No brand ads yet. Add one to show on Customer App home.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Brand</th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Deep Link</th>
                <th className="px-4 py-3 font-medium">Schedule</th>
                <th className="px-4 py-3 font-medium">Active</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {ads.map((ad) => (
                <tr key={ad.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={ad.logoUrl || ad.imageUrl}
                        alt=""
                        className="h-10 w-10 rounded-md object-cover"
                      />
                      <span className="font-medium">{ad.brandName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{ad.title}</td>
                  <td className="text-muted-foreground px-4 py-3">
                    {ad.redirectId || "—"}
                  </td>
                  <td className="text-muted-foreground px-4 py-3 text-xs">
                    {ad.startsAt
                      ? new Date(ad.startsAt).toLocaleDateString()
                      : "Always"}
                    {" → "}
                    {ad.endsAt ? new Date(ad.endsAt).toLocaleDateString() : "∞"}
                  </td>
                  <td className="px-4 py-3">
                    <Switch
                      checked={ad.isActive}
                      onCheckedChange={() => void toggle(ad)}
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => void remove(ad.id)}
                    >
                      <Trash2 className="text-destructive h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) resetDialog();
          setOpen(next);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Brand Advertisement</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            {(
              [
                ["title", "Title"],
                ["brandName", "Brand Name"],
                ["buttonText", "CTA Text"],
                ["redirectId", "Deep Link"],
                ["startsAt", "Start (ISO date)"],
                ["endsAt", "End (ISO date)"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="grid gap-1.5">
                <Label>{label}</Label>
                <Input
                  value={form[key]}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                />
              </div>
            ))}

            <div className="grid gap-1.5">
              <Label>Banner Image (R2)</Label>
              <FileDropzone
                variant="compact"
                label="Upload brand banner"
                helperText="JPG/PNG/WEBP → Cloudflare R2 brands/"
                accept={{
                  "image/jpeg": [".jpg", ".jpeg"],
                  "image/png": [".png"],
                  "image/webp": [".webp"],
                }}
                maxSize={5 * 1024 * 1024}
                selectedFile={bannerUpload}
                previewUrl={bannerPreview}
                onFileSelect={setBannerUpload}
                onFileChange={(file) => {
                  if (bannerPreview?.startsWith("blob:")) {
                    URL.revokeObjectURL(bannerPreview);
                  }
                  setBannerFile(file);
                  setBannerPreview(file ? URL.createObjectURL(file) : null);
                }}
              />
            </div>

            <div className="grid gap-1.5">
              <Label>Logo (optional)</Label>
              <FileDropzone
                variant="compact"
                label="Upload brand logo"
                helperText="Stored under brands/ on R2"
                accept={{
                  "image/jpeg": [".jpg", ".jpeg"],
                  "image/png": [".png"],
                  "image/webp": [".webp"],
                  "image/svg+xml": [".svg"],
                }}
                maxSize={1 * 1024 * 1024}
                selectedFile={logoUpload}
                previewUrl={logoPreview}
                onFileSelect={setLogoUpload}
                onFileChange={(file) => {
                  if (logoPreview?.startsWith("blob:")) {
                    URL.revokeObjectURL(logoPreview);
                  }
                  setLogoFile(file);
                  setLogoPreview(file ? URL.createObjectURL(file) : null);
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                resetDialog();
                setOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button disabled={saving} onClick={() => void onCreate()}>
              {saving ? "Uploading…" : "Publish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
