# Blueprint: Dashboard Management Affiliate

## Tujuan Utama

Sistem all-in-one untuk **management post, konten, dan share link affiliate** di social media. Dari membuat akun, menghubungkan platform, generate konten dengan link affiliate, sampai auto posting — semua dalam satu dashboard.


## Gambaran Besar

```
┌──────────────────────────────────────────────────────────────────┐
│              Dashboard Management Affiliate                      │
│                                                                  │
│  [1] Buat Akun     [2] Hubungkan      [3] Generate    [4] Post  │
│      Bunsocial         Platform            Konten + Link          │
│                                           Affiliate              │
│  ─────────────  ─────────────────  ──────────────────  ──────────│
│  Auto generate  OAuth via          DUA JALUR KONTEN:             │
│  akun Bunsocial Bundle Social      ┌───────────────────────────┐ │
│  + API key      (satu pintu buat   │ Akun Persona (sentuhan   │ │
│  + team         semua platform)    │ manusia)                  │ │
│                                    │ AI caption + link aff     │ │
│                                    │ → Generate gambar         │ │
│                                    │ → Auto post               │ │
│                                    ├───────────────────────────┤ │
│                                    │ Akun Scraping (otomatis) │ │
│                                    │ Scrape berita Detik       │ │
│                                    │ → Generate caption        │ │
│                                    │ → Generate gambar         │ │
│                                    │ → Auto post               │ │
│                                    └───────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

---

## Apa itu Bundle Social?

Bundle Social adalah platform agregator social media. Kita **tidak perlu** pakai API masing-masing platform (Facebook API, X API, Instagram API, dll). Cukup hubungkan akun ke Bundle Social, lalu semua posting dilakukan lewat Bundle Social.

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│ Facebook │     │    X     │     │ Instagram│  ...
└────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │
     └────────────────┼────────────────┘
                      │
               ┌──────┴──────┐
               │   Bundle    │  ← Satu pintu untuk semua platform
               │   Social    │
               └──────┬──────┘
                      │
               ┌──────┴──────┐
               │  Dashboard  │
               │  Management │
               └─────────────┘
```

**Batasan:** 1 akun Bunsocial = **maksimal 20 post/bulan** di Bundle Social.

---

## Kenapa Butuh Banyak Akun Bunsocial?

Karena batasan 20 post/bulan, satu "nama akun platform" butuh banyak akun Bunsocial.

```
Nama Akun: Info Dunia
  │
  ├── Bunsocial #1 → 20 post/bulan (FB, IG, X)
  ├── Bunsocial #2 → 20 post/bulan (FB, IG, X)
  ├── Bunsocial #3 → 20 post/bulan (FB, IG, X)
  └── Bunsocial #4 → 20 post/bulan (FB, IG, X)
                Total: 80 post/bulan untuk "Info Dunia"
```

Satu postingan bisa dikirim ke **semua Bunsocial yang terhubung** dalam grup yang sama, sehingga reach-out lebih besar.

---

## Dua Jenis Akun Sosial Media

### A. Akun Persona (Sentuhan Manusia)

Akun yang memiliki identitas seperti orang asli — hobi, kesukaan, kepribadian, gaya bahasa.

```
Contoh:
  Nama Akun: Maya Putri
  Hobi: Naik gunung, fotografi, traveling
  Sifat: Adventurous, ramah, peduli lingkungan
  Gaya: Hangat, santai, pakai bahasa gaul
```

**Alur Konten:**
```
AI Generate Caption (by persona identity)
  → Review & edit manual
  → Generate gambar (coming soon)
  → Review & approve
  → Auto post ke grup (coming soon)
```

**Status:** Caption generation ✅ | Generate gambar 🔜 | Auto post 🔜

---

### B. Akun Scraping (Full Otomatis)

Akun yang kontennya berasal dari scraping berita — semua data sudah disediakan, tidak perlu sentuhan manusia.

```
Contoh:
  Nama Akun: Info Dunia
  Sumber: Detik.com
  Data: Judul, isi berita, gambar, tanggal
```

**Alur Konten:**
```
Scrape berita (Detik, dsb)
  → AI Generate caption (dari isi berita)
  → AI Generate gambar (dari konteks berita)
  → Auto post ke grup (full otomatis)
```

