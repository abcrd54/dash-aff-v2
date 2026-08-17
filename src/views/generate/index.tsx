import type { FC } from "hono/jsx";
import { raw } from "hono/html";
import Layout from "../../components/layout";
import type { JWTPayload } from "../../middleware/auth";

interface GroupConfig {
  identity: string;
  niche: string;
  autoGenerateEnabled: boolean;
  autoPostEnabled: boolean;
  dailyPostCount: number;
  startTime: string;
}

interface GeneratePageProps {
  user: JWTPayload;
  groups: GroupConfig[];
  personas: Array<{ id: string; name: string }>;
  autoPostActive: boolean;
  autoGenerateActive: boolean;
  error?: string;
  success?: string;
}

const GeneratePage: FC<GeneratePageProps> = ({ user, groups, personas, autoPostActive, autoGenerateActive, error, success }) => {
  const activeGroups = groups.filter((g) => g.autoGenerateEnabled);

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
        {/* Left: Generate Form */}
        <div class="lg:col-span-2 space-y-6">
          {/* Jalur A: Persona */}
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div class="flex items-center gap-2 mb-4">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700">Jalur A</span>
              <h2 class="text-lg font-semibold text-slate-800">Generate dari Persona</h2>
            </div>
            <p class="text-xs text-slate-500 mb-4">Konten dengan sentuhan manusia — AI generate caption sesuai identitas persona + link affiliate</p>

            <form id="personaGenerateForm" class="space-y-4">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Pilih Persona</label>
                  <select id="personaSelect" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Pilih persona...</option>
                    {personas.map((p) => (
                      <option value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Grup Tujuan</label>
                  <select id="personaGroupSelect" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Pilih grup...</option>
                    {groups.map((g) => (
                      <option value={g.identity}>{g.identity}{g.niche ? ` (${g.niche})` : ""}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Topik / Produk</label>
                <textarea
                  id="personaTopic"
                  rows={2}
                  placeholder="Topik konten atau paste link produk affiliate..."
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div class="flex gap-2">
                <button type="button" id="generatePersonaCaptionBtn" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg cursor-pointer transition">
                  Generate Caption
                </button>
                <button type="button" id="generatePersonaImageBtn" class="px-4 py-2 border border-blue-300 text-blue-600 text-sm font-medium rounded-lg cursor-pointer transition hover:bg-blue-50">
                  Generate Gambar
                </button>
              </div>
              <div id="personaResult" class="hidden border border-blue-200 rounded-lg p-4 bg-blue-50/50">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-medium text-blue-700">Hasil Generate</span>
                  <button type="button" id="savePersonaDraftBtn" class="text-xs text-blue-600 hover:text-blue-800 cursor-pointer">Simpan ke Draft</button>
                </div>
                <textarea id="personaCaptionResult" rows={4} class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white" readonly />
              </div>
            </form>
          </div>

          {/* Jalur B: News Scraping */}
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div class="flex items-center gap-2 mb-4">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-100 text-purple-700">Jalur B</span>
              <h2 class="text-lg font-semibold text-slate-800">Generate dari News Scraping</h2>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700">Coming Soon</span>
            </div>
            <p class="text-xs text-slate-500 mb-4">Full otomatis — scrape berita trending → AI generate caption + gambar → auto post</p>

            <div class="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
              <div class="text-3xl mb-2">📰</div>
              <p class="text-sm text-slate-500 mb-1">Scraping News + Auto Generate</p>
              <p class="text-xs text-slate-400">Aktifkan di Settings per grup untuk mulai auto generate dari berita</p>
              <a href="/settings" class="mt-3 inline-block px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-lg cursor-pointer transition">
                Buka Settings
              </a>
            </div>
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
                  <div class="border border-slate-200 rounded-lg p-3">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-sm font-semibold text-slate-700">{g.identity}</span>
                      <div class="flex items-center gap-1">
                        <span class={`w-2 h-2 rounded-full ${g.autoGenerateEnabled ? "bg-emerald-500" : "bg-slate-300"}`} />
                        <span class="text-[10px] text-slate-500">{g.autoGenerateEnabled ? "Auto" : "Manual"}</span>
                      </div>
                    </div>
                    {g.niche && (
                      <div class="text-[10px] text-slate-500 mb-1">Niche: {g.niche}</div>
                    )}
                    <div class="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{g.autoPostEnabled ? `${g.dailyPostCount}/hari · ${g.startTime}` : "Post manual"}</span>
                      <a href={`/post?group=${encodeURIComponent(g.identity)}`} class="text-blue-500 hover:underline">Atur</a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <script>{raw(`
        document.getElementById('generatePersonaCaptionBtn').addEventListener('click', function() {
          var personaId = document.getElementById('personaSelect').value;
          var topic = document.getElementById('personaTopic').value.trim();
          if (!personaId) { showToast('error', 'Error', 'Pilih persona terlebih dahulu'); return; }
          if (!topic) { showToast('error', 'Error', 'Isi topik atau link produk'); return; }

          var btn = this;
          btn.textContent = 'Generating...';
          btn.disabled = true;

          fetch('/api/generate/caption', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ personaId: personaId, topic: topic })
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

        document.getElementById('generatePersonaImageBtn').addEventListener('click', function() {
          showToast('info', 'Coming Soon', 'Generate gambar via jadiapa.com segera tersedia');
        });

        document.getElementById('savePersonaDraftBtn').addEventListener('click', function() {
          var group = document.getElementById('personaGroupSelect').value;
          var caption = document.getElementById('personaCaptionResult').value.trim();
          if (!caption) return;

          fetch('/api/post/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ groupName: group || 'Uncategorized', caption: caption })
          })
          .then(function(r) { return r.json(); })
          .then(function(data) {
            if (data.success) {
              showToast('success', 'Sukses', 'Konten disimpan ke draft');
              document.getElementById('personaResult').classList.add('hidden');
            }
          });
        });
      `)}</script>
    </Layout>
  );
};

export default GeneratePage;