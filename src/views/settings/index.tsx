import type { FC } from "hono/jsx";
import { raw } from "hono/html";
import Layout from "../../components/layout";
import type { AuthUser } from "../../middleware/auth";

interface JadiapaConfigData {
  email: string;
  balance: string;
  usageImages: number;
  usageVideos: number;
  lastChecked: string;
}

interface SettingsProps {
  user: AuthUser;
  jadiapaConnected: boolean;
  jadiapaEmail: string;
  jadiapa: JadiapaConfigData;
  autoPostActive: boolean;
  autoGenerateActive: boolean;
  error?: string;
  success?: string;
}

const PRIME_TIME_DEFAULT: Record<string, { start: string; end: string; days: string }> = {
  FACEBOOK: { start: "12:00", end: "20:00", days: "Selasa, Rabu" },
  INSTAGRAM: { start: "12:00", end: "21:00", days: "Selasa, Rabu" },
  TWITTER: { start: "12:00", end: "18:00", days: "Selasa - Kamis" },
  TIKTOK: { start: "13:00", end: "20:00", days: "Rabu, Kamis" },
  THREADS: { start: "12:00", end: "18:00", days: "Selasa - Kamis" },
  PINTEREST: { start: "10:00", end: "13:00", days: "Selasa - Kamis" },
};

const SettingsPage: FC<SettingsProps> = ({ user, jadiapaConnected, jadiapaEmail, jadiapa, autoPostActive, autoGenerateActive, error, success }) => {
  return (
    <Layout user={user} title="Settings" currentPath="/settings" autoPostActive={autoPostActive} autoGenerateActive={autoGenerateActive}>
      {error && (
        <div class="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
      )}
      {success && (
        <div class="mb-4 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm">{success}</div>
      )}

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* jadiapa.com Auth */}
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-slate-800">jadiapa.com Auth</h2>
            <span class={`px-2 py-0.5 rounded-full text-[10px] font-medium ${jadiapaConnected ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
              {jadiapaConnected ? "Connected" : "Not Connected"}
            </span>
          </div>
          <form method="post" action="/settings/jadiapa-auth" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Email jadiapa.com</label>
              <input
                name="email"
                type="email"
                value={jadiapaEmail}
                placeholder="email@jadiapa.com"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Password jadiapa.com</label>
              <input
                name="password"
                type="password"
                placeholder="********"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg cursor-pointer transition"
            >
              {jadiapaConnected ? "Update Auth" : "Connect"}
            </button>
          </form>

          {/* Saldo */}
          <div class="mt-6 pt-6 border-t border-slate-200">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-semibold text-slate-700">Saldo & Pemakaian</h3>
              <button id="refreshBalanceBtn" class="text-xs text-blue-600 hover:text-blue-800 cursor-pointer">
                Refresh
              </button>
            </div>
            <div class="grid grid-cols-3 gap-3">
              <div class="bg-slate-50 rounded-lg p-3 text-center">
                <div class="text-lg font-bold text-slate-800">{jadiapa.balance}</div>
                <div class="text-[10px] text-slate-500">Saldo</div>
              </div>
              <div class="bg-slate-50 rounded-lg p-3 text-center">
                <div class="text-lg font-bold text-blue-600">{jadiapa.usageImages}</div>
                <div class="text-[10px] text-slate-500">Gambar</div>
              </div>
              <div class="bg-slate-50 rounded-lg p-3 text-center">
                <div class="text-lg font-bold text-purple-600">{jadiapa.usageVideos}</div>
                <div class="text-[10px] text-slate-500">Video</div>
              </div>
            </div>
            <div class="text-[10px] text-slate-400 mt-2 text-center">
              Terakhir cek: {jadiapa.lastChecked}
            </div>

            <p class="text-[10px] text-amber-600 mt-3">
              Top-up dilakukan manual di jadiapa.com (integrasi scraping top-up coming soon).
            </p>
          </div>
        </div>

        {/* Automation Guide */}
        <div class="space-y-4">
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 class="text-lg font-semibold text-slate-800 mb-2">Otomasi per Grup</h2>
            <p class="text-xs text-slate-500 mb-4">
              Auto post & auto generate diatur <span class="font-medium text-slate-700">per grup Bundle Social</span>,
              karena setiap grup punya niche berbeda dan mode manual/auto ditentukan sendiri oleh user.
            </p>
            <div class="space-y-3">
              <a href="/post" class="block border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition cursor-pointer">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm font-medium text-slate-700">Auto Post per Grup</span>
                  <span class={`px-2 py-0.5 rounded-full text-[10px] font-medium ${autoPostActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {autoPostActive ? "Aktif" : "Non-aktif"}
                  </span>
                </div>
                <p class="text-xs text-slate-500">Atur niche, jumlah post/hari, jam mulai, dan mode manual/auto.</p>
              </a>
              <a href="/generate" class="block border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition cursor-pointer">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm font-medium text-slate-700">Auto Generate (Scraping News)</span>
                  <span class={`px-2 py-0.5 rounded-full text-[10px] font-medium ${autoGenerateActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {autoGenerateActive ? "Aktif" : "Non-aktif"}
                  </span>
                </div>
                <p class="text-xs text-slate-500">Generasi konten otomatis dari berita per grup.</p>
              </a>
            </div>
          </div>

          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 class="text-sm font-semibold text-slate-700 mb-2">Cara Kerja</h3>
            <ol class="list-decimal list-inside text-xs text-slate-500 space-y-1">
              <li>Aktifkan auto post di halaman <span class="font-medium">Management Post</span></li>
              <li>Isi niche & jadwal untuk tiap grup</li>
              <li>Aktifkan auto generate untuk jalur scraping news</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Prime Time Reference */}
      <div class="mt-6 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 class="text-lg font-semibold text-slate-800 mb-4">Default Prime Time (Blueprint)</h2>
        <p class="text-xs text-slate-500 mb-4">Data berdasarkan riset Sprout Social 2026 — 2 miliar engagement dari 307.000 profil. Waktu dalam Local Time.</p>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 border-b border-slate-200">
              <tr>
                <th class="text-left px-4 py-2 text-slate-600 font-medium">Platform</th>
                <th class="text-left px-4 py-2 text-slate-600 font-medium">Waktu Terbaik</th>
                <th class="text-left px-4 py-2 text-slate-600 font-medium">Hari Terbaik</th>
                <th class="text-left px-4 py-2 text-slate-600 font-medium">Hari Terburuk</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              {Object.entries(PRIME_TIME_DEFAULT).map(([platform, data]) => (
                <tr>
                  <td class="px-4 py-2 font-medium text-slate-700">{platform}</td>
                  <td class="px-4 py-2 text-slate-600">{data.start} - {data.end}</td>
                  <td class="px-4 py-2 text-slate-600">{data.days}</td>
                  <td class="px-4 py-2 text-red-500">Akhir pekan</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p class="text-[10px] text-slate-400 mt-3">Hari Minggu adalah hari terburuk di semua platform. Threads untuk sementara mengikuti pola Instagram.</p>
      </div>

      <script>{raw(`
        document.getElementById('refreshBalanceBtn').addEventListener('click', function() {
          var btn = this;
          btn.textContent = 'Refreshing...';
          btn.disabled = true;
          fetch('/api/jadiapa/balance')
            .then(function(r) { return r.json(); })
            .then(function() {
              btn.textContent = 'Refresh';
              btn.disabled = false;
              location.reload();
            })
            .catch(function() {
              btn.textContent = 'Refresh';
              btn.disabled = false;
            });
        });
      `)}</script>
    </Layout>
  );
};

export default SettingsPage;