**Status:** 🔜 Coming soon (flow & arsitektur)

---

## AI Generation — jadiapa.com

**jadiapa.com** adalah platform penyedia model AI untuk generate konten. Dashboard Affiliate Manager terhubung langsung ke jadiapa.com untuk semua kebutuhan AI generation.

### Layanan jadiapa.com

| Layanan | Fungsi | Status |
|---------|--------|--------|
| **Generate Gambar** | AI bikin gambar dari prompt | 🔜 Coming |
| **Generate Video** | AI bikin video pendek dari prompt | 🔜 Coming |

### Integrasi Dashboard

Seluruh manajemen jadiapa.com dilakukan dari dalam dashboard — tidak perlu buka jadiapa.com terpisah:

```
┌─────────────────────────────────────────────────────┐
│          Dashboard Affiliate Manager                 │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │  jadiapa.com Panel (dalam dashboard)        │    │
│  │                                             │    │
│  │  💰 Saldo: Rp 150.000                       │    │
│  │  📊 Pemakaian: 45 gambar, 3 video           │    │
│  │  🔄 Top Up: [nominal] → [Bayar]             │    │
│  │                                             │    │
│  │  Generate Gambar:    [prompt] → [Generate]  │    │
│  │  Generate Video:     [prompt] → [Generate]  │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

### Scraping jadiapa.com

Untuk menampilkan data real-time di dashboard, perlu scraping halaman jadiapa.com:

| Data yang Discrape | Fungsi |
|-------------------|--------|
| **Saldo** | Tampilkan sisa saldo di dashboard |
| **Riwayat pemakaian** | Lacak berapa gambar/video sudah digenerate |
| **Harga per generate** | Hitung biaya sebelum generate |
| **Status top up** | Konfirmasi pembayaran masuk |

> Semua scraping jadiapa.com dilakukan di backend, user hanya lihat hasilnya di dashboard.

### Flow Generate dengan jadiapa.com

```
User input prompt
  │
  ▼
Cek saldo jadiapa.com (scrape)
  ├── Saldo cukup → lanjut
  └── Saldo kurang → tampilkan opsi top up
  │
  ▼
Submit generate ke jadiapa.com
  │
  ▼
Tunggu hasil (polling/scrape)
  │
  ▼
Hasil generate → tampilkan di dashboard
  │
  ▼
Update saldo (scrape ulang)
```

---

## Link Affiliate — Jantung Sistem

Setiap konten yang diposting harus mengandung **link affiliate** (Shopee, Tokopedia, dll). Link affiliate adalah sumber monetisasi — setiap klik dan pembelian lewat link menghasilkan komisi.

### Dua Cara Input Link Affiliate

#### 1. Manual

```
User input link Shopee/Tokopedia secara manual
  → Scrape data produk (nama, harga, deskripsi, gambar)
  → AI generate caption yang menyesuaikan dengan produk
  → Cocok untuk: produk spesifik, campaign tertentu
```

#### 2. Otomatis (Scraping Dashboard Affiliate)

```
Backend scraping dashboard affiliate Shopee
  → Ambil data performa:
      • Views produk
      • Klik affiliate
      • Produk trending
      • Komisi per produk
  → Pilih produk terbaik otomatis
  → Scrape data produk terpilih
  → Generate link affiliate
  → AI generate caption
  → Cocok untuk: full otomatis, volume tinggi
