import type { FC } from "hono/jsx";
import { raw } from "hono/html";
import Layout from "../../components/layout";
import type { AuthUser } from "../../middleware/auth";
import type { AffiliateAccount, SocialConnection } from "../../lib/db";

interface AccountWithConnections extends AffiliateAccount {
  connections: SocialConnection[];
}

interface PlatformConnectProps {
  user: AuthUser;
  accounts: AccountWithConnections[];
  platforms: readonly string[];
}

const PLATFORM_INFO: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  TWITTER: { label: "X", color: "text-white", bg: "bg-slate-800 hover:bg-slate-900", icon: "𝕏" },
  FACEBOOK: { label: "FB", color: "text-white", bg: "bg-blue-600 hover:bg-blue-700", icon: "f" },
  INSTAGRAM: { label: "IG", color: "text-white", bg: "bg-gradient-to-br from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500", icon: "📷" },
  TIKTOK: { label: "TK", color: "text-white", bg: "bg-slate-900 hover:bg-black", icon: "🎵" },
  THREADS: { label: "TH", color: "text-white", bg: "bg-slate-800 hover:bg-slate-900", icon: "🧵" },
  PINTEREST: { label: "PIN", color: "text-white", bg: "bg-red-600 hover:bg-red-700", icon: "📌" },
  LINKEDIN: { label: "LI", color: "text-white", bg: "bg-blue-700 hover:bg-blue-800", icon: "in" },
  YOUTUBE: { label: "YT", color: "text-white", bg: "bg-red-600 hover:bg-red-700", icon: "▶" },
  REDDIT: { label: "RD", color: "text-white", bg: "bg-orange-600 hover:bg-orange-700", icon: "🤖" },
  DISCORD: { label: "DC", color: "text-white", bg: "bg-indigo-600 hover:bg-indigo-700", icon: "🎮" },
  SLACK: { label: "SL", color: "text-white", bg: "bg-emerald-600 hover:bg-emerald-700", icon: "#" },
  MASTODON: { label: "MS", color: "text-white", bg: "bg-purple-600 hover:bg-purple-700", icon: "🐘" },
  BLUESKY: { label: "BS", color: "text-white", bg: "bg-sky-500 hover:bg-sky-600", icon: "☁" },
  GOOGLE_BUSINESS: { label: "GB", color: "text-white", bg: "bg-blue-500 hover:bg-blue-600", icon: "G" },
  SNAPCHAT: { label: "SC", color: "text-white", bg: "bg-amber-400 hover:bg-amber-500", icon: "👻" },
};

