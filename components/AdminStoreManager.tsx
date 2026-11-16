'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { StoreProductGroup } from '@/lib/itemsatis-store';

interface AdminStoreProduct {
  id: string;
  title: string;
  categoryName: string;
  typeName: string;
  group: StoreProductGroup;
  sourcePrice: number;
  price: number;
  customPrice: number | null;
  comparePrice: number | null;
  hidden: boolean;
  hasCustomPrice: boolean;
  imageUrl: string;
  itemsatisUrl: string;
}

interface StorageInfo {
  backend: 'supabase' | 'local-file' | 'memory-only';
  persistent: boolean;
  dbConfigured?: boolean;
  tableReady?: boolean;
}

interface SupplierInfo {
  configured: boolean;
  reachable: boolean;
  balance: number | null;
  categoryCount: number;
}

interface RowDraft {
  customPrice: string;
  comparePrice: string;
  hidden: boolean;
}

const GROUP_LABELS: Record<'all' | StoreProductGroup, string> = {
  all: 'Tüm Ürünler',
  ai: 'Yapay Zeka',
  design: 'Tasarım & Video',
  media: 'Üyelik & Medya',
  software: 'Lisans & Yazılım',
  fivem: 'FiveM & Sunucu',
};

export default function AdminStoreManager() {
  const [items, setItems] = useState<AdminStoreProduct[]>([]);
  const [drafts, setDrafts] = useState<Record<string, RowDraft>>({});
  const [storage, setStorage] = useState<StorageInfo | null>(null);
  const [supplier, setSupplier] = useState<SupplierInfo | null>(null);
  const [syncedAt, setSyncedAt] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState<'all' | StoreProductGroup>('all');
  const [onlyCustom, setOnlyCustom] = useState(false);

  const [bulkGroup, setBulkGroup] = useState<'all' | StoreProductGroup>('all');
  const [bulkMode, setBulkMode] = useState<'percent' | 'fixed_delta' | 'set_fixed' | 'reset'>('percent');
  const [bulkValue, setBulkValue] = useState('10');
  const [bulkBusy, setBulkBusy] = useState(false);

  const syncDraftsFromItems = useCallback((list: AdminStoreProduct[]) => {
    const map: Record<string, RowDraft> = {};
    for (const item of list) {
      map[item.id] = {
        customPrice: item.customPrice !== null ? String(item.customPrice) : '',
        comparePrice: item.comparePrice !== null ? String(item.comparePrice) : '',
        hidden: item.hidden,
      };
    }
    setDrafts(map);
  }, []);

  const fetchStoreAdmin = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/store-products', {
        credentials: 'same-origin',
        cache: 'no-store',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const list = (data.items || []) as AdminStoreProduct[];
        setItems(list);
        syncDraftsFromItems(list);
        setStorage(data.storage || null);
        setSupplier(data.supplier || null);
        setSyncedAt(data.syncedAt || '');
      }
    } catch {
      setStatusMsg('Mağaza ürünleri yüklenirken bağlantı hatası oluştu.');
    } finally {
      setLoading(false);
    }
  }, [syncDraftsFromItems]);

  useEffect(() => {
    void fetchStoreAdmin();
  }, [fetchStoreAdmin]);

  const handleRefreshFromItemsatis = async () => {
    setRefreshing(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/admin/store-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ action: 'refresh_itemsatis' }),
      });
      const data = await res.json();
      setStatusMsg(data.message || 'Güncelleme tamamlandı.');
      if (res.ok && Array.isArray(data.items)) {
        setItems(data.items);
        syncDraftsFromItems(data.items);
        if (data.syncedAt) setSyncedAt(data.syncedAt);
      }
    } catch {
      setStatusMsg('İtemsatış canlı senkronizasyonu başarısız oldu.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleSaveRow = async (item: AdminStoreProduct, overrideDraft?: RowDraft) => {
    const draft = overrideDraft || drafts[item.id];
    if (!draft) return;

    const parseOptionalNum = (raw: string): number | null => {
      const trimmed = raw.trim().replace(',', '.');
      if (!trimmed) return null;
      const n = Number(trimmed);
      return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null;
    };

    const customPrice = parseOptionalNum(draft.customPrice);
    const comparePrice = parseOptionalNum(draft.comparePrice);

    setSavingId(item.id);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/admin/store-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          action: 'upsert_price',
          productId: item.id,
          customPrice,
          comparePrice,
          hidden: draft.hidden,
        }),
      });
      const data = await res.json();
      setStatusMsg(data.message || (res.ok ? 'Fiyat kaydedildi.' : 'Hata oluştu.'));
      if (data.storage) setStorage(data.storage);
      if (res.ok && Array.isArray(data.items)) {
        setItems(data.items);
        syncDraftsFromItems(data.items);
      }
    } catch {
      setStatusMsg('Fiyat güncellenirken sunucu hatası oluştu.');
    } finally {
      setSavingId(null);
    }
  };

  const handleBulkApply = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericVal = Number(bulkValue.replace(',', '.'));
    if (bulkMode !== 'reset' && !Number.isFinite(numericVal)) {
      setStatusMsg('Geçerli bir sayısal değer giriniz.');
      return;
    }

    const confirmText =
      bulkMode === 'reset'
        ? `${GROUP_LABELS[bulkGroup]} grubundaki tüm özel fiyatlar sıfırlansın mı?`
        : `${GROUP_LABELS[bulkGroup]} grubu için toplu fiyat güncellemesi uygulansın mı?`;
    if (!confirm(confirmText)) return;

    setBulkBusy(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/admin/store-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          action: 'bulk_adjust',
          group: bulkGroup,
          mode: bulkMode,
          ...(bulkMode === 'reset' ? {} : { value: numericVal }),
        }),
      });
      const data = await res.json();
      setStatusMsg(data.message || 'Toplu fiyat işlemi tamamlandı.');
      if (data.storage) setStorage(data.storage);
      if (res.ok && Array.isArray(data.items)) {
        setItems(data.items);
        syncDraftsFromItems(data.items);
      }
    } catch {
      setStatusMsg('Toplu fiyat işlemi sırasında hata oluştu.');
    } finally {
      setBulkBusy(false);
    }
  };

  const visibleRows = useMemo(() => {
    const q = search.trim().toLocaleLowerCase('tr');
    return items.filter((item) => {
      if (groupFilter !== 'all' && item.group !== groupFilter) return false;
      if (onlyCustom && !item.hasCustomPrice && !item.hidden) return false;
      if (!q) return true;
      return (
        item.title.toLocaleLowerCase('tr').includes(q) ||
        item.categoryName.toLocaleLowerCase('tr').includes(q) ||
        item.id.includes(q)
      );
    });
  }, [items, groupFilter, onlyCustom, search]);

  return (
    <section className="rs-admin-store-card" aria-labelledby="admin-store-heading">
      <div className="rs-admin-store-head">
        <div>
          <div className="rs-admin-store-kicker">İTEMSATIŞ VİTRİN YÖNETİMİ (/lisanslar)</div>
          <h2 id="admin-store-heading" className="rs-admin-store-title">
            Mağaza Ürünleri &amp; Fiyat Yönetimi ({items.length})
          </h2>
          <p className="rs-admin-store-sub">
            İtemsatış profilinizden çekilen ürünlerin site satış fiyatlarını tek tek veya toplu olarak düzenleyin.
          </p>
        </div>

        <div className="rs-admin-store-head-actions">
          <Link href="/lisanslar" target="_blank" className="rs-admin-store-btn-ghost">
            Vitrini Gör ↗
          </Link>
          <button
            type="button"
            onClick={handleRefreshFromItemsatis}
            disabled={refreshing}
            className="rs-admin-store-btn-primary"
          >
            {refreshing ? 'Çekiliyor...' : "İtemsatış'tan Yenile"}
          </button>
        </div>
      </div>

      <div className="rs-admin-store-meta-row">
        <span className={`rs-admin-store-pill ${storage?.persistent ? 'is-ok' : 'is-warn'}`}>
          Depolama:{' '}
          {storage?.backend === 'supabase'
            ? 'Supabase (Kalıcı)'
            : storage?.backend === 'local-file'
            ? 'Yerel Dosya (.data)'
            : 'Geçici Bellek — Kalıcı kayıt için Supabase şemasını uygulayın'}
        </span>
        {syncedAt && (
          <span className="rs-admin-store-pill">
            Son Senkron: {new Date(syncedAt).toLocaleString('tr-TR')}
          </span>
        )}
        {supplier?.configured && (
          <span className="rs-admin-store-pill">
            Bayi API: {supplier.reachable ? `Aktif · ${supplier.balance ?? 0} TL Bakiye` : 'Ulaşılamadı'}
          </span>
        )}
      </div>

      {statusMsg && (
        <div className="rs-admin-store-status" role="status">
          {statusMsg}
        </div>
      )}

      <form onSubmit={handleBulkApply} className="rs-admin-store-bulk">
        <div className="rs-admin-store-bulk-title">Toplu Fiyat Aracı</div>
        <div className="rs-admin-store-bulk-grid">
          <select
            value={bulkGroup}
            onChange={(e) => setBulkGroup(e.target.value as 'all' | StoreProductGroup)}
            className="rs-admin-store-input"
            aria-label="Toplu grup seçimi"
          >
            {Object.entries(GROUP_LABELS).map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </select>

          <select
            value={bulkMode}
            onChange={(e) =>
              setBulkMode(e.target.value as 'percent' | 'fixed_delta' | 'set_fixed' | 'reset')
            }
            className="rs-admin-store-input"
            aria-label="Toplu işlem türü"
          >
            <option value="percent">Yüzde Ekle / Çıkar (%)</option>
            <option value="fixed_delta">Tutar Ekle / Çıkar (TL)</option>
            <option value="set_fixed">Sabit Fiyat Ata (TL)</option>
            <option value="reset">İtemsatış Fiyatına Sıfırla</option>
          </select>

          {bulkMode !== 'reset' && (
            <input
              type="number"
              step="0.01"
              value={bulkValue}
              onChange={(e) => setBulkValue(e.target.value)}
              placeholder={bulkMode === 'percent' ? 'Örn: 15 veya -10' : 'Örn: 120'}
              className="rs-admin-store-input"
              aria-label="Toplu fiyat değeri"
            />
          )}

          <button type="submit" disabled={bulkBusy} className="rs-admin-store-btn-primary">
            {bulkBusy ? 'Uygulanıyor...' : 'Toplu Uygula'}
          </button>
        </div>
      </form>

      <div className="rs-admin-store-filters">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ürün adı, kategori veya ilan ID ara..."
          className="rs-admin-store-input rs-admin-store-search"
        />

        <select
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value as 'all' | StoreProductGroup)}
          className="rs-admin-store-input"
        >
          {Object.entries(GROUP_LABELS).map(([k, label]) => (
            <option key={k} value={k}>
              {label}
            </option>
          ))}
        </select>

        <label className="rs-admin-store-check">
          <input
            type="checkbox"
            checked={onlyCustom}
            onChange={(e) => setOnlyCustom(e.target.checked)}
          />
          <span>Sadece özel fiyatlı / gizli</span>
        </label>
      </div>

      {loading ? (
        <div style={{ padding: '32px 0', textAlign: 'center', color: 'rgba(240,240,240,0.65)', fontSize: '13px' }}>
          Mağaza ürünleri yükleniyor...
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="rs-admin-store-table">
            <thead>
              <tr>
                <th>ÜRÜN</th>
                <th>İTEMSATIŞ</th>
                <th>SİTE FİYATI (TL)</th>
                <th>ÜSTÜ ÇİZİLİ (ESKİ)</th>
                <th>GİZLE</th>
                <th>İŞLEM</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'rgba(240,240,240,0.65)' }}>
                    Filtreye uygun ürün bulunamadı.
                  </td>
                </tr>
              ) : (
                visibleRows.map((item) => {
                  const draft = drafts[item.id] || {
                    customPrice: '',
                    comparePrice: '',
                    hidden: false,
                  };
                  const busy = savingId === item.id;

                  return (
                    <tr key={item.id} className={item.hidden ? 'is-hidden-row' : ''}>
                      <td>
                        <div className="rs-admin-store-prod-cell">
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt=""
                              width={44}
                              height={28}
                              className="rs-admin-store-thumb"
                            />
                          )}
                          <div style={{ minWidth: 0 }}>
                            <div className="rs-admin-store-prod-name">{item.title}</div>
                            <div className="rs-admin-store-prod-cat">
                              {item.categoryName} · #{item.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="rs-admin-store-base-price">{item.sourcePrice} TL</span>
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={draft.customPrice}
                          placeholder={String(item.sourcePrice)}
                          onChange={(e) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [item.id]: { ...draft, customPrice: e.target.value },
                            }))
                          }
                          className="rs-admin-store-price-input"
                          aria-label={`${item.title} site fiyatı`}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={draft.comparePrice}
                          placeholder="Opsiyonel"
                          onChange={(e) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [item.id]: { ...draft, comparePrice: e.target.value },
                            }))
                          }
                          className="rs-admin-store-price-input"
                          aria-label={`${item.title} eski fiyat`}
                        />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={draft.hidden}
                          onChange={(e) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [item.id]: { ...draft, hidden: e.target.checked },
                            }))
                          }
                          aria-label={`${item.title} gizle`}
                        />
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => handleSaveRow(item)}
                            className="rs-admin-store-row-save"
                          >
                            {busy ? '...' : 'Kaydet'}
                          </button>
                          {(item.hasCustomPrice || item.comparePrice !== null || item.hidden) && (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() =>
                                handleSaveRow(item, {
                                  customPrice: '',
                                  comparePrice: '',
                                  hidden: false,
                                })
                              }
                              className="rs-admin-store-row-reset"
                              title="İtemsatış fiyatına sıfırla"
                            >
                              ↺
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
