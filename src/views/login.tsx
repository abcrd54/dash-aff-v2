import type { FC } from "hono/jsx";
import { raw } from "hono/html";

interface LoginProps {
  error?: string;
  showSetEmail?: boolean;
  showContactAdmin?: boolean;
  userId?: number;
  username?: string;
}

const LoginPage: FC<LoginProps> = ({ error, showSetEmail, showContactAdmin, userId, username }) => {
  return (
    <html lang="id">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Login — Dashboard Management Affiliate</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="/css/main.css" />
        <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11" />
        {error && (
          <script>{raw(`
            document.addEventListener('DOMContentLoaded', function() {
              Swal.fire({ icon: 'warning', title: 'Login Gagal', text: ${JSON.stringify(error)}, toast: true, position: 'top-end', showConfirmButton: false, timer: 4000, timerProgressBar: true });
            });
          `)}</script>
        )}
      </head>
      <body class="bg-slate-100 min-h-screen flex items-center justify-center p-4">
        <div class="w-full max-w-md">
          <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
            <div class="text-center mb-8">
              <div class="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span class="text-white font-bold text-xl">BA</span>
              </div>
              <h1 class="text-2xl font-bold text-slate-900">Dashboard Management Affiliate</h1>
              <p class="text-slate-500 text-sm mt-1">Silakan login untuk melanjutkan</p>
            </div>

            {showSetEmail && userId && (
              <div class="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p class="text-sm text-amber-800 font-medium">Email Belum Diatur</p>
                <p class="text-xs text-amber-700 mt-1">
                  Akun <strong>{username}</strong> belum memiliki email. Email diperlukan untuk 2FA OTP.
                </p>
              </div>
            )}
            {showContactAdmin && (
              <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p class="text-sm text-red-800 font-medium">2FA Belum Aktif</p>
                <p class="text-xs text-red-700 mt-1">
                  Hubungi admin untuk mengaktifkan 2FA pada akun Anda.
                </p>
              </div>
            )}

            <form method="POST" action="/login" class="space-y-5">
              <div>
                <label for="email" class="block text-sm font-medium text-slate-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  autocomplete="email"
                  placeholder="Masukkan email"
                  class="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label for="password" class="block text-sm font-medium text-slate-700 mb-1.5">
                  Password
                </label>
                <div class="relative">
                  <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    autocomplete="current-password"
                    placeholder="Masukkan password"
                    class="w-full px-4 py-2.5 pr-10 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onclick="const p=document.getElementById('password');const oe=document.getElementById('eye-off');const e=document.getElementById('eye');if(p.type==='password'){p.type='text';oe.classList.add('hidden');e.classList.remove('hidden')}else{p.type='password';oe.classList.remove('hidden');e.classList.add('hidden')}"
                    class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    tabindex="-1"
                  >
                    <svg id="eye-off" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    <svg id="eye" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="hidden"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition cursor-pointer text-sm"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      </body>
    </html>
  );
};

export default LoginPage;