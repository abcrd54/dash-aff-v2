import type { FC } from "hono/jsx";
import { raw } from "hono/html";
import Layout from "../../components/layout";
import type { AuthUser } from "../../middleware/auth";

interface GroupConfig {
  identity: string;
  niche: string;
  isPersona: boolean;
  autoGenerateEnabled: boolean;
  autoPostEnabled: boolean;
  dailyPostCount: number;
  startTime: string;
}

interface GeneratePageProps {
  user: AuthUser;
  groups: GroupConfig[];
  autoPostActive: boolean;
  autoGenerateActive: boolean;
  error?: string;
  success?: string;
}

const GeneratePage: FC<GeneratePageProps> = ({ user, groups, autoPostActive, autoGenerateActive, error, success }) => {
  const activeGroups = groups.filter((g) => g.autoGenerateEnabled);
  const personaGroups = groups.filter((g) => g.isPersona);
  const personaGroupsJson = JSON.stringify(
    personaGroups.map((g) => ({ identity: g.identity, niche: g.niche }))
  ).replace(/</g, "\\u003c");

  return (
    <Layout user={user} title="Generate Konten" currentPath="/generate" autoPostActive={autoPostActive} autoGenerateActive={autoGenerateActive}>
      {error && (
        <div class="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
      )}
      {success && (
        <div class="mb-4 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm">{success}</div>
      )}

      {/* Status Bar */}
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div class={`rounded-xl border shadow-sm p-4 ${activeGroups.length > 0 ? "bg-emerald-50 border-emerald-200" : "bg-white border-slate-200"}`}>
          <div class="flex items-center gap-2">
            <span class={`w-2 h-2 rounded-full ${activeGroups.length > 0 ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
            <span class="text-sm font-medium text-slate-700">Auto Scrape News</span>
          </div>
          <p class="text-xs text-slate-500 mt-1">
            {activeGroups.length > 0
              ? `${activeGroups.length} grup aktif — ${activeGroups.map((g) => g.identity).join(", ")}`
              : "Non-aktif — aktifkan di Settings per grup"}
          </p>
        </div>
        <div class={`rounded-xl border shadow-sm p-4 ${autoPostActive ? "bg-emerald-50 border-emerald-200" : "bg-white border-slate-200"}`}>
          <div class="flex items-center gap-2">
            <span class={`w-2 h-2 rounded-full ${autoPostActive ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
            <span class="text-sm font-medium text-slate-700">Auto Post</span>
          </div>
          <p class="text-xs text-slate-500 mt-1">
            {autoPostActive ? "Aktif — posting otomatis berjalan" : "Non-aktif — atur di Management Post"}
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Generate by Group */}
        <div class="lg:col-span-2 space-y-6">
          {/* Jalur A: Persona (by group) */}
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div class="flex items-center gap-2 mb-4">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700">Jalur A</span>
              <h2 class="text-lg font-semibold text-slate-800">Generate dari Grup (Persona)</h2>
            </div>
            <p class="text-xs text-slate-500 mb-4">Pilih grup sebagai persona — semua konten digenerate & dikelola di dalam grup tersebut</p>

            {personaGroups.length === 0 ? (
              <div class="empty-state">
                <div class="empty-state-icon">🧑‍💻</div>
                <p class="empty-state-text">Belum ada grup persona</p>
                <p class="text-xs text-slate-400 mb-4">Label grup sebagai persona terlebih dahulu di panel kanan</p>
                <a href="/create-bunsos" class="empty-state-action">Buat Akun Bunsoc</a>
              </div>
            ) : (
              <>
                {/* Step 1: Pilih Grup */}
                <div class="mb-5">
                  <label class="block text-sm font-medium text-slate-700 mb-1.5">Pilih Grup (Persona)</label>
                  <select id="personaGroupSelect" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">— Pilih grup persona —</option>
                    {personaGroups.map((g) => (
                      <option value={g.identity}>{g.identity}{g.niche ? ` (${g.niche})` : ""}</option>
                    ))}
                  </select>
                </div>

                {/* Step 2: Generate + List (inside selected group) */}
                <div id="groupSection" class="hidden">
                  <div class="border border-slate-200 rounded-lg p-4 mb-5 bg-slate-50/50">
                    <div class="flex items-center gap-2 mb-3">
                      <span id="groupSectionTitle" class="text-sm font-semibold text-slate-700"></span>
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-100 text-indigo-700">Persona</span>
                    </div>

                    {/* Generate Content Section */}
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-slate-700 mb-1">Topik / Produk</label>
                        <textarea
                          id="personaTopic"
                          rows={2}
                          placeholder="Topik konten atau paste link produk affiliate..."
                          class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Link Affiliate</label>
                        <input
                          type="url"
                          id="personaLink"
                          placeholder="https://shopee.co.id/..."
                          class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Penempatan Link</label>
                        <select id="personaPlacement" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="comment">Di Komentar</option>
                          <option value="caption">Di Caption</option>
                        </select>
                      </div>
                    </div>
                    <div class="flex gap-2">
                      <button type="button" id="generatePersonaCaptionBtn" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg cursor-pointer transition">
                        Generate Caption
                      </button>
                    </div>
                    <div id="personaResult" class="hidden border border-blue-200 rounded-lg p-4 bg-white mt-3">
                      <div class="flex items-center justify-between mb-2">
                        <span class="text-xs font-medium text-blue-700">Hasil Generate</span>
                        <div class="flex items-center gap-2">
                          <button type="button" id="postPersonaNowBtn" class="text-xs text-emerald-600 hover:text-emerald-800 cursor-pointer font-medium">Post Sekarang</button>
                          <button type="button" id="savePersonaDraftBtn" class="text-xs text-blue-600 hover:text-blue-800 cursor-pointer">Simpan ke Draft</button>
                        </div>
                      </div>
                      <textarea id="personaCaptionResult" rows={3} class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white resize-none" readonly />
                    </div>
                  </div>

                  {/* List Hasil Konten */}
                  <div>
                    <div class="flex items-center justify-between mb-3">
                      <h3 class="text-sm font-semibold text-slate-700">List Hasil Konten</h3>
                      <span class="text-[10px] text-slate-400">draft tersimpan grup ini</span>
                    </div>
                    <div id="contentList" class="space-y-3">
                      <div class="text-xs text-slate-400 text-center py-6" id="contentListEmpty">Belum ada hasil. Generate caption untuk mulai.</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Jalur B: Coming Soon */}
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 opacity-60">
            <div class="flex items-center gap-2 mb-4">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-100 text-purple-700">Jalur B</span>
              <h2 class="text-lg font-semibold text-slate-800">Generate dari News Scraping</h2>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700">Coming Soon</span>
            </div>
            <p class="text-xs text-slate-500">Full otomatis — scrape berita trending → AI generate caption + gambar → auto post. Fitur ini sedang dikembangkan.</p>
          </div>
        </div>

        {/* Right: Group Config Summary */}
        <div class="space-y-4">
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 class="text-sm font-semibold text-slate-700 mb-4">Konfigurasi per Grup</h3>
            {groups.length === 0 ? (
              <p class="text-xs text-slate-400 text-center py-4">Belum ada grup. Buat akun Bunsoc & hubungkan platform.</p>
            ) : (
              <div class="space-y-3">
                {groups.map((g) => (
                  <div class={`border rounded-lg p-3 ${g.isPersona ? "border-indigo-200 bg-indigo-50/40" : "border-slate-200"}`}>
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-sm font-semibold text-slate-700">{g.identity}</span>
                      <div class="flex items-center gap-2">
                        <span class={`w-2 h-2 rounded-full ${g.autoGenerateEnabled ? "bg-emerald-500" : "bg-slate-300"}`} />
                        <span class="text-[10px] text-slate-500">{g.autoGenerateEnabled ? "Auto" : "Manual"}</span>
                      </div>
                    </div>
                    {g.niche && (
                      <div class="text-[10px] text-slate-500 mb-1">Niche: {g.niche}</div>
                    )}
                    <div class="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{g.autoPostEnabled ? `${g.dailyPostCount}/hari · ${g.startTime}` : "Post manual"}</span>
                      <div class="flex items-center gap-2">
                        <label class="flex items-center gap-1 cursor-pointer" title="Label sebagai persona">
                          <input
                            type="checkbox"
                            class="w-3 h-3"
                            checked={g.isPersona}
                            onchange={`togglePersona(${JSON.stringify(g.identity)}, this.checked)`}
                          />
                          <span class="text-[10px]">Persona</span>
                        </label>
                        <a href={`/post?group=${encodeURIComponent(g.identity)}`} class="text-blue-500 hover:underline">Atur</a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <script>{raw(`
        var personaGroups = ${personaGroupsJson};

        function togglePersona(identity, isPersona) {
          fetch('/api/generate/group/persona', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identity: identity, isPersona: isPersona })
          })
          .then(function(r) { return r.json(); })
          .then(function(data) {
            if (data.success) {
              showToast('success', 'Sukses', 'Label persona diperbarui');
              setTimeout(function() { window.location.reload(); }, 600);
            } else {
              showToast('error', 'Error', data.error || 'Gagal update');
            }
          });
        }

        document.getElementById('personaGroupSelect')?.addEventListener('change', function() {
          var group = this.value;
          var section = document.getElementById('groupSection');
          if (!group) {
            section.classList.add('hidden');
            return;
          }
          var found = personaGroups.find(function(g) { return g.identity === group; });
          document.getElementById('groupSectionTitle').textContent = 'Grup: ' + (found && found.niche ? group + ' (' + found.niche + ')' : group);
          section.classList.remove('hidden');
          document.getElementById('personaResult').classList.add('hidden');
          loadContentList(group);
        });

        function contentItemHtml(item) {
          return '<div class="border border-slate-200 rounded-lg p-3 bg-white">'
            + '<p class="text-xs text-slate-700 whitespace-pre-wrap mb-2">' + esc(item.caption) + '</p>'
            + (item.link ? '<p class="text-[10px] text-blue-500 truncate mb-2">' + esc(item.link) + '</p>' : '')
            + '<div class="flex items-center justify-between">'
            + '<span class="text-[10px] text-slate-400">' + esc(item.created_at || '') + ' · ' + esc(item.placement || 'comment') + '</span>'
            + '<div class="flex items-center gap-2">'
            + '<button type="button" onclick="postItem(' + item.id + ')" class="text-[11px] text-emerald-600 hover:text-emerald-800 font-medium cursor-pointer">Post</button>'
            + '<button type="button" onclick="deleteItem(' + item.id + ')" class="text-[11px] text-red-500 hover:text-red-700 cursor-pointer">Hapus</button>'
            + '</div></div></div>';
        }

        function esc(s) {
          return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        }

        function loadContentList(group) {
          var empty = document.getElementById('contentListEmpty');
          var list = document.getElementById('contentList');
          list.querySelectorAll('.content-item').forEach(function(el) { el.remove(); });
          fetch('/api/post/list').then(function(r) { return r.json(); }).then(function(res) {
            var items = (res.data || []).filter(function(p) { return p.group_name === group; });
            if (items.length === 0) {
              empty.classList.remove('hidden');
            } else {
              empty.classList.add('hidden');
              items.forEach(function(item) {
                var div = document.createElement('div');
                div.className = 'content-item';
                div.innerHTML = contentItemHtml(item);
                list.appendChild(div);
              });
            }
          });
        }

        document.getElementById('generatePersonaCaptionBtn')?.addEventListener('click', function() {
          var group = document.getElementById('personaGroupSelect').value;
          var topic = document.getElementById('personaTopic').value.trim();
          if (!group) { showToast('error', 'Error', 'Pilih grup persona terlebih dahulu'); return; }
          if (!topic) { showToast('error', 'Error', 'Isi topik atau link produk'); return; }

          var btn = this;
          btn.textContent = 'Generating...';
          btn.disabled = true;

          fetch('/api/generate/caption', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ groupName: group, topic: topic })
          })
          .then(function(r) { return r.json(); })
          .then(function(data) {
            btn.textContent = 'Generate Caption';
            btn.disabled = false;
            if (data.caption) {
              var resultDiv = document.getElementById('personaResult');
              resultDiv.classList.remove('hidden');
              document.getElementById('personaCaptionResult').value = data.caption;
            } else {
              showToast('error', 'Error', data.error || 'Gagal generate caption');
            }
          })
          .catch(function() {
            btn.textContent = 'Generate Caption';
            btn.disabled = false;
          });
        });

        document.getElementById('savePersonaDraftBtn')?.addEventListener('click', function() {
          var group = document.getElementById('personaGroupSelect').value;
          var caption = document.getElementById('personaCaptionResult').value.trim();
          if (!caption) return;

          var btn = this;
          btn.textContent = 'Menyimpan...';
          btn.disabled = true;

          fetch('/api/post/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              groupName: group || 'Uncategorized',
              caption: caption,
              link: document.getElementById('personaLink').value.trim(),
              placement: document.getElementById('personaPlacement').value,
            })
          })
          .then(function(r) { return r.json(); })
          .then(function(data) {
            btn.textContent = 'Simpan ke Draft';
            btn.disabled = false;
            if (data.success) {
              showToast('success', 'Sukses', 'Konten disimpan ke draft');
              loadContentList(group);
            }
          });
        });

        document.getElementById('postPersonaNowBtn')?.addEventListener('click', function() {
          var group = document.getElementById('personaGroupSelect').value;
          var caption = document.getElementById('personaCaptionResult').value.trim();
          if (!group) { showToast('error', 'Error', 'Pilih grup tujuan terlebih dahulu'); return; }
          if (!caption) return;

          var btn = this;
          var origText = btn.textContent;
          btn.textContent = 'Mengirim...';
          btn.disabled = true;

          var data = {
            groupName: group,
            caption: caption,
            link: document.getElementById('personaLink').value.trim(),
            comment: '',
            placement: document.getElementById('personaPlacement').value,
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
                showToast('success', 'Sukses', ok + ' akun berhasil diposting');
              } else {
                showToast('warning', 'Sebagian', ok + ' berhasil, ' + fail + ' gagal');
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

        function postItem(id) {
          showToast('info', 'Info', 'Post item #' + id + ' akan dipindah ke Management Post');
        }

        function deleteItem(id) {
          showConfirm('Hapus Draft', 'Yakin hapus draft ini?', function() {
            fetch('/api/post/' + id, { method: 'DELETE' }).then(function(r) { return r.json(); }).then(function(d) {
              if (d.success) {
                showToast('success', 'Sukses', 'Draft dihapus');
                loadContentList(document.getElementById('personaGroupSelect').value);
              }
            });
          });
        }
      `)}</script>
    </Layout>
  );
};

export default GeneratePage;
