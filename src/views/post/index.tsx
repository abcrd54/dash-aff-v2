import type { FC } from "hono/jsx";
import { raw } from "hono/html";
import Layout from "../../components/layout";
import type { AuthUser } from "../../middleware/auth";
import { PLATFORM_INFO } from "../../lib/constants";

interface PostGroup {
  identity: string;
  accounts: Array<{ id: number; email: string; platforms: string[] }>;
  totalAccounts: number;
  totalPlatforms: number;
  monthlyCapacity: number;
}

interface PostContent {
  id: number;
  caption: string;
  comment: string;
  link: string;
  image: string | null;
  placement: string;
  groupName: string;
  status: string;
  personaName: string | null;
  created_at: string;
}

interface PostPageProps {
  user: AuthUser;
  groups: PostGroup[];
  groupConfigs: Array<{
    identity: string;
    niche: string;
    autoPostEnabled: boolean;
    autoGenerateEnabled: boolean;
    dailyPostCount: number;
    startTime: string;
    useDefaultSchedule: boolean;
  }>;
  posts: PostContent[];
  personas: Array<{ id: string; name: string }>;
  autoPostActive: boolean;
  autoGenerateActive: boolean;
  error?: string;
}

const PostPage: FC<PostPageProps> = ({ user, groups, groupConfigs, posts, personas, autoPostActive, autoGenerateActive, error }) => {
  const totalCapacity = groups.reduce((sum, g) => sum + g.monthlyCapacity, 0);

  return (
    <Layout user={user} title="Management Post" currentPath="/post" autoPostActive={autoPostActive} autoGenerateActive={autoGenerateActive}>
      {error && (
        <div class="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Compose */}
        <div class="lg:col-span-2 space-y-6">
          {/* Compose Post */}
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold text-slate-800">Compose Post</h2>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700"><i class="fa-solid fa-clock mr-1"></i>Auto Post</span>
            </div>
            <form id="composeForm" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Grup Tujuan</label>
                  <select id="groupSelect" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Pilih grup...</option>
                    {groups.map((g) => (
                      <option value={g.identity}>
                        {g.identity} ({g.totalAccounts} akun · {g.monthlyCapacity} post/bln)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Persona AI (opsional)</label>
                  <select id="personaSelect" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Tanpa persona</option>
                    {personas.map((p) => (
                      <option value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Caption</label>
                <textarea
                  id="captionInput"
                  rows={5}
                  placeholder="Tulis caption di sini... atau generate via persona AI"
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div class="flex items-center gap-2 mt-1">
                  <button type="button" id="generateCaptionBtn" class="text-xs text-blue-600 hover:text-blue-800 cursor-pointer">
                    AI Generate Caption
                  </button>
                  <span id="captionCharCount" class="text-xs text-slate-400">0 karakter</span>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Link Affiliate</label>
                <div class="flex gap-2">
                  <input
                    id="linkInput"
                    type="text"
                    placeholder="https://s.shopee.co.id/..."
                    class="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button type="button" id="pickLinkBtn" class="px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-50 cursor-pointer" onclick="openAffiliatePicker()">
                    Pilih
                  </button>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Penempatan Link</label>
                  <select id="placementSelect" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="comment">Di Komentar (FB, IG)</option>
                    <option value="caption">Di Caption (X, TikTok, Threads, Pinterest)</option>
                    <option value="both">Keduanya</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Komentar (untuk placement comment)</label>
                  <input
                    id="commentInput"
                    type="text"
                    placeholder="Komentar dengan link affiliate..."
                    class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Gambar</label>
                <div class="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center opacity-60">
                  <p class="text-xs text-slate-400">Generate gambar via jadiapa.com — Coming Soon</p>
                </div>
              </div>

              <div class="flex items-center gap-3 pt-2">
                <button type="button" id="saveDraftBtn" class="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 cursor-pointer transition">
                  Simpan Draft
                </button>
                <button type="button" id="postNowBtn" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg cursor-pointer transition disabled:opacity-50">
                  Post Sekarang
                </button>
              </div>
            </form>
          </div>

          {/* Saved Posts */}
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div class="p-6 border-b border-slate-200">
              <h2 class="text-lg font-semibold text-slate-800">Post Tersimpan</h2>
            </div>
            {posts.length === 0 ? (
              <div class="empty-state">
                <div class="empty-state-icon"><i class="fa-solid fa-file-pen"></i></div>
                <p class="empty-state-text">Belum ada post. Compose di atas untuk membuat.</p>
              </div>
            ) : (
              <div class="divide-y divide-slate-100">
                {posts.map((p) => (
                  <div class="p-4 hover:bg-slate-50 transition">
                    <div class="flex items-start justify-between">
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                          <span class={`px-2 py-0.5 rounded-full text-[10px] font-medium ${p.status === "draft" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                            {p.status}
                          </span>
                          <span class="text-xs text-slate-500">{p.groupName}</span>
                          {p.personaName && <span class="text-xs text-blue-500">via {p.personaName}</span>}
                        </div>
                        <p class="text-sm text-slate-700 line-clamp-2">{p.caption}</p>
                        <div class="flex items-center gap-2 mt-1">
                          {p.link && <span class="text-[10px] text-blue-500 truncate">{p.link}</span>}
                          <span class="text-[10px] text-slate-400">{p.created_at}</span>
                        </div>
                      </div>
                      <div class="flex items-center gap-1 ml-3">
                        <button data-edit-post={String(p.id)} data-caption={p.caption} data-link={p.link || ""} data-comment={p.comment || ""} data-placement={p.placement || "comment"} data-group={p.groupName || ""} class="edit-post-btn text-xs text-blue-600 hover:text-blue-800 cursor-pointer">Edit</button>
                        <button data-delete-post={String(p.id)} class="delete-post-btn text-xs text-red-600 hover:text-red-800 cursor-pointer">Hapus</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Groups + Schedule */}
        <div class="space-y-4">
          {/* Capacity Info */}
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 class="text-sm font-semibold text-slate-700 mb-4">Kapasitas Posting</h3>
            <div class="text-center mb-4">
              <div class="text-3xl font-bold text-blue-600">{totalCapacity}</div>
              <div class="text-xs text-slate-500 mt-1">Total Post/Bulan</div>
            </div>
            <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div class="h-full bg-blue-500 rounded-full" style={`width: ${posts.length > 0 ? Math.min(100, (posts.length / Math.max(1, totalCapacity)) * 100) : 0}%`} />
            </div>
            <p class="text-xs text-slate-400 mt-2 text-center">{posts.length} dari {totalCapacity} post terpakai</p>
          </div>

          {/* Groups + Auto Post Config */}
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 class="text-sm font-semibold text-slate-700 mb-4">Grup & Auto Post Config</h3>
            {groups.length === 0 ? (
              <p class="text-xs text-slate-400 text-center py-4">Belum ada grup. Buat akun Bunsoc & hubungkan platform.</p>
            ) : (
              <div class="space-y-3">
                {groups.map((g) => {
                  const cfg = groupConfigs.find((c) => c.identity === g.identity);
                  return (
                    <div class="border border-slate-200 rounded-lg p-3">
                      <div class="flex items-center justify-between mb-2">
                        <span class="text-sm font-semibold text-slate-700">{g.identity}</span>
                        <span class="text-[10px] text-slate-500">{g.totalAccounts} akun · {g.monthlyCapacity} post/bln</span>
                      </div>
                      <div class="space-y-1 mb-2">
                        {g.accounts.slice(0, 2).map((acc) => (
                          <div class="flex items-center gap-1.5">
                            <span class="text-[10px] text-slate-500 truncate flex-1">{acc.email}</span>
                            <div class="flex items-center gap-0.5">
                              {acc.platforms.map((pf) => {
                                const info = PLATFORM_INFO[pf] || { label: pf.substring(0, 2), color: "bg-slate-400" };
                                return (
                                  <span class={`${info.color} text-white text-[8px] px-1 py-0.5 rounded-full font-medium`}>
                                    {info.label}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                        {g.accounts.length > 2 && (
                          <div class="text-[10px] text-slate-400">+{g.accounts.length - 2} akun lainnya</div>
                        )}
                      </div>

                      {/* Auto Post Config per Group */}
                      <div class="border-t border-slate-100 pt-2 mt-2">
                        <div class="flex items-center justify-between mb-2">
                          <span class="text-[10px] font-medium text-slate-600">Auto Post</span>
                          <button
                            data-group={g.identity}
                            class={`group-auto-toggle relative w-8 h-4 rounded-full cursor-pointer transition border-2 ${cfg?.autoPostEnabled ? "bg-emerald-500 border-emerald-500" : "bg-slate-300 border-slate-300"}`}
                          >
                            <span class={`absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white shadow transition ${cfg?.autoPostEnabled ? "left-[17px]" : "left-0.5"}`} />
                          </button>
                        </div>
                        {cfg?.autoPostEnabled && (
                          <div class="space-y-1.5">
                            <div class="flex items-center gap-2">
                              <input
                                data-group={g.identity}
                                class="group-niche text-[10px] px-2 py-1 border border-slate-200 rounded flex-1"
                                placeholder="Niche (contoh: otomotif, teknologi)"
                                value={cfg.niche}
                              />
                            </div>
                            <div class="flex items-center gap-2">
                              <input
                                data-group={g.identity}
                                type="number"
                                min="1"
                                max="20"
                                value={String(cfg.dailyPostCount)}
                                class="group-daily-count w-14 text-[10px] px-1 py-0.5 border border-slate-200 rounded text-center"
                              />
                              <span class="text-[10px] text-slate-400">post/hari</span>
                              <input
                                data-group={g.identity}
                                type="time"
                                value={cfg.startTime}
                                class="group-start-time w-20 text-[10px] px-1 py-0.5 border border-slate-200 rounded"
                              />
                              <label class="flex items-center gap-1 text-[10px] text-slate-500">
                                <input
                                  data-group={g.identity}
                                  type="checkbox"
                                  checked={cfg.useDefaultSchedule}
                                  class="group-use-default rounded"
                                />
                                Default
                              </label>
                            </div>
                            <button
                              data-group={g.identity}
                              class="save-auto-config-btn w-full mt-1 px-2 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-medium rounded cursor-pointer transition"
                            >
                              Simpan Config
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Schedule Info */}
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 class="text-sm font-semibold text-slate-700 mb-4">Prime Time Posting</h3>
            <div class="space-y-2">
              {[
                { pf: "Facebook", time: "12:00-20:00", days: "Sel, Rab" },
                { pf: "Instagram", time: "12:00-21:00", days: "Sel, Rab" },
                { pf: "X (Twitter)", time: "12:00-18:00", days: "Sel-Kam" },
                { pf: "TikTok", time: "13:00-20:00", days: "Rab, Kam" },
                { pf: "Threads", time: "12:00-18:00", days: "Sel-Kam" },
                { pf: "Pinterest", time: "10:00-13:00", days: "Sel-Kam" },
              ].map((s) => (
                <div class="flex items-center justify-between text-xs">
                  <span class="text-slate-600">{s.pf}</span>
                  <span class="text-slate-400">{s.time} · {s.days}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <script>{raw(`
        (function() {
          var captionInput = document.getElementById('captionInput');
          var charCount = document.getElementById('captionCharCount');

          if (captionInput) {
            captionInput.addEventListener('input', function() {
              charCount.textContent = captionInput.value.length + ' karakter';
            });
          }

          document.getElementById('generateCaptionBtn').addEventListener('click', function() {
            var personaId = document.getElementById('personaSelect').value;
            var groupName = document.getElementById('groupSelect').value;
            if (!groupName) { showToast('error', 'Error', 'Pilih grup tujuan terlebih dahulu'); return; }
            if (!personaId) { showToast('error', 'Error', 'Pilih Persona AI terlebih dahulu'); return; }
            var topic = prompt('Topik konten:');
            if (!topic) return;
            var btn = this;
            btn.textContent = 'Generating...';
            btn.disabled = true;

            fetch('/api/post/generate-caption', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ personaId: personaId, groupName: groupName, topic: topic, affiliateLink: document.getElementById('linkInput').value.trim() })
            })
            .then(function(r) { return r.json(); })
            .then(function(data) {
              btn.textContent = 'AI Generate Caption';
              btn.disabled = false;
              if (data.caption) {
                document.getElementById('captionInput').value = data.caption;
                charCount.textContent = data.caption.length + ' karakter';
              }
              if (data.comment) {
                document.getElementById('commentInput').value = data.comment;
              }
              if (!data.caption) {
                showToast('error', 'Error', data.error || 'Gagal generate caption');
              }
            })
            .catch(function() {
              btn.textContent = 'AI Generate Caption';
              btn.disabled = false;
              showToast('error', 'Error', 'Gagal generate caption');
            });
          });

          document.getElementById('generateImageBtn')?.addEventListener('click', function() {
            showToast('info', 'Coming Soon', 'Generate gambar via jadiapa.com akan segera tersedia');
          });

          document.getElementById('postNowBtn').addEventListener('click', function() {
            var group = document.getElementById('groupSelect').value;
            if (!group) {
              showToast('error', 'Error', 'Pilih grup tujuan terlebih dahulu');
              return;
            }
            var caption = document.getElementById('captionInput').value.trim();
            if (!caption) {
              showToast('error', 'Error', 'Caption tidak boleh kosong');
              return;
            }
            var btn = this;
            var origText = btn.textContent;
            btn.textContent = 'Mengirim...';
            btn.disabled = true;

            var data = {
              groupName: group,
              caption: caption,
              link: document.getElementById('linkInput').value.trim(),
              comment: document.getElementById('commentInput').value.trim(),
              placement: document.getElementById('placementSelect').value,
            };

            fetch('/api/post/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            })
            .then(function(r) { return r.json(); })
            .then(function(result) {
              btn.textContent = origText;
              btn.disabled = false;
              if (result.success) {
                var ok = result.data.filter(function(r) { return r.success; }).length;
                var fail = result.data.filter(function(r) { return !r.success; }).length;
                if (fail === 0) {
                  showToast('success', 'Sukses', ok + ' akun berhasil diposting ke Bundle Social');
                } else {
                  showToast('warning', 'Sebagian berhasil', ok + ' berhasil, ' + fail + ' gagal. Cek log untuk detail.');
                }
              } else {
                showToast('error', 'Error', result.error || 'Gagal mengirim post');
              }
            })
            .catch(function() {
              btn.textContent = origText;
              btn.disabled = false;
              showToast('error', 'Error', 'Gagal mengirim post');
            });
          });

          document.getElementById('saveDraftBtn').addEventListener('click', function() {
            var group = document.getElementById('groupSelect').value;
            var caption = document.getElementById('captionInput').value.trim();
            if (!caption) {
              showToast('error', 'Error', 'Caption tidak boleh kosong');
              return;
            }
            var data = {
              groupName: group || 'Uncategorized',
              caption: caption,
              comment: document.getElementById('commentInput').value.trim(),
              link: document.getElementById('linkInput').value.trim(),
              placement: document.getElementById('placementSelect').value,
              personaId: document.getElementById('personaSelect').value || null,
            };

            fetch('/api/post/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            })
            .then(function(r) { return r.json(); })
            .then(function(data) {
              if (data.success) {
                showToast('success', 'Sukses', 'Post disimpan sebagai draft');
                setTimeout(function() { location.reload(); }, 500);
              } else {
                showToast('error', 'Error', data.error || 'Gagal menyimpan');
              }
            });
          });

          document.addEventListener('click', function(e) {
            var btn = e.target.closest('.delete-post-btn');
            if (!btn) return;
            var id = btn.getAttribute('data-delete-post');
            showConfirm('Hapus Post', 'Yakin hapus post ini?', function() {
              fetch('/api/post/' + id, { method: 'DELETE' })
                .then(function() { location.reload(); });
            });
          });

          document.querySelectorAll('.group-auto-toggle').forEach(function(toggle) {
            toggle.addEventListener('click', function() {
              var group = this.getAttribute('data-group');
              var parent = this.closest('.border-slate-200');
              var configDiv = parent.querySelector('.border-t');
              var isActive = this.classList.contains('bg-emerald-500');

              if (isActive) {
                this.classList.remove('bg-emerald-500', 'border-emerald-500');
                this.classList.add('bg-slate-300', 'border-slate-300');
                this.querySelector('span').classList.remove('left-[17px]');
                this.querySelector('span').classList.add('left-0.5');
                if (configDiv) configDiv.style.display = 'none';
              } else {
                this.classList.remove('bg-slate-300', 'border-slate-300');
                this.classList.add('bg-emerald-500', 'border-emerald-500');
                this.querySelector('span').classList.remove('left-0.5');
                this.querySelector('span').classList.add('left-[17px]');
                if (configDiv) configDiv.style.display = '';
              }
            });
          });

          document.querySelectorAll('.save-auto-config-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
              var group = this.getAttribute('data-group');
              var parent = this.closest('.border-slate-200');
              var niche = parent.querySelector('.group-niche')?.value || '';
              var dailyCount = parseInt(parent.querySelector('.group-daily-count')?.value) || 5;
              var startTime = parent.querySelector('.group-start-time')?.value || '12:00';
              var useDefault = parent.querySelector('.group-use-default')?.checked || false;
              var autoToggle = parent.querySelector('.group-auto-toggle');
              var autoPostEnabled = autoToggle?.classList.contains('bg-emerald-500') || false;

              var data = {
                identity: group,
                niche: niche,
                autoPostEnabled: autoPostEnabled,
                autoGenerateEnabled: autoPostEnabled,
                dailyPostCount: dailyCount,
                startTime: startTime,
                useDefaultSchedule: useDefault,
              };

              fetch('/api/post/auto-config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
              })
              .then(function(r) { return r.json(); })
              .then(function(data) {
                if (data.success) {
                  showToast('success', 'Sukses', 'Auto post config untuk ' + group + ' tersimpan');
                } else {
                  showToast('error', 'Error', data.error || 'Gagal menyimpan');
                }
              });
            });
          });

          document.querySelectorAll('.edit-post-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
              var caption = this.getAttribute('data-caption') || '';
              var link = this.getAttribute('data-link') || '';
              var comment = this.getAttribute('data-comment') || '';
              var placement = this.getAttribute('data-placement') || 'comment';
              var group = this.getAttribute('data-group') || '';
              document.getElementById('captionInput').value = caption;
              document.getElementById('linkInput').value = link;
              document.getElementById('commentInput').value = comment;
              document.getElementById('placementSelect').value = placement;
              document.getElementById('groupSelect').value = group;
              document.getElementById('captionCharCount').textContent = caption.length + ' karakter';
              window.scrollTo({ top: 0, behavior: 'smooth' });
            });
          });

          window.openAffiliatePicker = function() {
            fetch('/api/affiliate-link/list')
              .then(function(r) { return r.json(); })
              .then(function(data) {
                var products = data.data || [];
                if (products.length === 0) {
                  showToast('info', 'Info', 'Belum ada link affiliate. Tambahkan di halaman Link Affiliate.');
                  return;
                }
                var html = '<div class="space-y-2 max-h-60 overflow-y-auto">';
                products.forEach(function(p) {
                  html += '<button onclick="document.getElementById(\'linkInput\').value=\'' + (p.url || '').replace(/'/g, "\\'") + '\';Swal.close()" class="w-full text-left p-2 hover:bg-slate-50 rounded text-sm border border-slate-200">';
                  html += '<div class="font-medium text-slate-700 truncate">' + (p.name || 'Tanpa nama') + '</div>';
                  html += '<div class="text-xs text-slate-400 truncate">' + (p.url || '') + '</div>';
                  html += '</button>';
                });
                html += '</div>';
                Swal.fire({ title: 'Pilih Link Affiliate', html: html, showConfirmButton: false, width: '480px' });
              });
          };
        })();
      `)}</script>
    </Layout>
  );
};

export default PostPage;