```

### Dua Jenis Scraping Shopee

| Jenis Scraping | Sumber | Data yang Diambil | Fungsi |
|---------------|--------|-------------------|--------|
| **Scraping Produk** | Halaman produk Shopee | Nama, harga, deskripsi, gambar, varian | Bantu AI generate caption yang sesuai produk |
| **Scraping Dashboard Affiliate** | Dashboard affiliate Shopee | Views, klik, komisi, produk trending | Pilih produk terbaik untuk dipromosikan |

> Keduanya dibutuhkan. Scraping produk dipakai untuk **semua jalur** (manual & otomatis). Scraping dashboard affiliate hanya untuk **jalur otomatis**.

### Penempatan Link Affiliate

```
┌──────────────────────────────────────────────────┐
│  Opsi A: Link di Caption                         │
│                                                  │
│  "Sepatu hiking ini nyaman banget! 🏔️           │
│   Cek di sini: https://s.shopee.co.id/xxx"      │
│                                                  │
│  Cocok untuk: X, Threads, TikTok, Pinterest      │
├──────────────────────────────────────────────────┤
│  Opsi B: Link di Komentar                        │
│                                                  │
│  Caption:                                        │
│  "Sepatu hiking ini nyaman banget! 🏔️           │
│   Cocok buat pemula, ringan dan grip-nya mantap" │
│                                                  │
│  ─── konten natural, TANPA sebut "link di bio"  │
│      atau "cek komentar" ───                     │
│                                                  │
│  Komentar:                                       │
│  "Yang mau sepatu hiking berkualitas             │
│   https://s.shopee.co.id/xxx"                    │
│                                                  │
│  Cocok untuk: FB, Instagram                      │
│  Kelebihan: caption tetap natural,               │
│             tidak kena penalti algoritma          │
└──────────────────────────────────────────────────┘
```

| Platform | Link di Caption | Link di Komentar |
|----------|:---:|:---:|
| Facebook | ❌ Reach turun | ✅ Aman |
| Instagram | ❌ Reach turun | ✅ Aman |
| X (Twitter) | ✅ Normal | ✅ Bisa |
| TikTok | ✅ Normal | ✅ Bisa |
| Threads | ✅ Normal | ✅ Bisa |
| Pinterest | ✅ Normal | ✅ Bisa |

**Default sistem:** Link di komentar (lebih aman). Bisa dikonfigurasi per platform.

### Flow Scraping Dashboard Affiliate

```
┌─────────────────────────────────────────────┐
│         Dashboard Affiliate (Shopee)         │
│                                             │
│  Data yang diambil:                         │
│  ┌──────────┐ ┌──────────┐ ┌─────────────┐ │
│  │  Views   │ │  Klik    │ │ Trending     │ │
│  │  Produk  │ │ Affiliate│ │ Produk       │ │
│  └──────────┘ └──────────┘ └─────────────┘ │
│                                             │
│  ┌──────────┐ ┌──────────┐ ┌─────────────┐ │
│  │ Komisi   │ │ Harga    │ │ Stok         │ │
│  │ per item │ │ Produk   │ │ Produk       │ │
│  └──────────┘ └──────────┘ └─────────────┘ │
└────────────────────┬────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────┐
│          AI Seleksi Produk Terbaik           │
│                                             │
│  Filter: views tertinggi, trending,          │
│          komisi optimal, relevan niche       │
│                                             │
│  Output: link affiliate produk terpilih      │
└────────────────────┬────────────────────────┘
                     │
                     ▼
              Sisipkan ke konten
              (caption + gambar)
```

Dengan scraping dashboard affiliate, kita bisa melihat **produk apa yang lagi trending di Shopee** secara real-time dan otomatis memilih produk terbaik untuk dipromosikan.

---

## Alur Utama

### 1. Buat Akun Bunsocial

```
Input: Jumlah akun + Nama akun platform (Info Dunia, Info Bisnis, dll)

Proses otomatis:
  Generate email disposable
  → Register akun Bunsocial
  → Verifikasi email
  → Setup profil + organisasi
  → Generate API key
  → Buat team di Bundle Social

Output: Akun Bunsocial siap pakai dengan API key + team ID
```

### 2. Hubungkan Platform Social Media

```
Input: Akun Bunsocial (dari step 1)

Proses via Bundle Social:
  Pilih platform (FB, IG, X, TikTok, Threads, Pinterest)
  → Buka OAuth di Bundle Social
  → User login & izinkan akses
  → Pilih Page/Channel (untuk FB, IG, dll)
  → Verifikasi koneksi

Output: Akun Bunsocial terhubung ke platform via Bundle Social
```

### 3. Generate Konten — Jalur A: Akun Persona

```
Input: Persona + Topik + Link Affiliate

