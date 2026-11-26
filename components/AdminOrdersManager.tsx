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
  const [threadFilter, setThreadFilter] = useState<'all' | 'orders' | 'support'>('all');
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
  const [tgInfo, setTgInfo] = useState<{
    configured: boolean;
    botUsername: string;
    webhookSecretConfigured: boolean;
    webhookUrl: string | null;
    adminChatIdsCount: number;
    adminBindUrl: string | null;
    busy: boolean;
  } | null>(null);

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

  const loadTelegramAdmin = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/telegram', {
        credentials: 'same-origin',
        cache: 'no-store',
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        setTgInfo({
          configured: Boolean(data.configured),
          botUsername: data.botUsername || 'restrictedstudio_bot',
          webhookSecretConfigured: Boolean(data.webhookSecretConfigured),
          webhookUrl: data.webhookUrl || null,
          adminChatIdsCount: Number(data.adminChatIdsCount || 0),
          adminBindUrl: data.adminBindUrl || null,
          busy: false,
        });
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    void loadOrders();
    void loadTelegramAdmin();
  }, [loadOrders, loadTelegramAdmin]);

  const handleTelegramAction = async (action: 'setup_webhook' | 'test_admin_message') => {
    setTgInfo((prev) => (prev ? { ...prev, busy: true } : prev));
    setStatusMsg(null);
    try {
      const res = await fetch('/api/admin/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ action }),
      });
      const data = await res.json().catch(() => null);
      setStatusMsg(data?.message || 'Telegram işlemi tamamlandı.');
      await loadTelegramAdmin();
    } catch {
      setStatusMsg('Telegram isteği sırasında bağlantı hatası.');
    } finally {
      setTgInfo((prev) => (prev ? { ...prev, busy: false } : prev));
    }
  };

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

      {tgInfo && (
        <div className="rs-admin-tg-bar">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <strong style={{ fontSize: '12.5px', color: '#e0f2fe' }}>
              Telegram Bot Bildirimleri (@{tgInfo.botUsername})
            </strong>
            <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              Bot: {tgInfo.configured ? 'Aktif' : 'Token Eksik (Redeploy Gerekebilir)'} · Secret:{' '}
              {tgInfo.webhookSecretConfigured ? 'Tanımlı' : 'Eksik'} · Webhook:{' '}
              {tgInfo.webhookUrl ? 'Bağlı' : 'Kurulmadı'} · Yönetici Sohbeti:{' '}
              {tgInfo.adminChatIdsCount} bağlı
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {tgInfo.adminBindUrl && (
              <a
                href={tgInfo.adminBindUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rs-admin-store-btn-ghost"
              >
                Admin Telegram Bağla ↗
              </a>
            )}
            <button
              type="button"
              onClick={() => void handleTelegramAction('setup_webhook')}
              disabled={tgInfo.busy}
              className="rs-admin-store-btn-ghost"
            >
              {tgInfo.busy ? 'İşleniyor...' : 'Webhook Kur'}
            </button>
            <button
              type="button"
              onClick={() => void handleTelegramAction('test_admin_message')}
              disabled={tgInfo.busy}
              className="rs-admin-store-btn-primary"
            >
              {tgInfo.busy ? 'Gönderiliyor...' : 'Test Gönder'}
            </button>
          </div>
        </div>
      )}

      {!tableReady && (
        <div
          style={{
            marginBottom: '12px',
            padding: '10px 14px',
            borderRadius: '12px',
            backgroundColor: 'rgba(249, 115, 22, 0.14)',
            border: '1px solid rgba(249, 115, 22, 0.42)',
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
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
            {(
              [
                { key: 'all', label: `Tümü (${orders.length})` },
                {
                  key: 'orders',
                  label: `Siparişler (${orders.filter((o) => o.source !== 'support' && o.paymentProvider !== 'direct').length})`,
                },
                {
                  key: 'support',
                  label: `Canlı Destek Mesajları (${orders.filter((o) => o.source === 'support' || o.paymentProvider === 'direct').length})`,
                },
              ] as const
            ).map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setThreadFilter(f.key)}
                className={`st-filter-pill ${threadFilter === f.key ? 'is-active' : ''}`}
                style={{ padding: '6px 13px', fontSize: '12px' }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="rs-admin-orders-grid">
            <div className="rs-admin-orders-list">
              {orders
                .filter((ord) => {
                  const isSup = ord.source === 'support' || ord.paymentProvider === 'direct';
                  if (threadFilter === 'support') return isSup;
                  if (threadFilter === 'orders') return !isSup;
                  return true;
                })
                .map((ord) => {
                  const isSup = ord.source === 'support' || ord.paymentProvider === 'direct';
                  return (
                    <button
                      key={ord.referenceCode}
                      type="button"
                      onClick={() => setSelectedRef(ord.referenceCode)}
                      className={`rs-order-list-btn ${selectedRef === ord.referenceCode ? 'is-selected' : ''}`}
                    >
                      <div className="rs-order-list-top">
                        <span className="rs-order-ref">{ord.referenceCode}</span>
                        <span
                          style={{
                            fontSize: '11px',
                            color: isSup ? '#38bdf8' : ord.status === 'delivered' ? '#4ade80' : '#f97316',
                          }}
                        >
                          {isSup ? 'CANLI DESTEK' : ord.status}
                        </span>
                      </div>
                      <div className="rs-order-title">{ord.title}</div>
                      <div className="rs-order-meta">
                        <span>{ord.buyerName || ord.buyerEmail || 'Üye'}</span>
                        <span>{isSup ? 'Mesajlaşma' : `${ord.totalAmount} TL`}</span>
                      </div>
                    </button>
                  );
                })}
            </div>

            {selectedOrder && (
              <div className="rs-admin-order-room">
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                  <div>
                    <strong style={{ fontSize: '15px', color: '#fff' }}>
                      {selectedOrder.referenceCode} · {selectedOrder.title}
                    </strong>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)' }}>
                      Gönderen: {selectedOrder.buyerName} ({selectedOrder.buyerEmail || selectedOrder.userId}) ·{' '}
                      {selectedOrder.source === 'support' || selectedOrder.paymentProvider === 'direct'
                        ? 'Canlı Destek Mesajı'
                        : `${selectedOrder.totalAmount} TL`}
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

              {selectedOrder.source !== 'support' && selectedOrder.paymentProvider !== 'direct' && (
                <form
                  onSubmit={handleDeliverBundle}
                  style={{
                    padding: '14px',
                    borderRadius: '14px',
                    background: 'rgba(249, 115, 22, 0.09)',
                    border: '1px solid rgba(249, 115, 22, 0.34)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <strong style={{ fontSize: '12.5px', color: '#FF9B55' }}>
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
              )}
            </div>
          )}
        </div>
        </>
      )}
    </section>
  );
}
