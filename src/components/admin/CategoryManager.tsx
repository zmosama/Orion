"use client";

import { useState } from "react";
import { FolderTree, Pencil, Plus, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

export interface AdminCategory {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  image: string | null;
  parentId: string | null;
  productCount: number;
}

const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orion-accent focus:ring-2 focus:ring-orion-accent/40";

const emptyForm = { id: "", slug: "", nameEn: "", nameAr: "", image: "", parentId: "" };

/** هل cat من أحفاد ancestorId؟ (لمنع اختيار أب يعمل دايرة) */
function isDescendant(cats: AdminCategory[], catId: string, ancestorId: string): boolean {
  let cursor = cats.find((c) => c.id === catId)?.parentId ?? null;
  while (cursor) {
    if (cursor === ancestorId) return true;
    cursor = cats.find((c) => c.id === cursor)?.parentId ?? null;
  }
  return false;
}

export default function CategoryManager({ categories }: { categories: AdminCategory[] }) {
  const t = useTranslations("admin.categories");
  const tc = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();

  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const name = (c: AdminCategory) => (locale === "ar" ? c.nameAr : c.nameEn);
  const isEdit = Boolean(form.id);

  function openAdd(parentId = "") {
    setForm({ ...emptyForm, parentId });
    setError(null);
    setShowForm(true);
  }

  function openEdit(c: AdminCategory) {
    setForm({
      id: c.id,
      slug: c.slug,
      nameEn: c.nameEn,
      nameAr: c.nameAr,
      image: c.image ?? "",
      parentId: c.parentId ?? "",
    });
    setError(null);
    setShowForm(true);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const payload = {
      slug: form.slug.trim(),
      nameEn: form.nameEn.trim(),
      nameAr: form.nameAr.trim(),
      image: form.image.trim(),
      parentId: form.parentId || null,
    };
    const res = await fetch(isEdit ? `/api/admin/categories/${form.id}` : "/api/admin/categories", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setBusy(false);
    if (res.ok) {
      setShowForm(false);
      setForm(emptyForm);
      router.refresh();
      return;
    }
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    setError(
      data?.error === "SLUG_EXISTS"
        ? t("slugExists")
        : data?.error === "CYCLE"
          ? t("cycleError")
          : tc("error"),
    );
  }

  async function onDelete(c: AdminCategory) {
    if (!confirm(t("deleteConfirm", { name: name(c) }))) return;
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/admin/categories/${c.id}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) {
      router.refresh();
      return;
    }
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    setError(
      data?.error === "HAS_CHILDREN"
        ? t("deleteBlockedChildren")
        : data?.error === "HAS_PRODUCTS"
          ? t("deleteBlockedProducts")
          : tc("error"),
    );
  }

  // اختيارات الأب المسموحة (من غير الفئة نفسها ولا أحفادها وقت التعديل)
  const parentOptions = categories.filter(
    (c) => !isEdit || (c.id !== form.id && !isDescendant(categories, c.id, form.id)),
  );

  function renderBranch(parentId: string | null, depth: number): React.ReactNode {
    const branch = categories.filter((c) => c.parentId === parentId);
    if (branch.length === 0) return null;
    return branch.map((c) => (
      <div key={c.id}>
        <div
          className="flex items-center gap-2 border-b border-gray-100 py-2 text-sm"
          style={{ paddingInlineStart: `${depth * 24}px` }}
        >
          <FolderTree className="h-4 w-4 shrink-0 text-orion-link" />
          <span className="min-w-0 flex-1">
            <span className="font-medium text-gray-900">{name(c)}</span>
            <span className="ms-2 text-xs text-gray-500" dir="ltr">
              /{c.slug}
            </span>
            <span className="ms-2 text-xs text-gray-400">
              {t("productsCount", { count: c.productCount })}
            </span>
          </span>
          <button
            type="button"
            onClick={() => openAdd(c.id)}
            className="flex items-center gap-1 text-xs text-orion-link hover:underline"
          >
            <Plus className="h-3.5 w-3.5" />
            {t("addChild")}
          </button>
          <button
            type="button"
            onClick={() => openEdit(c)}
            className="flex items-center gap-1 text-xs text-gray-600 hover:underline"
          >
            <Pencil className="h-3.5 w-3.5" />
            {tc("edit")}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onDelete(c)}
            className="flex items-center gap-1 text-xs text-red-700 hover:underline disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {tc("delete")}
          </button>
        </div>
        {renderBranch(c.id, depth + 1)}
      </div>
    ));
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-gray-600">{t("hint")}</p>
        <button
          type="button"
          onClick={() => openAdd()}
          className="flex items-center gap-1 rounded-full bg-orion-accent px-4 py-1.5 text-sm font-bold text-orion-dark transition-colors hover:bg-orion-accent-dark"
        >
          <Plus className="h-4 w-4" />
          {t("addNew")}
        </button>
      </div>

      {error ? (
        <p role="alert" className="mb-3 rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {showForm ? (
        <form onSubmit={onSubmit} className="mb-4 space-y-3 rounded-md border border-gray-200 bg-gray-50 p-3">
          <p className="font-bold text-gray-900">{isEdit ? t("editTitle") : t("addNew")}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block font-semibold text-gray-700">{t("nameEn")}</span>
              <input required value={form.nameEn} onChange={(e) => setForm((f) => ({ ...f, nameEn: e.target.value }))} className={inputClass} dir="ltr" />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-semibold text-gray-700">{t("nameAr")}</span>
              <input required value={form.nameAr} onChange={(e) => setForm((f) => ({ ...f, nameAr: e.target.value }))} className={inputClass} dir="rtl" />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-semibold text-gray-700">{t("slug")}</span>
              <input required pattern="[a-z0-9-]+" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} className={inputClass} dir="ltr" />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-semibold text-gray-700">{t("parent")}</span>
              <select value={form.parentId} onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))} className={inputClass}>
                <option value="">{t("noParent")}</option>
                {parentOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {name(c)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="block text-sm">
            <span className="mb-1 block font-semibold text-gray-700">{t("image")}</span>
            <input value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} className={inputClass} dir="ltr" placeholder="https://..." />
          </label>
          <div className="flex gap-2">
            <button type="submit" disabled={busy} className="rounded-full bg-orion-accent px-5 py-1.5 text-sm font-bold text-orion-dark hover:bg-orion-accent-dark disabled:opacity-60">
              {tc("save")}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-full border border-gray-300 px-5 py-1.5 text-sm hover:bg-gray-100">
              {tc("cancel")}
            </button>
          </div>
        </form>
      ) : null}

      {categories.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-600">{t("empty")}</p>
      ) : (
        <div>{renderBranch(null, 0)}</div>
      )}
    </div>
  );
}
