# Optimization TODO

Tujuan: membuat `dash-aff-v2` lebih ringan dan mudah dirawat tanpa mengurangi fungsi yang sudah berjalan.

## P0 — Baseline dan pengaman regresi

- [x] Tambahkan script standar `check` untuk menjalankan test, build CSS, dan bundle aplikasi.
- [x] Tambahkan smoke test terautentikasi untuk Kumux Mail, Persona, dan KumaVPS tanpa membuat data eksternal.
- [ ] Tambahkan test status job onboarding: mulai, progress, pindah halaman, selesai, dan gagal.
- [x] Catat baseline ukuran bundle, ukuran CSS, jumlah source, dan jumlah dependency.
- [x] Pertahankan dan perluas test otomatis yang sudah ada.

Kriteria selesai:

- Satu perintah dapat memvalidasi aplikasi sebelum commit.
- Baseline performa terdokumentasi dan dapat dibandingkan setelah optimasi.

## P1 — Hapus beban yang tidak dipakai

- [x] Hapus renderer live-log lama di halaman Auto Create Bunsoc; pertahankan progress bar dan polling server.
- [x] Hapus HTMX dari layout karena tidak ada atribut `hx-*` yang digunakan.
- [x] Hapus aturan CSS `.htmx-*` yang tidak lagi digunakan.
- [x] Audit dan hapus field `PLATFORM_INFO.icon` yang tidak digunakan.
- [x] Hapus import, helper, dan variabel browser yang tidak memiliki consumer pada jalur yang diaudit.
- [x] Audit dependency npm aktif.

Kriteria selesai:

- Create Bunsoc tetap berjalan dan progress tetap pulih setelah pindah halaman.
- Tidak ada request browser ke HTMX.
- Test dan bundle lulus.

## P1 — Perketat konfigurasi runtime

- [x] Hapus fallback `dev-key` dari client Kumux Mail dan KumaVPS.
- [ ] Validasi seluruh environment wajib saat startup dengan pesan yang aman dan jelas.
- [ ] Pisahkan validasi environment aplikasi lokal dan environment microservice Docker.
- [ ] Pastikan nilai secret tidak pernah muncul di log, HTML, atau response API.
- [ ] Dokumentasikan proses rotasi `BUNSOCIAL_API_KEY`, `KUMAIL_API_KEY`, dan `PERSONA_SERVICE_API_KEY`.

Kriteria selesai:

- Aplikasi gagal cepat jika konfigurasi penting hilang.
- Tidak ada request yang diam-diam menggunakan credential development.

## P2 — Ringankan frontend

- [ ] Pertimbangkan self-host Font Awesome subset yang hanya berisi ikon terpakai.
- [x] Hapus `logo.png` yang identik dan gunakan `icon-512.png` sebagai satu sumber aset.
- [ ] Optimalkan PNG tanpa mengubah tampilan visual.
- [ ] Pisahkan JavaScript inline besar dari view ke modul browser yang dapat di-cache.
- [ ] Pecah halaman besar: Post, Generate, Platform Connect, Affiliate Link, dan Auto Create Bunsoc.
- [ ] Muat JavaScript hanya pada halaman yang membutuhkannya.
- [x] Migrasikan navigasi Lucide ke Font Awesome dan hapus request script Lucide global.

Kriteria selesai:

- Tidak ada perubahan visual atau alur pengguna.
- Ukuran transfer awal dan jumlah script global berkurang.
- CSP tetap tidak memerlukan `unsafe-eval`.

## P2 — Ringankan backend

- [ ] Satukan pola HTTP client Kumux, KumaVPS, dan Persona tanpa mengubah kontrak endpoint.
- [ ] Terapkan timeout, parsing error, dan redaksi secret secara konsisten pada semua client.
- [ ] Pecah `src/lib/db.ts` berdasarkan domain tanpa mengubah schema SQLite.
- [ ] Hindari query berulang pada halaman daftar akun, grup, koneksi, dan persona.
- [ ] Tambahkan indeks SQLite hanya berdasarkan hasil query-plan, bukan perkiraan.
- [ ] Batasi snapshot job onboarding dan bersihkan state selesai secara deterministik.
- [ ] Pastikan timer cleanup tidak mempertahankan resource yang tidak diperlukan.

Kriteria selesai:

- Respons dan struktur data tetap kompatibel.
- Penggunaan memori idle dan jumlah query per halaman tidak meningkat.

## P2 — Bersihkan struktur project

- [x] Keluarkan scraper yang belum tersedia dari scope TypeScript aplikasi utama.
- [x] Perbaiki `tsconfig.json` agar `bunx tsc --noEmit` lulus untuk source aktif.
- [ ] Tandai fitur yang belum tersedia melalui feature flag, bukan handler placeholder tersebar.
- [ ] Hapus file atau route placeholder hanya jika UI terkait juga dinonaktifkan dengan jelas.
- [ ] Pertahankan dokumentasi untuk Kumux Mail, Persona, dan KumaVPS; biarkan integrasi lain nonaktif.

Kriteria selesai:

- Type-check penuh source aktif lulus.
- Tidak ada code path mati yang ikut bundle produksi.

## P3 — Observability ringan

- [ ] Gunakan structured log ringkas tanpa data pribadi atau secret.
- [ ] Tambahkan request ID saat memanggil microservice dan tampilkan hanya pada error diagnostik.
- [ ] Catat durasi setiap tahap onboarding tanpa menyimpan email mentah.
- [ ] Tambahkan endpoint readiness lokal yang memeriksa konfigurasi, database, Kumux, Persona, dan KumaVPS secara aman.
- [ ] Hindari library observability tambahan sebelum kebutuhan metrik membenarkannya.

## Definition of Done

- [ ] Semua fungsi yang saat ini berjalan tetap tersedia.
- [ ] `bun test` lulus.
- [ ] Build CSS dan bundle aplikasi lulus.
- [ ] Type-check source aktif lulus.
- [ ] Smoke test ketiga service lulus.
- [ ] Navigasi saat onboarding tidak menghentikan job.
- [ ] Tidak ada secret atau data sensitif pada log dan response publik.
- [ ] Perbandingan performa sebelum/sesudah dicatat di pull request atau commit notes.
