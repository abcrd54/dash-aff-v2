import type { FC } from "hono/jsx";
import { raw } from "hono/html";
import Layout from "../../components/layout";
import type { JWTPayload } from "../../middleware/auth";
import type { AffiliateAccount, SocialConnection } from "../../lib/db";

interface AccountWithConnections extends AffiliateAccount {
  connections: SocialConnection[];
}

interface PlatformConnectProps {
  user: JWTPayload;
  accounts: AccountWithConnections[];
  platforms: readonly string[];
}

const PLATFORM_BADGES: Record<string, { label: string; color: string; bg: string }> = {
  TWITTER: { label: "X", color: "text-sky-700", bg: "bg-sky-100" },
  FACEBOOK: { label: "FB", color: "text-blue-700", bg: "bg-blue-100" },
  INSTAGRAM: { label: "IG", color: "text-pink-700", bg: "bg-pink-100" },
  TIKTOK: { label: "TK", color: "text-slate-700", bg: "bg-slate-100" },
  THREADS: { label: "TH", color: "text-slate-700", bg: "bg-slate-100" },
  PINTEREST: { label: "PIN", color: "text-red-700", bg: "bg-red-100" },
  LINKEDIN: { label: "LI", color: "text-blue-700", bg: "bg-blue-100" },
  YOUTUBE: { label: "YT", color: "text-red-700", bg: "bg-red-100" },
  REDDIT: { label: "RD", color: "text-orange-700", bg: "bg-orange-100" },
  DISCORD: { label: "DC", color: "text-indigo-700", bg: "bg-indigo-100" },
  SLACK: { label: "SL", color: "text-emerald-700", bg: "bg-emerald-100" },
  MASTODON: { label: "MS", color: "text-purple-700", bg: "bg-purple-100" },
  BLUESKY: { label: "BS", color: "text-sky-700", bg: "bg-sky-100" },
  GOOGLE_BUSINESS: { label: "GB", color: "text-blue-700", bg: "bg-blue-100" },
  SNAPCHAT: { label: "SC", color: "text-amber-700", bg: "bg-amber-100" },
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
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 class="text-sm font-semibold text-slate-700 mb-3">Cookie Platform</h3>
            <div class="flex items-end gap-3 mb-3">
              <div class="flex-1">
                <label class="block text-xs text-slate-500 mb-1">Platform</label>
                <select id="platformSelect" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {platforms.map((p) => (
                    <option value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>
                  ))}
                </select>
              </div>
            </div>
            <textarea
              id="cookieInput"
              placeholder={`Paste cookies here (JSON or header string)...\n\nJSON: [{"name":"auth_token","value":"abc123","domain":".twitter.com"}]\nHeader: auth_token=abc123; twid=u%3D123; ct0=456...`}
              class="w-full h-24 px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div class="mt-3">
              <button
                id="connectBtn"
                class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-xs font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                disabled
              >
                Connect Selected
              </button>
            </div>
          </div>

          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-semibold text-slate-700">Live Log</h3>
              <button id="clearLogsBtn" class="text-xs text-slate-400 hover:text-slate-600 cursor-pointer">Clear</button>
            </div>
            <div id="logs" class="bg-slate-950 rounded-lg p-4 max-h-[400px] overflow-y-auto font-mono text-xs space-y-1 min-h-[150px]">
              <div class="text-slate-500 text-xs">Log akan muncul di sini saat proses berjalan...</div>
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 class="text-sm font-semibold text-slate-700 mb-4">Ringkasan</h3>
            <div class="grid grid-cols-3 gap-3">
              <div class="bg-slate-50 rounded-lg p-3 text-center">
                <div class="text-xl font-bold text-slate-800">{accounts.length}</div>
                <div class="text-[10px] text-slate-500 mt-0.5">Total</div>
              </div>
              <div class="bg-emerald-50 rounded-lg p-3 text-center">
                <div class="text-xl font-bold text-emerald-600" id="connectedCount">{connectedCount}</div>
                <div class="text-[10px] text-emerald-500 mt-0.5">Connected</div>
              </div>
              <div class="bg-amber-50 rounded-lg p-3 text-center">
                <div class="text-xl font-bold text-amber-600" id="selectedCount">0</div>
                <div class="text-[10px] text-amber-500 mt-0.5">Selected</div>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-semibold text-slate-700">Akun Tersedia</h3>
              <label class="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
                <input type="checkbox" id="selectAll" class="rounded border-slate-300" />
                Select All
              </label>
            </div>
            {accounts.length === 0 ? (
              <div class="text-center py-8 text-slate-400 text-sm">
                <div class="text-3xl mb-2">📭</div>
                Belum ada akun yang siap
              </div>
            ) : (
              <div class="space-y-3 max-h-[500px] overflow-y-auto" id="accountList">
                {[...groups.entries()].map(([groupName, groupAccounts]) => (
                  <div class="group-section">
                    <div class="flex items-center gap-2 mb-1.5 px-1">
                      <span class="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{groupName}</span>
                      <span class="text-[10px] text-slate-400">({groupAccounts.length})</span>
                    </div>
                    {groupAccounts.map((acc) => {
                      const connectedPlatforms = acc.connections
                        .filter((c) => c.status === "connected")
                        .map((c) => c.platform);
                      const hasAnyConnection = connectedPlatforms.length > 0;
                      return (
                        <label
                          class={`account-row flex items-center gap-2 rounded-lg border p-2.5 cursor-pointer hover:bg-slate-50 transition ${hasAnyConnection ? "border-emerald-200 bg-emerald-50/50" : "border-slate-200"}`}
                          data-connected={connectedPlatforms.join(",")}
                          data-account-id={String(acc.id)}
                        >
                          <input
                            type="checkbox"
                            class="account-checkbox rounded border-slate-300"
                            value={String(acc.id)}
                          />
                          <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 flex-wrap">
                              <span class="text-sm font-medium text-slate-700 truncate">{acc.name}</span>
                              <span class="account-identity text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-600 font-medium shrink-0 cursor-pointer hover:bg-indigo-200" data-identity-edit={String(acc.id)} title="Click to edit identity">
                                {acc.identity || "+"}
                              </span>
                              {connectedPlatforms.map((p) => {
                                const badge = PLATFORM_BADGES[p] || { label: p.substring(0, 2), color: "text-slate-600", bg: "bg-slate-100" };
                                return (
                                  <span class={`account-badge text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${badge.color} ${badge.bg}`}>
                                    {badge.label}
                                  </span>
                                );
                              })}
                            </div>
                            <div class="text-[10px] text-slate-400 truncate mt-0.5">{acc.email}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <script>{raw(`
        (function() {
          var platformSelect = document.getElementById('platformSelect');
          var connectBtn = document.getElementById('connectBtn');
          var selectAll = document.getElementById('selectAll');
          var logs = document.getElementById('logs');
          var connectedCountEl = document.getElementById('connectedCount');
          var selectedCountEl = document.getElementById('selectedCount');
          var cookieInput = document.getElementById('cookieInput');
          var clearLogsBtn = document.getElementById('clearLogsBtn');

          function getSelectedPlatform() {
            return platformSelect.value;
          }

          function updateSelectedCount() {
            var count = 0;
            var cbs = document.querySelectorAll('.account-checkbox');
            for (var i = 0; i < cbs.length; i++) {
              if (cbs[i].checked) count++;
            }
            selectedCountEl.textContent = count;
            connectBtn.disabled = count === 0;
          }

          function filterByPlatform() {
            var platform = getSelectedPlatform();
            var rows = document.querySelectorAll('.account-row');
            selectAll.checked = false;
            var connectedCount = 0;

            for (var i = 0; i < rows.length; i++) {
              var row = rows[i];
              var connected = (row.getAttribute('data-connected') || '').split(',').filter(Boolean);
              var cb = row.querySelector('.account-checkbox');
              if (!cb) continue;

              var classes = row.classList;
              classes.remove('border-slate-200', 'border-emerald-200', 'bg-emerald-50/50', 'bg-slate-50');

              if (connected.indexOf(platform) !== -1) {
                classes.add('border-emerald-200', 'bg-emerald-50/50');
                cb.checked = true;
                cb.disabled = true;
                connectedCount++;
              } else {
                classes.add('border-slate-200');
                cb.checked = false;
                cb.disabled = false;
              }
            }

            connectedCountEl.textContent = connectedCount;
            updateSelectedCount();
          }

          function toggleSelectAll() {
            var checked = selectAll.checked;
            var cbs = document.querySelectorAll('.account-checkbox');
            for (var i = 0; i < cbs.length; i++) {
              if (!cbs[i].disabled) {
                cbs[i].checked = checked;
              }
            }
            updateSelectedCount();
          }

          function editIdentity(accountId) {
            var badge = document.querySelector('[data-identity-edit="' + accountId + '"]');
            if (!badge) return;
            var current = badge.textContent.trim();
            if (current === '+') current = '';

            var input = document.createElement('input');
            input.type = 'text';
            input.value = current;
            input.className = 'text-[10px] px-1.5 py-0.5 rounded border border-indigo-300 bg-white text-indigo-600 font-medium w-24 outline-none';
            input.placeholder = 'identity';
            input.setAttribute('data-identity-edit', String(accountId));

            input.onblur = function() { saveIdentity(accountId, input.value.trim(), input, badge); };
            input.onkeydown = function(e) {
              if (e.key === 'Enter') { saveIdentity(accountId, input.value.trim(), input, badge); }
              if (e.key === 'Escape') { input.replaceWith(badge); }
            };

            badge.replaceWith(input);
            input.focus();
            input.select();
          }

          function saveIdentity(accountId, value, input, badge) {
            badge.textContent = value || '+';
            input.replaceWith(badge);

            fetch('/platform/connect/identity', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: 'accountId=' + accountId + '&identity=' + encodeURIComponent(value)
            });
          }

          function clearLogs() {
            logs.innerHTML = '<div class="text-slate-500 text-xs">Log akan muncul di sini saat proses berjalan...</div>';
          }

          function startConnect() {
            var platform = getSelectedPlatform();
            var cookies = cookieInput.value.trim();
            if (!cookies) {
              logs.innerHTML = '<div class="text-red-400">Please paste cookies first</div>';
              return;
            }

            var ids = [];
            var cbs = document.querySelectorAll('.account-checkbox');
            for (var i = 0; i < cbs.length; i++) {
              if (cbs[i].checked) ids.push(cbs[i].value);
            }
            if (ids.length === 0) return;

            connectBtn.disabled = true;
            connectBtn.textContent = 'Connecting...';
            logs.innerHTML = '';

            fetch('/platform/connect/stream', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: 'platform=' + encodeURIComponent(platform) + '&accountIds=' + encodeURIComponent(ids.join(',')) + '&cookies=' + encodeURIComponent(cookies)
            }).then(function(res) {
              var reader = res.body.getReader();
              var decoder = new TextDecoder();
              var buffer = '';

              function read() {
                reader.read().then(function(result) {
                  if (result.done) {
                    connectBtn.disabled = false;
                    connectBtn.textContent = 'Connect Selected';
                    var doneMsg = document.createElement('div');
                    doneMsg.className = 'text-slate-400 text-xs pt-2';
                    doneMsg.textContent = '--- Selesai. Refresh halaman untuk update status ---';
                    logs.appendChild(doneMsg);
                    logs.scrollTop = logs.scrollHeight;
                    return;
                  }
                  buffer += decoder.decode(result.value, { stream: true });
                  var lines = buffer.split('\\n');
                  buffer = lines.pop() || '';

                  var lastAccount = '';
                  for (var i = 0; i < lines.length; i++) {
                    var line = lines[i];
                    if (!line.startsWith('data: ')) continue;
                    var event = JSON.parse(line.slice(6));

                    if (event.accountName !== lastAccount) {
                      lastAccount = event.accountName;
                      var header = document.createElement('div');
                      header.className = 'text-cyan-400 font-bold text-xs pt-2 pb-1';
                      header.textContent = '📦 ' + event.accountName;
                      logs.appendChild(header);
                    }

                    var icon = event.status === 'running' ? '⏳' :
                               event.status === 'done' ? '✅' :
                               event.step === 'error' || event.status === 'failed' ? '❌' : '⏳';

                    var color = event.step === 'error' || event.status === 'failed' ? 'text-red-400' :
                                event.status === 'done' ? 'text-emerald-400' :
                                event.step === 'skip' ? 'text-slate-400' :
                                'text-blue-400';

                    var label = {
                      oauth: 'OAuth', connect: 'Connect', skip: 'Skip',
                      error: 'Error', complete: 'Complete'
                    }[event.step] || event.step;

                    var entry = document.createElement('div');
                    entry.className = 'ml-3 ' + color;
                    entry.textContent = icon + ' ' + label;
                    if (event.detail) entry.textContent += ' \u2192 ' + event.detail;
                    logs.appendChild(entry);
                  }

                  logs.scrollTop = logs.scrollHeight;
                  read();
                });
              }
              read();
            }).catch(function(e) {
              connectBtn.disabled = false;
              connectBtn.textContent = 'Connect Selected';
              var err = document.createElement('div');
              err.className = 'text-red-400';
              err.textContent = 'Error: ' + e.message;
              logs.appendChild(err);
            });
          }

          // Event listeners
          platformSelect.addEventListener('change', filterByPlatform);

          document.addEventListener('change', function(e) {
            if (e.target && e.target.classList.contains('account-checkbox')) {
              updateSelectedCount();
            }
          });

          document.addEventListener('click', function(e) {
            var row = e.target.closest('.account-row');
            if (row && !e.target.hasAttribute('data-identity-edit')) {
              setTimeout(updateSelectedCount, 50);
            }
          });

          selectAll.addEventListener('change', toggleSelectAll);

          document.addEventListener('click', function(e) {
            var target = e.target;
            if (target && target.hasAttribute('data-identity-edit')) {
              e.preventDefault();
              e.stopPropagation();
              editIdentity(parseInt(target.getAttribute('data-identity-edit')));
            }
          });

          clearLogsBtn.addEventListener('click', clearLogs);
          connectBtn.addEventListener('click', startConnect);

          // Initial filter
          filterByPlatform();
        })();
      `)}</script>
    </Layout>
  );
};

export default PlatformConnectPage;