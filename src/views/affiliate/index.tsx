import type { FC } from "hono/jsx";
import { raw } from "hono/html";
import Layout from "../../components/layout";
import type { AuthUser } from "../../middleware/auth";
import type { AffiliateAccount } from "../../lib/db";

interface CreateBunsosProps {
  user: AuthUser;
  accounts: AffiliateAccount[];
}

const CreateBunsosPage: FC<CreateBunsosProps> = ({ user, accounts }) => {
  const doneCount = accounts.filter((a) => a.status === "done").length;
  const totalCount = accounts.length;

  return (
    <Layout user={user} title="Auto Create Bunsoc" currentPath="/create-bunsos">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Generate + Logs */}
        <div class="lg:col-span-2 space-y-6">
          {/* Controls */}
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div class="flex items-end gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Jumlah Akun</label>
                <select id="countSelect" class="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Identitas Akun</label>
                <input
                  id="identityInput"
                  type="text"
                  placeholder="e.g. Furniture, Fashion"
                  class="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
                />
              </div>
              <button
                id="generateBtn"
                onclick="startBatch()"
                class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Generate
              </button>
              <span id="jobStatus" class="text-amber-500 text-xs hidden">Proses sedang berjalan...</span>
            </div>
          </div>

          {/* Progress */}
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-semibold text-slate-700">Progress</h3>
              <span id="progressPercent" class="text-2xl font-bold text-blue-600">0%</span>
            </div>
            <div class="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
              <div id="progressBar" class="h-full w-0 rounded-full bg-blue-600 transition-all duration-300"></div>
            </div>
            <div class="flex items-center justify-between gap-4 mt-3 text-xs">
              <span id="progressStatus" class="text-slate-500">Siap memulai</span>
              <span id="progressAccount" class="text-slate-400 truncate"></span>
            </div>
            <div id="progressError" class="hidden mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600"></div>
          </div>
        </div>

        {/* Right: Account List */}
        <div class="space-y-4">
          {/* Summary Card */}
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 class="text-sm font-semibold text-slate-700 mb-4">Ringkasan Akun</h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-slate-50 rounded-lg p-4 text-center">
                <div id="totalCount" class="text-2xl font-bold text-slate-800">{totalCount}</div>
                <div class="text-xs text-slate-500 mt-1">Total Dibuat</div>
              </div>
              <div class="bg-emerald-50 rounded-lg p-4 text-center">
                <div id="doneCount" class="text-2xl font-bold text-emerald-600">{doneCount}</div>
                <div class="text-xs text-emerald-500 mt-1">Siap Digunakan</div>
              </div>
            </div>
          </div>

          {/* Account List */}
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 class="text-sm font-semibold text-slate-700 mb-4">Daftar Akun</h3>
            <div id="accountList">
              {totalCount === 0 ? (
                <div class="empty-state">
                  <div class="empty-state-icon">📭</div>
                  <p class="empty-state-text">Belum ada akun yang dibuat</p>
                  <p class="text-xs text-slate-400 mb-4">Generate akun Bunsocial otomatis dengan form di atas</p>
                </div>
              ) : (
                <div class="space-y-2 max-h-[500px] overflow-y-auto">
                  {accounts.map((acc) => (
                    <div class={`rounded-lg border p-3 ${acc.status === "done" ? "border-emerald-200 bg-emerald-50/50" : "border-slate-200 bg-slate-50"}`}>
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2 min-w-0">
                          <span class={`shrink-0 ${acc.status === "done" ? "text-emerald-500" : acc.status === "failed" ? "text-red-400" : "text-amber-400"}`}>
                            {acc.status === "done" ? "✅" : acc.status === "failed" ? "❌" : "⏳"}
                          </span>
                          <span class="text-sm font-medium text-slate-700 truncate">{acc.email}</span>
                          {acc.identity && (
                            <span class="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-600 font-medium shrink-0">{acc.identity}</span>
                          )}
                        </div>
                        <span class={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ml-2 ${
                          acc.status === "done" ? "bg-emerald-100 text-emerald-700" :
                          acc.status === "failed" ? "bg-red-100 text-red-700" :
                          "bg-amber-100 text-amber-700"
                        }`}>
                          {acc.status === "done" ? "Siap" : acc.status === "failed" ? "Gagal" : "Proses"}
                        </span>
</div>
                      {acc.password && acc.status === "done" && (
                        <div class="mt-1 text-xs text-slate-500 font-mono flex items-center gap-1">
                          <span>Pass: ********</span>
                          <button onclick="navigator.clipboard.writeText('{acc.password}');showToast('success','Sukses','Password disalin')" class="text-[10px] text-blue-500 hover:text-blue-700 cursor-pointer">Copy</button>
                        </div>
                      )}
                      {acc.api_key && acc.status === "done" && (
                        <div class="mt-2 flex flex-wrap gap-1 text-[10px]">
                          <span class="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded flex items-center gap-1">
                            Key: {acc.api_key.substring(0, 12)}...
                            <button onclick="navigator.clipboard.writeText('{acc.api_key}');this.textContent='✓' " class="text-blue-500 hover:text-blue-700 cursor-pointer">Copy</button>
                          </span>
                          {acc.team_id && (
                            <span class="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                              Team: {acc.team_id.substring(0, 8)}...
                            </span>
                          )}
                        </div>
                      )}
                      {acc.error && (
                        <div class="mt-2 text-[10px] text-red-500 truncate">{acc.error}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <script>{raw(`
        function updateProgress(percent, statusText, accountText) {
          var bounded = Math.max(0, Math.min(100, Math.round(percent)));
          document.getElementById('progressPercent').textContent = bounded + '%';
          document.getElementById('progressBar').style.width = bounded + '%';
          if (statusText) document.getElementById('progressStatus').textContent = statusText;
          document.getElementById('progressAccount').textContent = accountText || '';
        }

        function renderAccountList(accounts) {
          var container = document.getElementById('accountList');
          var doneCount = 0;
          accounts.forEach(function(a) { if (a.status === 'done') doneCount++; });
          document.getElementById('totalCount').textContent = accounts.length;
          document.getElementById('doneCount').textContent = doneCount;

          if (accounts.length === 0) {
            container.innerHTML = '<div class="text-center py-8 text-slate-400 text-sm"><div class="text-3xl mb-2">📭</div>Belum ada akun yang dibuat</div>';
            return;
          }

          var html = '<div class="space-y-2 max-h-[500px] overflow-y-auto">';
          accounts.forEach(function(acc) {
            var borderClass = acc.status === 'done' ? 'border-emerald-200 bg-emerald-50/50' : acc.status === 'failed' ? 'border-red-200 bg-red-50/50' : 'border-slate-200 bg-slate-50';
            var icon = acc.status === 'done' ? '✅' : acc.status === 'failed' ? '❌' : '⏳';
            var iconColor = acc.status === 'done' ? 'text-emerald-500' : acc.status === 'failed' ? 'text-red-400' : 'text-amber-400';
            var badgeClass = acc.status === 'done' ? 'bg-emerald-100 text-emerald-700' : acc.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700';
            var badgeText = acc.status === 'done' ? 'Siap' : acc.status === 'failed' ? 'Gagal' : 'Proses';

            html += '<div class="rounded-lg border p-3 ' + borderClass + '">';
            html += '<div class="flex items-center justify-between">';
            html += '<div class="flex items-center gap-2 min-w-0">';
            html += '<span class="shrink-0 ' + iconColor + '">' + icon + '</span>';
            html += '<span class="text-sm font-medium text-slate-700 truncate">' + esc(acc.email || acc.name) + '</span>';
            if (acc.identity) {
              html += '<span class="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-600 font-medium shrink-0">' + esc(acc.identity) + '</span>';
            }
            html += '</div>';
            html += '<span class="text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ml-2 ' + badgeClass + '">' + badgeText + '</span>';
            html += '</div>';
            if (acc.password && acc.status === 'done') {
              html += '<div class="mt-1 text-xs text-slate-500 truncate font-mono">Pass: ' + esc(acc.password) + '</div>';
            }
            if (acc.api_key && acc.status === 'done') {
              html += '<div class="mt-2 flex flex-wrap gap-1 text-[10px]">';
              html += '<span class="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">Key: ' + esc(acc.api_key.substring(0, 12)) + '...</span>';
              if (acc.team_id) {
                html += '<span class="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">Team: ' + esc(acc.team_id.substring(0, 8)) + '...</span>';
              }
              html += '</div>';
            }
            if (acc.error) {
              html += '<div class="mt-2 text-[10px] text-red-500 truncate">' + esc(acc.error) + '</div>';
            }
            html += '</div>';
          });
          html += '</div>';
          container.innerHTML = html;
        }

        function esc(value) {
          return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        }

        function refreshAccounts() {
          fetch('/api/affiliate/accounts')
            .then(function(r) { return r.json(); })
            .then(function(data) {
              renderAccountList(data.accounts);
              var btn = document.getElementById('generateBtn');
              var status = document.getElementById('jobStatus');
              if (data.hasActiveJob) {
                btn.disabled = true;
                btn.textContent = 'Generating...';
                status.classList.remove('hidden');
              } else {
                btn.disabled = false;
                btn.textContent = 'Generate';
                status.classList.add('hidden');
              }
            });
        }

        // Check on page load
        refreshAccounts();

        var accountEmails = {};
        var accountHeaders = {};

        function startBatch() {
          var btn = document.getElementById('generateBtn');
          var count = Number(document.getElementById('countSelect').value);
          var logs = document.createElement('div');
          var status = document.getElementById('jobStatus');
          var errorBox = document.getElementById('progressError');
          var stepOrder = ['generate_email', 'signup', 'poll_inbox', 'verify_link', 'get_token', 'setup_profile', 'get_org', 'create_api_key', 'create_team', 'complete'];
          var accountProgress = {};
          var hasError = false;

          function renderBatchProgress(event) {
            var current = accountProgress[event.accountIndex] || 0;
            var stepIndex = stepOrder.indexOf(event.step);
            if (event.step === 'error' || event.step === 'cancelled') {
              current = stepOrder.length;
              hasError = true;
              errorBox.textContent = event.detail || 'Proses gagal';
              errorBox.classList.remove('hidden');
            } else if (stepIndex >= 0) {
              current = Math.max(current, event.status === 'done' ? stepIndex + 1 : stepIndex);
            }
            accountProgress[event.accountIndex] = current;
            var completed = Object.keys(accountProgress).reduce(function(sum, key) { return sum + accountProgress[key]; }, 0);
            var labels = {
              generate_email: 'Membuat email', signup: 'Mendaftarkan akun', poll_inbox: 'Menunggu email verifikasi',
              verify_link: 'Memverifikasi email', get_token: 'Mengambil token', setup_profile: 'Menyiapkan profil',
              get_org: 'Mengambil organisasi', create_api_key: 'Membuat API key', create_team: 'Membuat team',
              complete: 'Akun selesai', error: 'Akun gagal', cancelled: 'Dibatalkan'
            };
            updateProgress((completed / (count * stepOrder.length)) * 100, labels[event.step] || 'Memproses', 'Akun ' + event.accountIndex + ' dari ' + count);
          }

          btn.disabled = true;
          btn.textContent = 'Generating...';
          status.classList.remove('hidden');
          errorBox.classList.add('hidden');
          errorBox.textContent = '';
          updateProgress(0, 'Memulai proses...', '0 dari ' + count);

          fetch('/create-bunsos/stream', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'count=' + count + '&identity=' + encodeURIComponent(document.getElementById('identityInput').value.trim())
          }).then(function(res) {
            if (res.status === 409) {
              btn.disabled = false;
              btn.textContent = 'Generate';
              status.classList.add('hidden');
              errorBox.textContent = 'Proses sebelumnya masih berjalan. Tunggu hingga selesai.';
              errorBox.classList.remove('hidden');
              return;
            }

            var reader = res.body.getReader();
            var decoder = new TextDecoder();
            var buffer = '';

            function read() {
              reader.read().then(function(result) {
                if (result.done) {
                  btn.disabled = false;
                  btn.textContent = 'Generate';
                  status.classList.add('hidden');
                  refreshAccounts();
                  updateProgress(100, hasError ? 'Selesai dengan beberapa kegagalan' : 'Semua akun selesai', count + ' dari ' + count);
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
                  renderBatchProgress(event);

                  // Capture email from generate_email step
                  if (event.step === 'generate_email' && event.status === 'done' && event.detail) {
                    accountEmails[event.accountName] = event.detail;
                    if (accountHeaders[event.accountName]) {
                      accountHeaders[event.accountName].textContent = '📦 ' + event.detail;
                    }
                  }

                  if (event.accountName !== lastAccount) {
                    lastAccount = event.accountName;
                    var header = document.createElement('div');
                    header.className = 'text-cyan-400 font-bold text-xs pt-2 pb-1';
                    var displayEmail = accountEmails[event.accountName] || event.accountName;
                    header.textContent = '📦 ' + displayEmail;
                    accountHeaders[event.accountName] = header;
                    logs.appendChild(header);
                  }

                  var icon = event.status === 'running' ? '⏳' :
                             event.status === 'done' ? '✅' :
                             event.step === 'error' || event.step === 'cancelled' ? '❌' : '⏳';

                  var color = event.step === 'error' || event.step === 'cancelled' ? 'text-red-400' :
                              event.status === 'done' ? 'text-emerald-400' :
                              'text-blue-400';

                  var label = {
                    generate_email: 'Generate Email',
                    signup: 'Signup',
                    poll_inbox: 'Polling Inbox',
                    verify_link: 'Verify Email',
                    get_token: 'Get Token',
                    setup_profile: 'Setup Profile',
                    get_org: 'Get Organization',
                    create_api_key: 'Create API Key',
                    create_team: 'Create Team',
                    complete: 'Complete',
                    cancelled: 'Cancelled',
                    error: 'Error'
                  }[event.step] || event.step;

                  var entry = document.createElement('div');
                  entry.className = 'ml-3 ' + color;
                  entry.textContent = icon + ' ' + label;
                  if (event.detail) {
                    entry.textContent += ' \\u2192 ' + event.detail;
                  }
                  logs.appendChild(entry);

                  // Update account list on complete
                  if (event.step === 'complete') {
                    refreshAccounts();
                  }
                }

                logs.scrollTop = logs.scrollHeight;
                read();
              });
            }
            read();
          }).catch(function(e) {
            btn.disabled = false;
            btn.textContent = 'Generate';
            status.classList.add('hidden');
            hasError = true;
            errorBox.textContent = 'Error: ' + e.message;
            errorBox.classList.remove('hidden');
            document.getElementById('progressStatus').textContent = 'Proses gagal';
          });
        }
      `)}</script>
    </Layout>
  );
};

export default CreateBunsosPage;
