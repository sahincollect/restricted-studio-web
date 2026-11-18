'use client';

import React, { useCallback, useEffect, useState } from 'react';
import type { OrderMessageRecord, OrderRecord } from '@/lib/orders-store';

export default function AdminOrdersManager() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [shopierConfigured, setShopierConfigured] = useState<boolean>(false);
  const [tableReady, setTableReady] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [selectedRef, setSelectedRef] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [messages, setMessages] = useState<OrderMessageRecord[]>([]);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const [replyText, setReplyText] = useState('');
  const [licenseCode, setLicenseCode] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [instructions, setInstructions] = useState(
    'Kurulum dosyası / lisans aktivasyon adımları hazır. Sorunuz olursa bu oda üzerinden yanıt verebilirsiniz.'
  );
  const [busy, setBusy] = useState(false);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders', {
        credentials: 'same-origin',
        cache: 'no-store',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders(data.orders || []);
        setShopierConfigured(Boolean(data.shopierConfigured));
        setTableReady(Boolean(data.tableReady));
        if (!selectedRef && Array.isArray(data.orders) && data.orders.length > 0) {
          setSelectedRef(data.orders[0].referenceCode);
        }
      }
    } catch {
      setStatusMsg('Sipariş listesi yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, [selectedRef]);

  const loadOrderThread = useCallback(async (ref: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(ref)}`, {
        credentials: 'same-origin',
        cache: 'no-store',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSelectedOrder(data.order);
        setMessages(data.messages || []);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    if (selectedRef) void loadOrderThread(selectedRef);
  }, [selectedRef, loadOrderThread]);

  const handleSyncShopier = async () => {
    setSyncing(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ action: 'sync_shopier' }),
      });
      const data = await res.json();
      setStatusMsg(data.message || 'Shopier senkronizasyonu tamamlandı.');
      if (res.ok && Array.isArray(data.orders)) {
        setOrders(data.orders);
        if (selectedRef) await loadOrderThread(selectedRef);
      }
    } catch {
      setStatusMsg('Shopier senkronizasyonu sırasında hata oluştu.');
    } finally {
      setSyncing(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRef || !replyText.trim() || busy) return;
    setBusy(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(selectedRef)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ mode: 'reply', body: replyText.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Mesaj gönderilemedi.');
      setReplyText('');
      setSelectedOrder(data.order);
      setMessages(data.messages || []);
    } catch (err: unknown) {
      setStatusMsg(err instanceof Error ? err.message : 'Mesaj hatası.');
    } finally {
      setBusy(false);
    }
  };

  const handleDeliverBundle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRef || !instructions.trim() || busy) return;
    setBusy(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(selectedRef)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          mode: 'deliver',
          licenseCode: licenseCode.trim(),
          downloadUrl: downloadUrl.trim(),
          instructions: instructions.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Teslimat başarısız.');
      setLicenseCode('');
      setDownloadUrl('');
      setSelectedOrder(data.order);
      setMessages(data.messages || []);
      setOrders((prev) => prev.map((o) => (o.referenceCode === selectedRef ? data.order : o)));
      setStatusMsg(data.message);
    } catch (err: unknown) {
      setStatusMsg(err instanceof Error ? err.message : 'Teslimat hatası.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rs-admin-store-card" aria-labelledby="admin-orders-heading">
      <div className="rs-admin-store-head">
        <div>
          <div className="rs-admin-store-kicker">SHOPİER ÖDEME &amp; KİŞİYE ÖZEL TESLİMAT</div>
          <h2 id="admin-orders-heading" className="rs-admin-store-title">
            Siparişler ve Müşteri Teslimat Sohbeti ({orders.length})
          </h2>
          <p className="rs-admin-store-sub">
            Shopier ödemelerini doğrulayın, müşteri teslimat odasından mesajlaşın ve lisans/dosya paketi teslim edin.
          </p>
        </div>

        <div className="rs-admin-store-head-actions">
          <span
            style={{
              fontSize: '11.5px',
              padding: '6px 12px',
              borderRadius: '999px',
              border: '1px solid rgba(255,255,255,0.16)',
              color: shopierConfigured ? '#4ade80' : '#fca5a5',
            }}
          >
            Shopier API: {shopierConfigured ? 'Etkin' : 'SHOPIER_API_TOKEN Eksik'}
          </span>
          <button
            type="button"
            onClick={() => void handleSyncShopier()}
            disabled={syncing}
            className="rs-admin-store-btn-primary"
          >
            {syncing ? 'Kontrol Ediliyor...' : 'Shopier Siparişlerini Senkronize Et'}
          </button>
        </div>
      </div>

      {!tableReady && (
        <div
          style={{
            marginBottom: '12px',
            padding: '10px 14px',
            borderRadius: '12px',
            backgroundColor: 'rgba(239, 91, 56, 0.14)',
            border: '1px solid rgba(239, 91, 56, 0.4)',
            fontSize: '12.5px',
            color: '#f3f2f2',
          }}
        >
          Kalıcı Shopier siparişleri için Supabase Dashboard’da <code>supabase/schema.sql</code> içindeki{' '}
          <code>orders</code>, <code>order_messages</code> ve <code>user_profiles</code> tablolarını çalıştırın.
        </div>
      )}

      {statusMsg && (
        <div
          style={{
            marginBottom: '12px',
            padding: '10px 14px',
            borderRadius: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            fontSize: '12.5px',
            color: '#f3f2f2',
          }}
        >
          {statusMsg}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '24px', color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
          Siparişler yükleniyor...
        </div>
      ) : orders.length === 0 ? (
        <div style={{ padding: '24px', color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
          Henüz oluşturulmuş Shopier siparişi yok.
        </div>
      ) : (
        <div className="rs-admin-orders-grid">
          <div className="rs-admin-orders-list">
            {orders.map((ord) => (
              <button
                key={ord.referenceCode}
                type="button"
                onClick={() => setSelectedRef(ord.referenceCode)}
                className={`rs-order-list-btn ${selectedRef === ord.referenceCode ? 'is-selected' : ''}`}
              >
                <div className="rs-order-list-top">
                  <span className="rs-order-ref">{ord.referenceCode}</span>
                  <span style={{ fontSize: '11px', color: ord.status === 'delivered' ? '#4ade80' : '#f97316' }}>
                    {ord.status}
                  </span>
                </div>
                <div className="rs-order-title">{ord.title}</div>
                <div className="rs-order-meta">
                  <span>{ord.buyerName || ord.buyerEmail || 'Üye'}</span>
                  <span>{ord.totalAmount} TL</span>
                </div>
              </button>
            ))}
          </div>

          {selectedOrder && (
            <div className="rs-admin-order-room">
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                <div>
                  <strong style={{ fontSize: '15px', color: '#fff' }}>
                    {selectedOrder.referenceCode} · {selectedOrder.title}
                  </strong>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)' }}>
                    Alıcı: {selectedOrder.buyerName} ({selectedOrder.buyerEmail || selectedOrder.userId}) · {selectedOrder.totalAmount} TL
                  </div>
                </div>
              </div>

              <div className="rs-chat-feed" style={{ maxHeight: '260px', marginBottom: '12px' }}>
                {messages.map((m) => (
                  <div key={m.id} className={`rs-chat-msg is-${m.senderRole}`}>
                    <div className="rs-chat-msg-meta">
                      <strong>{m.senderName}</strong>
                      <span>{new Date(m.createdAt).toLocaleString('tr-TR')}</span>
                    </div>
                    <p className="rs-chat-msg-body">{m.body}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleReply} style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Müşteriye hızlı yanıt yaz..."
                  className="st-input"
                />
                <button type="submit" disabled={busy || !replyText.trim()} className="rs-admin-store-btn-ghost">
                  Yanıtla
                </button>
              </form>

              <form
                onSubmit={handleDeliverBundle}
                style={{
                  padding: '14px',
                  borderRadius: '14px',
                  background: 'rgba(239, 91, 56, 0.08)',
                  border: '1px solid rgba(239, 91, 56, 0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <strong style={{ fontSize: '12.5px', color: '#ef5b38' }}>
                  KURUMSAL DİJİTAL TESLİMAT YAP (MÜŞTERİ KASASINA SABİTLENİR)
                </strong>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                  <input
                    type="text"
                    value={licenseCode}
                    onChange={(e) => setLicenseCode(e.target.value)}
                    placeholder="Aktivasyon / Lisans Kodu (opsiyonel)"
                    className="st-input"
                  />
                  <input
                    type="url"
                    value={downloadUrl}
                    onChange={(e) => setDownloadUrl(e.target.value)}
                    placeholder="https:// indirme / dosya linki (opsiyonel)"
                    className="st-input"
                  />
                </div>
                <textarea
                  rows={2}
                  required
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Teslimat & kurulum açıklaması..."
                  className="st-input"
                />
                <div>
                  <button type="submit" disabled={busy} className="rs-admin-store-btn-primary">
                    {busy ? 'Gönderiliyor...' : 'Ürünü Teslim Et (Teslim Edildi İşaretle)'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