Proses:
  Pilih link affiliate (manual / otomatis dari scraping)
  → AI generate caption sesuai identitas persona
    (hobi, gaya bahasa, niche, dengan sisipan link affiliate)
  → User review & edit caption
  → (coming soon) AI generate gambar
  → (coming soon) User review & approve

Output: Konten siap posting (caption + link affiliate + gambar)
```

### 4. Generate Konten — Jalur B: Akun Scraping

```
Input: Niche + Sumber berita (Detik, dsb) + Link Affiliate

Proses:
  Scrape artikel trending dari sumber berita
  → Scrape dashboard affiliate (produk trending sesuai niche)
  → AI generate caption dari isi artikel + link affiliate
  → AI generate gambar dari konteks berita + produk
  → Semua otomatis tanpa review manual

Output: Konten siap posting (caption + link affiliate + gambar)
```

### 5. Auto Post

```
Input: Nama akun platform + Konten (dari Jalur A atau B)

Proses:
  Pilih nama akun (Info Dunia, Info Bisnis, dll)
  → Semua Bunsocial dalam grup otomatis terpilih
  → Pilih konten yang sudah digenerate
  → Post ke semua Bunsocial dalam grup via Bundle Social
  → Bundle Social distribusikan ke semua platform terhubung

Output: Konten terposting ke semua platform dalam grup
```

### 6. Schedule Posting *(coming soon)*

```
Input: Konten + Jadwal (default otomatis, bisa kustom)

Proses:
  Sistem tentukan jadwal optimal per platform
  → Posting otomatis sesuai jadwal
  → Hindari posting bersamaan (delay 1-5 menit antar akun)
  → Bisa override manual
```

#### Prime Time per Platform

> Data berdasarkan riset Sprout Social 2026 — analisis **2 miliar engagement** dari 307.000 profil. Waktu dalam Local Time.

| Platform | Waktu Terbaik | Hari Terbaik | Hari Terburuk |
|----------|:------------:|:------------:|:------------:|
| Facebook | 12:00 - 20:00 | Selasa, Rabu | Akhir pekan |
| Instagram | 12:00 - 21:00 | Selasa, Rabu | Akhir pekan |
| X (Twitter) | 12:00 - 18:00 | Selasa - Kamis | Akhir pekan |
| TikTok | 13:00 - 20:00 | Rabu, Kamis | Akhir pekan |
| Threads | 12:00 - 18:00 | Selasa - Kamis | Akhir pekan |
| Pinterest | 10:00 - 13:00 | Selasa - Kamis | Akhir pekan |

> **Catatan:** Threads belum ada data spesifik, untuk sementara mengikuti pola Instagram. Hari Minggu adalah hari terburuk di semua platform.

### 7. Auto Retry Produk Bagus *(coming soon)*

```
Input: Data performa dari dashboard affiliate

Proses:
  Analisis views & klik per produk
  → Produk dengan views tinggi → auto repost
  → Produk sepi → berhenti
  → Interval repost: setiap X hari

Output: Produk best-performing terus dipromosikan
```

---

## Konsep Grup (by Nama Akun Platform)

Akun dikelompokkan berdasarkan **nama akun platform**, bukan kategori.

```
Info Dunia
  ├── Bunsocial #1 → FB ✅, IG ✅, X ✅
  ├── Bunsocial #2 → FB ✅, IG ✅, TikTok ✅
  ├── Bunsocial #3 → FB ✅, IG ✅, Pinterest ✅
  └── Bunsocial #4 → FB ✅, X ✅, Threads ✅
          Total: 80 post/bulan via 4 akun Bunsocial

Info Bisnis
  ├── Bunsocial #5 → FB ✅, IG ✅, X ✅
  └── Bunsocial #6 → FB ✅, TikTok ✅
          Total: 40 post/bulan via 2 akun Bunsocial

Info Otomotif
  └── Bunsocial #7 → FB ✅, IG ✅, TikTok ✅
          Total: 20 post/bulan via 1 akun Bunsocial
