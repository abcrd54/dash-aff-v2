import type { FC } from "hono/jsx";
import { raw } from "hono/html";

interface VerifyOtpProps {
  error?: string;
}

const VerifyOtpPage: FC<VerifyOtpProps> = ({ error }) => {
  return (
    <html lang="id">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32.png" />
        <link rel="apple-touch-icon" href="/images/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#2563eb" />
        <title>Verifikasi OTP — Dashboard Management Affiliate</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="/css/main.css" />
        <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11" />
        {error && (
          <script>{raw(`
            document.addEventListener('DOMContentLoaded', function() {
              Swal.fire({ icon: 'warning', title: 'Verifikasi Gagal', text: ${JSON.stringify(error)}, toast: true, position: 'top-end', showConfirmButton: false, timer: 4000, timerProgressBar: true });
            });
          `)}</script>
        )}
      </head>
      <body class="bg-slate-100 min-h-screen flex items-center justify-center p-4">
        <div class="w-full max-w-md">
          <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
            <div class="text-center mb-8">
              <img src="/images/logo.png" alt="Dashboard Management Affiliate" class="w-16 h-16 object-contain mx-auto mb-4" />
              <h1 class="text-2xl font-bold text-slate-900">Verifikasi OTP</h1>
              <p class="text-slate-500 text-sm mt-1">Kode 6 digit telah dikirim ke email Anda</p>
            </div>

            <form method="POST" action="/login/verify-otp" class="space-y-5">
              <input type="hidden" name="user_id" value="" />
              <div>
                <label for="otp" class="block text-sm font-medium text-slate-700 mb-1.5">
                  Kode OTP
                </label>
                <input
                  type="text"
                  id="otp"
                  name="otp"
                  required
                  autofocus
                  inputmode="numeric"
                  maxlength="6"
                  autocomplete="one-time-code"
                  placeholder="000000"
                  class="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                />
              </div>

              <button
                type="submit"
                class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg transition cursor-pointer text-sm"
              >
                Verifikasi
              </button>
            </form>

            <div class="mt-6 text-center">
              <p class="text-xs text-slate-400">
                Kode berlaku 5 menit. Tidak menerima kode? Cek folder spam.
              </p>
              <a href="/login" class="text-xs text-blue-600 hover:text-blue-800 mt-2 inline-block">
                ← Kembali ke login
              </a>
            </div>
          </div>
        </div>

        <script>{raw(`
          document.getElementById('otp').addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
          });
        `)}</script>
      </body>
    </html>
  );
};

export default VerifyOtpPage;