const PLATFORM_ICONS: Record<string, string> = {
  FACEBOOK: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
  TWITTER: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  INSTAGRAM: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/></svg>`,
  TIKTOK: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>`,
  THREADS: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509-1.816-2.262-2.737-5.37-2.737-9.236 0-3.866.921-6.974 2.737-9.236C5.845.705 8.598-.476 12.179.5c3.581.024 6.334 1.205 8.184 3.509 1.816 2.262 2.737 5.37 2.737 9.236 0 3.866-.921 6.974-2.737 9.236-1.85 2.304-4.603 3.485-8.184 3.509h.007zm.007-21.997c-3.099.021-5.474.994-7.073 2.893-1.562 1.857-2.347 4.414-2.347 7.659 0 3.245.785 5.802 2.347 7.659 1.599 1.899 3.974 2.872 7.073 2.893 3.099-.021 5.474-.994 7.073-2.893 1.562-1.857 2.347-4.414 2.347-7.659 0-3.245-.785-5.802-2.347-7.659-1.599-1.899-3.974-2.872-7.073-2.893zm.107 18.444c-1.847 0-3.461-.636-4.64-1.832-1.154-1.159-1.778-2.737-1.795-4.543h3.579c.013.617.202 1.14.562 1.554.37.414.903.633 1.544.633.914 0 1.444-.563 1.585-1.347.099-.485.099-.97.099-1.455 0-.485-.006-.97-.102-1.456-.141-.785-.673-1.348-1.586-1.348-.641 0-1.175.219-1.544.633-.36.414-.569.937-.582 1.554H8.95c.017-1.806.641-3.384 1.795-4.543 1.179-1.196 2.793-1.832 4.64-1.832 1.847 0 3.461.636 4.64 1.832 1.154 1.159 1.778 2.737 1.795 4.543h-3.579c-.013-.617-.202-1.14-.562-1.554-.37-.414-.903-.633-1.544-.633-.914 0-1.444.563-1.585 1.347-.099.485-.099.97-.099 1.455 0 .485.006.97.102 1.456.141.785.673 1.348 1.586 1.348.641 0 1.175-.219 1.544-.633.36-.414.569-.937.582-1.554h3.579c-.017 1.806-.641 3.384-1.795 4.543-1.179 1.196-2.793 1.832-4.64 1.832z"/></svg>`,
  PINTEREST: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/></svg>`,
};

const PlatformConnectPage: FC<PlatformConnectProps> = ({ user, accounts, platforms }) => {
  const connectedCount = accounts.filter((a) =>
    a.connections.some((c) => c.status === "connected")
  ).length;

  const groups = new Map<string, AccountWithConnections[]>();
  for (const acc of accounts) {
    const key = acc.identity || "Uncategorized";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(acc);
  }

  return (
    <Layout user={user} title="Platform Connect" currentPath="/platform/connect">
      {/* Summary Cards */}
      <div class="grid grid-cols-3 gap-4 mb-6">
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-center">
          <div class="text-2xl font-bold text-slate-800">{accounts.length}</div>
          <div class="text-xs text-slate-500 mt-1">Total Akun</div>
        </div>
        <div class="bg-emerald-50 rounded-xl border border-emerald-200 shadow-sm p-4 text-center">
          <div class="text-2xl font-bold text-emerald-600" id="connectedCount">{connectedCount}</div>
          <div class="text-xs text-emerald-500 mt-1">Connected</div>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-center">
          <div class="text-2xl font-bold text-slate-800">{platforms.length}</div>
          <div class="text-xs text-slate-500 mt-1">Platform</div>
        </div>
      </div>

      {/* Account Groups */}
      <div class="space-y-6">
        {accounts.length === 0 ? (
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
            <div class="text-4xl mb-3">📭</div>
            <div class="text-slate-500 text-sm">Belum ada akun yang siap. Buat akun Bunsoc terlebih dahulu.</div>
          </div>
        ) : (
          [...groups.entries()].map(([groupName, groupAccounts]) => (
            <div>
              <div class="flex items-center gap-2 mb-3">
                <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">{groupName}</span>
                <span class="text-xs text-slate-400">({groupAccounts.length})</span>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {groupAccounts.map((acc) => {
                  const connectedPlatforms = acc.connections.filter((c) => c.status === "connected");
                  const needsChannelPlatforms = acc.connections.filter((c) => c.status === "connected" && !c.channel_id);
                  return (
                    <div class="account-card bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow transition" data-account-id={String(acc.id)}>
                      {/* Account Header */}
                      <div class="p-4">
                        <div class="flex items-center justify-between">
                          <div class="min-w-0 flex-1">
                            <div class="flex items-center gap-2">
                              <span class="text-sm font-medium text-slate-700 truncate">{acc.email}</span>
                              <span class="account-identity text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-600 font-medium shrink-0 cursor-pointer hover:bg-indigo-200" data-identity-edit={String(acc.id)} title="Click to edit identity">
                                {acc.identity || "+"}
                              </span>
                            </div>
                            <div class="flex items-center gap-1.5 mt-1.5 flex-wrap">
                              {connectedPlatforms.length === 0 ? (
                                <span class="text-[10px] text-slate-400">No platforms connected</span>
                              ) : (
                                connectedPlatforms.map((c) => {
                                  const info = PLATFORM_INFO[c.platform] || { label: c.platform.substring(0, 2), color: "text-white", bg: "bg-slate-500", icon: "?" };
                                  return (
                                    <span class={`text-[10px] px-1.5 py-0.5 rounded-full font-medium text-white ${info.bg.split(" ")[0]}`}>
                                      {info.label}
                                    </span>
                                  );
                                })
                              )}
                              {needsChannelPlatforms.length > 0 && (
                                <span class="text-[10px] text-amber-500">({needsChannelPlatforms.length} need channel)</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Platform List - always visible */}
                      <div class="border-t border-slate-100 p-3">
                        <div class="overflow-x-auto" style="scrollbar-width: none; -ms-overflow-style: none;">
                          <div class="flex gap-2" style="min-width: max-content;">
                          {platforms.filter((p) => ["TWITTER", "FACEBOOK", "THREADS", "INSTAGRAM", "TIKTOK", "PINTEREST"].includes(p)).map((platform) => {
                            const conn = acc.connections.find((c) => c.platform === platform);
                            const info = PLATFORM_INFO[platform] || { label: platform.substring(0, 2), color: "text-slate-600", bg: "bg-slate-100", icon: "?" };
                            const isConnected = conn?.status === "connected";
                            const hasChannel = conn?.channel_id;
                            const needsChannel = isConnected && !hasChannel;
                            const channels = conn?.channels ? (() => { try { return JSON.parse(conn.channels); } catch { return []; } })() : [];

                            return (
                              <div class={`platform-row flex flex-col items-center gap-1 shrink-0`} data-platform={platform} data-account-id={String(acc.id)}>
                                {/* Platform button */}
                                <button
                                  class={`connect-btn w-12 h-12 rounded-full flex items-center justify-center transition cursor-pointer relative flex-shrink-0 ${isConnected ? info.bg + " " + info.color : "bg-slate-100 text-slate-400 hover:bg-slate-200"}`}
                                  data-platform={platform}
                                  data-account-id={String(acc.id)}
                                  title={isConnected ? (hasChannel ? "Connected" : "Need channel") : "Connect " + platform.charAt(0) + platform.slice(1).toLowerCase()}
                                >
                                  {raw(PLATFORM_ICONS[platform] || info.label)}
                                  {isConnected && (
                                    <span class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center text-[8px] shadow-sm">
                                      {hasChannel ? "✅" : "⚠️"}
                                    </span>
                                  )}
                                </button>

                                {/* Actions for connected */}
                                {isConnected && (
                                  <div class="flex items-center gap-0.5">
                                    <button
                                      class="check-status-btn text-[8px] px-1 py-0.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                                      data-platform={platform}
                                      data-account-id={String(acc.id)}
                                      title="Refresh status"
                                    >
                                      ↻
                                    </button>
                                    <button
                                      class="disconnect-btn text-[8px] px-1 py-0.5 rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                                      data-platform={platform}
                                      data-account-id={String(acc.id)}
                                      title="Disconnect"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                )}

                                {/* Channel chips */}
                                {needsChannel && channels.length > 0 && (
                                  <div class="channel-chips flex flex-col gap-0.5 w-full">
                                    {channels.map((ch: any) => (
                                      <button
                                        class="channel-chip-btn text-[7px] px-1 py-0.5 rounded bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 transition cursor-pointer truncate text-left"
                                        data-platform={platform}
                                        data-account-id={String(acc.id)}
                                        data-channel-id={ch.id}
                                        data-channel-name={ch.name}
                                        title={ch.name}
                                      >
                                        {ch.name}
                                      </button>
                                    ))}
                                  </div>
                                )}

                                {conn?.error && (
                                  <span class="text-[8px] text-red-400 truncate max-w-[60px] text-center">{conn.error}</span>
                                )}
                              </div>
                            );
                          })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      <script>{raw(`
        (function() {
          // Connect button
          document.addEventListener('click', function(e) {
            var btn = e.target.closest('.connect-btn');
            if (!btn) return;
            e.preventDefault();
            var accountId = btn.getAttribute('data-account-id');
            var platform = btn.getAttribute('data-platform');
            btn.disabled = true;
            btn.textContent = '...';

            fetch('/api/platform/portal', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ accountId: Number(accountId), platform: platform })
            })
            .then(function(r) { return r.json(); })
            .then(function(data) {
              if (data.url) {
                window.open(data.url, '_blank');
                btn.disabled = false;
              } else {
                btn.textContent = 'Error';
                btn.disabled = false;
                alert(data.error || 'Failed to create portal link');
              }
            })
            .catch(function(e) {
              btn.textContent = 'Retry';
              btn.disabled = false;
            });
          });

          // Check status button
          document.addEventListener('click', function(e) {
            var btn = e.target.closest('.check-status-btn');
            if (!btn) return;
            e.preventDefault();
            var accountId = btn.getAttribute('data-account-id');
            var platform = btn.getAttribute('data-platform');
            btn.textContent = '...';
            btn.disabled = true;

            fetch('/api/platform/check-status', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ accountId: Number(accountId), platform: platform })
            })
            .then(function(r) { return r.json(); })
            .then(function(data) {
              btn.textContent = '↻';
              btn.disabled = false;
              if (data.status === 'connected' || data.status === 'needs_channel') {
                updatePlatformRow(accountId, platform, data);
              } else {
                updatePlatformRow(accountId, platform, { status: 'not_connected' });
              }
            })
            .catch(function(e) {
              btn.textContent = '↻';
              btn.disabled = false;
            });
          });

          // Channel chip click (set channel)
          document.addEventListener('click', function(e) {
            var chip = e.target.closest('.channel-chip-btn');
            if (!chip) return;
            e.preventDefault();
            var accountId = chip.getAttribute('data-account-id');
            var platform = chip.getAttribute('data-platform');
            var channelId = chip.getAttribute('data-channel-id');
            var channelName = chip.getAttribute('data-channel-name');
            if (!channelId || !channelName) return;

            chip.textContent = '...';
            chip.disabled = true;
            fetch('/api/platform/set-channel', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ accountId: Number(accountId), platform: platform, channelId: channelId, channelName: channelName })
            })
            .then(function(r) { return r.json(); })
            .then(function(data) {
              if (data.success) {
                location.reload();
              }
            })
            .catch(function(e) {
              chip.disabled = false;
            });
          });

          // Disconnect button
          document.addEventListener('click', function(e) {
            var btn = e.target.closest('.disconnect-btn');
            if (!btn) return;
            e.preventDefault();
            if (!confirm('Disconnect this platform?')) return;
            var accountId = btn.getAttribute('data-account-id');
            var platform = btn.getAttribute('data-platform');
            btn.textContent = '...';
            btn.disabled = true;

            fetch('/api/platform/disconnect', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ accountId: Number(accountId), platform: platform })
            })
            .then(function(r) { return r.json(); })
            .then(function(data) {
              if (data.success) {
                location.reload();
              }
            })
            .catch(function(e) {
              btn.textContent = '✕';
              btn.disabled = false;
            });
          });

          function updatePlatformRow(accountId, platform, data) {
            var row = document.querySelector('.platform-row[data-account-id="' + accountId + '"][data-platform="' + platform + '"]');
            if (!row) return;
            var isConnected = data.status === 'connected' || data.status === 'needs_channel';

            if (isConnected) {
              row.classList.add('border-emerald-200', 'bg-emerald-50/50');
              row.classList.remove('border-slate-100', 'bg-slate-50');
            }

            if (isConnected && !data.needsChannel) {
              setTimeout(function() { location.reload(); }, 500);
            }
          }

          // Identity edit
          document.addEventListener('click', function(e) {
            var target = e.target;
            if (target && target.hasAttribute('data-identity-edit')) {
              e.preventDefault();
              e.stopPropagation();
              var badge = target;
              var accountId = badge.getAttribute('data-identity-edit');
              var current = badge.textContent.trim();
              if (current === '+') current = '';

              var input = document.createElement('input');
              input.type = 'text';
              input.value = current;
              input.className = 'text-[10px] px-1.5 py-0.5 rounded border border-indigo-300 bg-white text-indigo-600 font-medium w-24 outline-none';
              input.setAttribute('data-identity-edit', accountId);

              input.onblur = function() {
                saveIdentity(accountId, input.value.trim(), input, badge);
              };
              input.onkeydown = function(ev) {
                if (ev.key === 'Enter') { saveIdentity(accountId, input.value.trim(), input, badge); }
                if (ev.key === 'Escape') { input.replaceWith(badge); }
              };

              badge.replaceWith(input);
              input.focus();
              input.select();
            }
          });

          function saveIdentity(accountId, value, input, badge) {
            badge.textContent = value || '+';
            input.replaceWith(badge);
            fetch('/platform/connect/identity', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: 'accountId=' + accountId + '&identity=' + encodeURIComponent(value)
            });
          }
        })();
      `)}</script>
    </Layout>
  );
};

export default PlatformConnectPage;