```

Satu postingan dikirim ke **semua Bunsocial** dalam grup yang sama secara bersamaan via Bundle Social.

---

## Arsitektur Layanan

```
Dashboard (Port 4000)
  │
  ├── aff-personal (Port 3000)   → AI Personas, Chat, LLM
  ├── Kumux Mail (Port 3010)     → Disposable Email
  ├── Bunsocial API              → Register & Auth akun
  ├── Bundle Social API          → OAuth Platform + Posting
  ├── jadiapa.com                → Generate Gambar + Video
  ├── Shopee (scrape)            → Data produk + dashboard affiliate
  └── Detik (scrape)             → Berita trending
```

---

## Status Fitur

| Fitur | Status | Jalur |
|-------|--------|-------|
| **Buat Akun Bunsocial** | ✅ Selesai | — |
| **Hubungkan Platform via Bundle Social** | ✅ Selesai | — |
| **Persona AI (CRUD + Chat)** | ✅ Selesai | A |
| **AI Generate Caption (by persona)** | ✅ Selesai | A |
| **Input Link Affiliate Manual** | ✅ Selesai | A + B |
| **Scraping Shopee — Produk (nama, harga, deskripsi)** | 🔜 Coming | A + B |
| **Scraping Shopee — Dashboard Affiliate (views, klik, trending)** | 🔜 Coming | A + B |
| **Scraping jadiapa.com (saldo, pemakaian, top up)** | 🔜 Coming | A + B |
| **AI Generate Gambar (via jadiapa.com)** | 🔜 Coming | A + B |
| **AI Generate Video (via jadiapa.com)** | 🔜 Coming | A + B |
| **Scrape Berita (Detik, dsb)** | 🔜 Coming | B |
| **AI Caption dari Berita** | 🔜 Coming | B |
| **Auto Post via Bundle Social** | 🔜 Coming | A + B |
| **Schedule Posting (jadwal otomatis)** | 🔜 Coming | A + B |
| **Auto Retry Produk Bagus (views tinggi → repost)** | 🔜 Coming | A + B |
| **Content Management** | ✅ Selesai | — |
| **Multi-user + Admin** | ✅ Selesai | — |

---

## Blueprint Masa Depan: Jalur A (Persona)

```
Persona + Topik
  │
  ▼
Pilih Link Affiliate
  ├── Manual: input link → scrape produk Shopee
  └── Otomatis: scrape dashboard affiliate Shopee
  │
  ▼
AI Generate Caption (by persona identity)       ✅ SELESAI
  │
  ▼
User Review & Edit Caption                      ✅ SELESAI
  │
  ▼
AI Generate Gambar (via jadiapa.com)            🔜 COMING
  │
  ▼
User Review & Approve
  │
  ▼
Auto Post via Bundle Social                     🔜 COMING
  │
  ▼
FB, IG, X, TikTok, Threads, Pinterest
```

---

## Blueprint Masa Depan: Jalur B (Scraping)

```
Scrape Berita Detik (per niche)
  │
  ├──▶ Scrape Dashboard Affiliate (Shopee)
  │      → Ambil produk trending, views, klik
  │      → Pilih produk terbaik untuk niche
  │
  ├──▶ Scrape jadiapa.com (cek saldo)
  │
  ▼
AI Generate Caption (dari isi berita + link aff)
  │
  ▼
AI Generate Gambar (via jadiapa.com)
  │
  ▼
Auto Post via Bundle Social (full otomatis)     🔜 COMING
  │
  ▼
FB, IG, X, TikTok, Threads, Pinterest
```

---

## Perbandingan Dua Jalur

| Aspek | Jalur A: Persona | Jalur B: Scraping |
|-------|-----------------|-------------------|
| **Sumber konten** | Identitas persona (hobi, gaya) | Berita Detik (judul, isi) |
| **Link Affiliate** | Manual input / Auto scrape | Auto scrape dashboard aff |
| **Penempatan Link** | Caption / Komentar (per platform) | Default: Komentar |
| **Caption** | AI by persona identity | AI by artikel berita |
| **Gambar** | jadiapa.com | jadiapa.com |
| **Video** | jadiapa.com | jadiapa.com |
| **Review** | Manual (sentuhan manusia) | Full otomatis |
| **Cocok untuk** | Personal branding, rekomendasi | Berita, info trending |
| **Status** | Caption ✅, sisanya 🔜 | Semua 🔜 (flow siap) |