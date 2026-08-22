# Performance Baseline

Baseline awal sebelum roadmap optimasi diterapkan penuh.

| Metrik | Nilai awal |
| --- | ---: |
| Source files dalam `src` | 54 |
| Bundle Bun tanpa minify | sekitar 1.26 MB |
| CSS Tailwind minified | sekitar 32 KB |
| Test otomatis | 6 lulus |
| Dependency runtime npm | 5 |

Gunakan `bun run check` untuk test, build CSS, menghasilkan bundle minified sementara, mencetak ukuran aktual, lalu membersihkan artefaknya.

Catatan: waktu startup dan memori idle bergantung pada mesin. Ukur keduanya pada environment deploy yang sama sebelum membandingkan perubahan.

## Hasil tahap optimasi pertama

| Metrik | Setelah tahap pertama |
| --- | ---: |
| Bundle Bun minified | 738,737 B |
| CSS Tailwind minified | 32,132 B |
| Test otomatis | 8 lulus |
| Script global dihapus | HTMX dan Lucide |
| Aset duplikat dihapus | `logo.png` (208,391 B) |

Smoke test read-only KumaVPS lulus. Kumux Mail dan Persona tidak dapat diuji pada pengukuran ini karena Docker Desktop sedang tidak berjalan; ini kondisi environment, bukan kegagalan response service.
