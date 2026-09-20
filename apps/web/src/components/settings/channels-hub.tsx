'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Badge, Input } from '@talkie/ui';
import {
  MessageSquare,
  Bot,
  Phone,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Plus,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

interface ChannelItem {
  id: string;
  name: string;
  type: string;
  identifier: string;
  status: string;
  webhookUrl?: string;
  createdAt: string;
}

export function ChannelsHub() {
  const [whatsappAccounts, setWhatsappAccounts] = useState<ChannelItem[]>([]);
  const [telegramAccounts, setTelegramAccounts] = useState<ChannelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Connect Modals
  const [isConnectWAOpen, setIsConnectWAOpen] = useState(false);
  const [isConnectTGOpen, setIsConnectTGOpen] = useState(false);

  // Disconnect Confirmation Modal
  const [disconnectingAccount, setDisconnectingAccount] = useState<{ id: string; type: string; name: string } | null>(null);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Form States - WhatsApp
  const [waPhoneNumberId, setWaPhoneNumberId] = useState('');
  const [waAccessToken, setWaAccessToken] = useState('');
  const [waAppSecret, setWaAppSecret] = useState('');
  const [waVerifyToken, setWaVerifyToken] = useState('talkie_wa_verify_token');
  const [waName, setWaName] = useState('');
  const [submittingWA, setSubmittingWA] = useState(false);

  // Form States - Telegram
  const [tgBotToken, setTgBotToken] = useState('');
  const [tgBotUsername, setTgBotUsername] = useState('');
  const [tgName, setTgName] = useState('');
  const [submittingTG, setSubmittingTG] = useState(false);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchChannels = useCallback(async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    else setLoading(true);

    try {
      const [waRes, tgRes] = await Promise.all([
        fetch('/api/v1/channels/whatsapp'),
        fetch('/api/v1/channels/telegram'),
      ]);

      const [waJson, tgJson] = await Promise.all([waRes.json(), tgRes.json()]);

      if (waJson.success && Array.isArray(waJson.data)) {
        setWhatsappAccounts(waJson.data);
      }
      if (tgJson.success && Array.isArray(tgJson.data)) {
        setTelegramAccounts(tgJson.data);
      }
    } catch (err) {
      console.error('Failed to load channels:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleConnectWA = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingWA(true);
    try {
      const res = await fetch('/api/v1/channels/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumberId: waPhoneNumberId.trim(),
          accessToken: waAccessToken.trim(),
          appSecret: waAppSecret.trim(),
          verifyToken: waVerifyToken.trim(),
          name: waName.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to connect WhatsApp account');
      }

      setIsConnectWAOpen(false);
      setWaPhoneNumberId('');
      setWaAccessToken('');
      setWaAppSecret('');
      fetchChannels(true);
    } catch (err: any) {
      alert(err.message || 'WhatsApp connection failed');
    } finally {
      setSubmittingWA(false);
    }
  };

  const handleConnectTG = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingTG(true);
    try {
      const res = await fetch('/api/v1/channels/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken: tgBotToken.trim(),
          botUsername: tgBotUsername.trim() || undefined,
          name: tgName.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to connect Telegram Bot');
      }

      setIsConnectTGOpen(false);
      setTgBotToken('');
      setTgBotUsername('');
      fetchChannels(true);
    } catch (err: any) {
      alert(err.message || 'Telegram Bot connection failed');
    } finally {
      setSubmittingTG(false);
    }
  };

  const handleConfirmDisconnect = async () => {
    if (!disconnectingAccount) return;
    setIsDisconnecting(true);
    try {
      const endpoint =
        disconnectingAccount.type === 'whatsapp'
          ? `/api/v1/channels/whatsapp?id=${disconnectingAccount.id}`
          : `/api/v1/channels/telegram?id=${disconnectingAccount.id}`;

      const res = await fetch(endpoint, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to disconnect channel');
      }

      setDisconnectingAccount(null);
      fetchChannels(true);
    } catch (err: any) {
      alert(err.message || 'Disconnect failed');
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white tracking-tight">Channel Connection Hub</h2>
            <Badge variant="neutral" className="text-xs font-mono">
              {whatsappAccounts.length + telegramAccounts.length} Connected
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Connect and synchronize official WhatsApp Business APIs and Telegram Bots for omnichannel messaging.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchChannels(true)}
          title="Refresh channels"
          disabled={refreshing}
          className="p-2 rounded-xl bg-black/40 border border-white/[0.08] text-neutral-400 hover:text-white hover:border-white/[0.2] transition w-fit"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* WhatsApp Business Card */}
      <Card className="p-6 bg-[#0a0c10] border-white/[0.08] shadow-xl space-y-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">WhatsApp Business Cloud API</h3>
                <Badge variant={whatsappAccounts.length > 0 ? 'success' : 'neutral'} className="text-[10px] font-mono">
                  {whatsappAccounts.length > 0 ? `${whatsappAccounts.length} Active` : 'Disconnected'}
                </Badge>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Official Meta Graph Cloud API integration for inbound and outbound customer support conversations.
              </p>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => setIsConnectWAOpen(true)}
            className="h-8 text-xs bg-emerald-500 hover:bg-emerald-400 text-black font-semibold shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>Connect WhatsApp</span>
          </Button>
        </div>

        {whatsappAccounts.length === 0 ? (
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-neutral-400 flex items-center justify-between">
            <span>No WhatsApp Business accounts linked yet. Click &quot;Connect WhatsApp&quot; to register Phone Number ID and System Token.</span>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04] border border-white/[0.06] rounded-xl overflow-hidden bg-black/40">
            {whatsappAccounts.map((acc) => (
              <div key={acc.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{acc.name}</span>
                    <Badge variant="success" className="text-[9px] font-mono uppercase">
                      {acc.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-neutral-400 font-mono">
                    Phone Number ID: <span className="text-neutral-200">{acc.identifier}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setDisconnectingAccount({ id: acc.id, type: 'whatsapp', name: acc.name })
                    }
                    className="h-8 px-2.5 text-xs text-red-400 hover:bg-red-500/10 border border-red-500/20"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    <span>Disconnect</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Telegram Bot Card */}
      <Card className="p-6 bg-[#0a0c10] border-white/[0.08] shadow-xl space-y-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Telegram Bot API</h3>
                <Badge variant={telegramAccounts.length > 0 ? 'success' : 'neutral'} className="text-[10px] font-mono">
                  {telegramAccounts.length > 0 ? `${telegramAccounts.length} Active` : 'Disconnected'}
                </Badge>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Official Telegram Bot Webhook synchronization for immediate 2-way AI assistant updates.
              </p>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => setIsConnectTGOpen(true)}
            className="h-8 text-xs bg-blue-500 hover:bg-blue-400 text-white font-semibold shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>Connect Telegram Bot</span>
          </Button>
        </div>

        {telegramAccounts.length === 0 ? (
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-neutral-400 flex items-center justify-between">
            <span>No Telegram Bots connected yet. Create a bot via @BotFather and connect its Bot API Token.</span>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04] border border-white/[0.06] rounded-xl overflow-hidden bg-black/40">
            {telegramAccounts.map((acc) => (
              <div key={acc.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{acc.name}</span>
                    <Badge variant="success" className="text-[9px] font-mono uppercase">
                      {acc.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-neutral-400 font-mono">
                    Bot Handle: <span className="text-neutral-200">@{acc.identifier}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setDisconnectingAccount({ id: acc.id, type: 'telegram', name: acc.name })
                    }
                    className="h-8 px-2.5 text-xs text-red-400 hover:bg-red-500/10 border border-red-500/20"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    <span>Disconnect</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Connect WhatsApp Modal */}
      {isConnectWAOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg bg-[#0a0c10] border-white/[0.1] shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">Connect WhatsApp Business Account</h3>
              </div>
              <button onClick={() => setIsConnectWAOpen(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleConnectWA} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">Account Display Name (Optional)</label>
                <Input
                  value={waName}
                  onChange={(e) => setWaName(e.target.value)}
                  placeholder="e.g. Talkie Customer Support"
                  className="bg-black/60 border-white/[0.08] text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">WhatsApp Phone Number ID *</label>
                <Input
                  required
                  value={waPhoneNumberId}
                  onChange={(e) => setWaPhoneNumberId(e.target.value)}
                  placeholder="e.g. 109283746501928"
                  className="bg-black/60 border-white/[0.08] text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Permanent System User Access Token *</label>
                <Input
                  required
                  type="password"
                  value={waAccessToken}
                  onChange={(e) => setWaAccessToken(e.target.value)}
                  placeholder="EAAG..."
                  className="bg-black/60 border-white/[0.08] text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">App Secret (for HMAC verification)</label>
                <Input
                  type="password"
                  value={waAppSecret}
                  onChange={(e) => setWaAppSecret(e.target.value)}
                  placeholder="32-character Meta App Secret"
                  className="bg-black/60 border-white/[0.08] text-white font-mono"
                />
              </div>

              <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setIsConnectWAOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={submittingWA || !waPhoneNumberId || !waAccessToken}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold"
                >
                  {submittingWA ? 'Connecting...' : 'Save & Connect'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Connect Telegram Modal */}
      {isConnectTGOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg bg-[#0a0c10] border-white/[0.1] shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Bot className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">Connect Telegram Bot</h3>
              </div>
              <button onClick={() => setIsConnectTGOpen(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleConnectTG} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">Bot Name / Label (Optional)</label>
                <Input
                  value={tgName}
                  onChange={(e) => setTgName(e.target.value)}
                  placeholder="e.g. Talkie AI Concierge"
                  className="bg-black/60 border-white/[0.08] text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Telegram Bot API Token *</label>
                <Input
                  required
                  type="password"
                  value={tgBotToken}
                  onChange={(e) => setTgBotToken(e.target.value)}
                  placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                  className="bg-black/60 border-white/[0.08] text-white font-mono"
                />
                <p className="text-[11px] text-neutral-500 mt-1">Obtained by creating a bot with @BotFather in Telegram.</p>
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Bot Username (Optional, without @)</label>
                <Input
                  value={tgBotUsername}
                  onChange={(e) => setTgBotUsername(e.target.value)}
                  placeholder="talkie_demo_bot"
                  className="bg-black/60 border-white/[0.08] text-white font-mono"
                />
              </div>

              <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setIsConnectTGOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={submittingTG || !tgBotToken}
                  className="bg-blue-500 hover:bg-blue-400 text-white font-semibold"
                >
                  {submittingTG ? 'Registering...' : 'Save & Register'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Safe Disconnect Destructive Dialog */}
      {disconnectingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md bg-[#0a0c10] border-red-500/30 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">Disconnect {disconnectingAccount.name}?</h3>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Disconnecting will immediately deactivate inbound webhook handlers and stop automated AI responses on this channel. Past message history will be preserved.
            </p>

            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2">
              <Button
                variant="outline"
                disabled={isDisconnecting}
                onClick={() => setDisconnectingAccount(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={isDisconnecting}
                onClick={handleConfirmDisconnect}
                className="text-xs bg-red-600 hover:bg-red-500 text-white font-semibold"
              >
                {isDisconnecting ? 'Disconnecting...' : 'Confirm Disconnect'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
