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
              <div class="w-14 h-14 bg-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
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
