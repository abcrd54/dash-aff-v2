import type { FC } from "hono/jsx";
import { raw } from "hono/html";
import Layout from "../../components/layout";
import type { AuthUser } from "../../middleware/auth";
import type { AffiliateAccount, SocialConnection } from "../../lib/db";
import { PLATFORM_INFO, PLATFORM_ICONS } from "../../lib/constants";

interface AccountWithConnections extends AffiliateAccount {
  connections: SocialConnection[];
}

interface PlatformConnectProps {
  user: AuthUser;
  accounts: AccountWithConnections[];
  platforms: readonly string[];
}

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
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm empty-state">
            <div class="empty-state-icon"><i class="fa-solid fa-inbox"></i></div>
            <p class="empty-state-text">Belum ada akun yang siap</p>
            <p class="text-xs text-slate-400 mb-4">Buat akun Bunsocial terlebih dahulu sebelum menghubungkan platform</p>
            <a href="/create-bunsos" class="empty-state-action">Buat Akun Bunsocial</a>
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
                                  const info = PLATFORM_INFO[c.platform] || { label: c.platform.substring(0, 2), color: "text-white", bg: "bg-slate-500" };
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
                            const info = PLATFORM_INFO[platform] || { label: platform.substring(0, 2), color: "text-slate-600", bg: "bg-slate-100" };
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
                                      <i class={`fa-solid ${hasChannel ? "fa-circle-check" : "fa-triangle-exclamation"}`}></i>
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
                btn.textContent = 'Connect';
                btn.disabled = false;
                showToast('error', 'Error', data.error || 'Gagal membuat portal link');
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
            var accountId = btn.getAttribute('data-account-id');
            var platform = btn.getAttribute('data-platform');
            showConfirm('Disconnect Platform', 'Yakin ingin disconnect platform ' + platform + '?', function() {
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
