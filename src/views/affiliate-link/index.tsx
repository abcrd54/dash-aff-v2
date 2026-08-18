import type { FC } from "hono/jsx";
import { raw } from "hono/html";
import Layout from "../../components/layout";
import type { AuthUser } from "../../middleware/auth";
import { PLACEMENT_CONFIG } from "../../lib/constants";

interface AffiliateProduct {
  id: number;
  url: string;
  name: string;
  price: string | null;
  description: string | null;
  images: string | null;
  views: number;
  clicks: number;
  commission: string | null;
  placement: string;
  created_at: string;
}

interface AffiliateGroup {
  identity: string;
  accounts: number;
}

interface AffiliateLinkProps {
  user: AuthUser;
  products: AffiliateProduct[];
  groups: AffiliateGroup[];
  error?: string;
}

const AffiliateLinkPage: FC<AffiliateLinkProps> = ({ user, products, groups, error }) => {
  return (
    <Layout user={user} title="Link Affiliate" currentPath="/affiliate-link">
      {error && (
        <div class="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          {/* Input Manual */}
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 class="text-lg font-semibold text-slate-800 mb-4">Input Link Affiliate Manual</h2>
            <form id="manualLinkForm" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">URL Produk Shopee/Tokopedia</label>
                <div class="flex gap-2">
                  <input
                    id="urlInput"
                    type="url"
                    required
                    placeholder="https://shopee.co.id/product/..."
                    class="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    id="scrapeBtn"
                    class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg cursor-pointer transition disabled:opacity-50"
                  >
                    Scrape Produk
                  </button>
                </div>
              </div>
              <div id="scrapeResult" class="hidden border border-blue-200 rounded-lg p-4 bg-blue-50/50">
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <span class="text-xs text-slate-500">Nama Produk</span>
                    <p id="scrapeName" class="text-sm font-medium text-slate-800">-</p>
                  </div>
                  <div>
                    <span class="text-xs text-slate-500">Harga</span>
                    <p id="scrapePrice" class="text-sm font-medium text-slate-800">-</p>
                  </div>
                  <div class="col-span-2">
                    <span class="text-xs text-slate-500">Deskripsi</span>
                    <p id="scrapeDesc" class="text-sm text-slate-600 line-clamp-2">-</p>
                  </div>
                </div>
                <div class="mt-3">
                  <label class="block text-xs text-slate-500 mb-1">Penempatan Link</label>
                  <select id="placementSelect" class="px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="comment">Di Komentar (FB, IG)</option>
                    <option value="caption">Di Caption (X, TikTok, Threads, Pinterest)</option>
                    <option value="both">Keduanya</option>
                  </select>
                </div>
                <button
                  type="button"
                  id="saveProductBtn"
                  disabled
                  class="mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>

          {/* Auto Scrape Affiliate */}
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 opacity-60">
            <div class="flex items-center justify-between mb-2">
              <h2 class="text-lg font-semibold text-slate-800">Auto Scrape Dashboard Affiliate</h2>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700">Coming Soon</span>
            </div>
            <p class="text-xs text-slate-500">Scrape performa dashboard affiliate Shopee otomatis — views, klik, komisi, produk trending. Fitur ini sedang dikembangkan.</p>
          </div>

          {/* Tabel Produk */}
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div class="p-6 border-b border-slate-200">
              <h2 class="text-lg font-semibold text-slate-800">Daftar Produk Affiliate</h2>
            </div>
            <div class="overflow-x-auto">
              {products.length === 0 ? (
<div class="empty-state">
                  <div class="empty-state-icon">🔗</div>
                  <p class="empty-state-text">Belum ada produk affiliate</p>
                  <p class="text-xs text-slate-400">Input URL Shopee/Tokopedia di atas untuk scrape & simpan produk</p>
                </div>
              ) : (
                <table class="w-full text-sm">
                  <thead class="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th class="text-left px-6 py-3 text-slate-600 font-medium">Produk</th>
                      <th class="text-left px-6 py-3 text-slate-600 font-medium">Harga</th>
                      <th class="text-left px-6 py-3 text-slate-600 font-medium">Placement</th>
                      <th class="text-left px-6 py-3 text-slate-600 font-medium">Views</th>
                      <th class="text-left px-6 py-3 text-slate-600 font-medium">Klik</th>
                      <th class="text-right px-6 py-3 text-slate-600 font-medium">Aksi</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    {products.map((p) => {
                      const placement = PLACEMENT_CONFIG[p.placement] || PLACEMENT_CONFIG.comment;
                      const images = (() => { try { return p.images ? JSON.parse(p.images) : []; } catch { return []; } })();
                      return (
                        <tr class="hover:bg-slate-50 transition">
                          <td class="px-6 py-4">
                            <div class="flex items-center gap-3">
                              {images[0] && (
                                <img src={images[0]} alt={p.name} class="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                              )}
                              <div>
                                <p class="font-medium text-slate-800 max-w-[200px] truncate">{p.name}</p>
                                <a href={p.url} target="_blank" class="text-[10px] text-blue-500 hover:underline truncate block max-w-[200px]">{p.url}</a>
                              </div>
                            </div>
                          </td>
                          <td class="px-6 py-4 text-slate-700">{p.price || "-"}</td>
                          <td class="px-6 py-4">
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-100 text-indigo-700">
                              {placement.label}
                            </span>
                          </td>
                          <td class="px-6 py-4 text-slate-600">{p.views}</td>
                          <td class="px-6 py-4">
                            <span class={`px-2 py-0.5 rounded-full text-[10px] font-medium ${p.clicks > 0 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                              {p.clicks}
                            </span>
                          </td>
                          <td class="px-6 py-4 text-right">
                            <button
                              data-delete-id={String(p.id)}
                              class="delete-product-btn text-red-600 hover:text-red-800 text-sm font-medium cursor-pointer"
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Right: Info Panel */}
        <div class="space-y-4">
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 class="text-sm font-semibold text-slate-700 mb-4">Penempatan Link per Platform</h3>
            <div class="space-y-2">
              {Object.entries(PLACEMENT_CONFIG).map(([key, cfg]) => (
                <div class="border border-slate-200 rounded-lg p-3">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-xs font-semibold text-slate-700">{cfg.label}</span>
                    <span class={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${key === "comment" ? "bg-emerald-100 text-emerald-700" : key === "caption" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                      {key === "comment" ? "Default" : ""}
                    </span>
                  </div>
                  <p class="text-[11px] text-slate-500">{cfg.platforms.join(", ")}</p>
                </div>
              ))}
            </div>
          </div>

          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 class="text-sm font-semibold text-slate-700 mb-4">Grup Identitas</h3>
            {groups.length === 0 ? (
              <p class="text-xs text-slate-400">Belum ada grup. Buat akun Bunsoc terlebih dahulu.</p>
            ) : (
              <div class="space-y-2">
                {groups.map((g) => (
                  <div class="flex items-center justify-between border border-slate-200 rounded-lg p-3">
                    <span class="text-sm font-medium text-slate-700">{g.identity}</span>
                    <span class="text-xs text-slate-500">{g.accounts} akun</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <script>{raw(`
        (function() {
          var scrapedData = null;

          document.getElementById('scrapeBtn').addEventListener('click', function() {
            var url = document.getElementById('urlInput').value.trim();
            if (!url) {
              showToast('error', 'Error', 'Masukkan URL produk terlebih dahulu');
              return;
            }

            var btn = document.getElementById('scrapeBtn');
            btn.disabled = true;
            btn.textContent = 'Scraping...';

            var resultDiv = document.getElementById('scrapeResult');
            resultDiv.classList.remove('hidden');

            document.getElementById('scrapeName').textContent = 'Memuat...';
            document.getElementById('scrapePrice').textContent = 'Memuat...';
            document.getElementById('scrapeDesc').textContent = 'Memuat...';

            fetch('/api/affiliate-link/scrape', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url: url })
            })
            .then(function(r) { return r.json(); })
            .then(function(data) {
              btn.disabled = false;
              btn.textContent = 'Scrape Produk';
              if (data.success && data.data) {
                scrapedData = data.data;
                document.getElementById('scrapeName').textContent = data.data.name || '-';
                document.getElementById('scrapePrice').textContent = data.data.price || '-';
                document.getElementById('scrapeDesc').textContent = (data.data.description || '-').substring(0, 200);
                document.getElementById('saveProductBtn').disabled = false;
              } else {
                document.getElementById('scrapeName').textContent = 'Gagal scrape';
                document.getElementById('scrapePrice').textContent = '-';
                document.getElementById('scrapeDesc').textContent = data.error || 'Scraping service belum tersedia.';
              }
            })
            .catch(function(e) {
              btn.disabled = false;
              btn.textContent = 'Scrape Produk';
              document.getElementById('scrapeName').textContent = 'Error';
              document.getElementById('scrapePrice').textContent = '-';
              document.getElementById('scrapeDesc').textContent = 'Gagal terhubung ke scraping service.';
            });
          });

          document.getElementById('saveProductBtn').addEventListener('click', function() {
            var url = document.getElementById('urlInput').value.trim();
            var placement = document.getElementById('placementSelect').value;
            if (!url) return;

            var productData = {
              url: url,
              placement: placement,
              name: scrapedData ? scrapedData.name : '',
              price: scrapedData ? scrapedData.price : '',
              description: scrapedData ? scrapedData.description : '',
              images: scrapedData ? scrapedData.images : [],
            };

            fetch('/api/affiliate-link/add', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(productData)
            })
            .then(function(r) { return r.json(); })
            .then(function(data) {
              if (data.success) {
                showToast('success', 'Sukses', 'Produk berhasil disimpan');
                if (data.data) {
                  var tbody = document.querySelector('.responsive-table tbody');
                  if (tbody) {
                    var emptyRow = tbody.querySelector('tr td[colspan]');
                    if (emptyRow) emptyRow.closest('tr').remove();
                    var img = data.data.images ? (function() { try { var imgs = JSON.parse(data.data.images); return imgs[0] || ''; } catch(e) { return ''; } })() : '';
                    var row = document.createElement('tr');
                    row.innerHTML = '<td data-label="Produk"><div class="font-medium text-slate-800">' + (data.data.name || '') + '</div><div class="text-xs text-slate-400 truncate max-w-[200px] lg:max-w-[400px]">' + (data.data.url || '') + '</div></td>' +
                      '<td data-label="Gambar">' + (img ? '<img src="' + img + '" class="w-10 h-10 rounded object-cover" />' : '-') + '</td>' +
                      '<td data-label="Harga">' + (data.data.price || '-') + '</td>' +
                      '<td data-label="Views">' + (data.data.views || 0) + '</td>' +
                      '<td data-label="Klik">' + (data.data.clicks || 0) + '</td>' +
                      '<td data-label="Aksi"><button data-delete-id="' + data.data.id + '" class="delete-product-btn text-xs text-red-600 hover:text-red-800 cursor-pointer">Hapus</button></td>';
                    tbody.appendChild(row);
                  }
                }
                document.getElementById('scrapeResult').classList.add('hidden');
                document.getElementById('urlInput').value = '';
                scrapedData = null;
                document.getElementById('saveProductBtn').disabled = true;
              } else {
                showToast('error', 'Error', data.error || 'Gagal menyimpan produk');
              }
            })
            .catch(function() {
              showToast('error', 'Error', 'Gagal menyimpan produk');
            });
          });

          document.addEventListener('click', function(e) {
            var btn = e.target.closest('.delete-product-btn');
            if (!btn) return;
            var id = btn.getAttribute('data-delete-id');
            showConfirm('Hapus Produk', 'Yakin hapus produk ini?', function() {
              fetch('/api/affiliate-link/' + id, { method: 'DELETE' })
                .then(function() { location.reload(); });
            });
          });
        })();
      `)}</script>
    </Layout>
  );
};

export default AffiliateLinkPage;