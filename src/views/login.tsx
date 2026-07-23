import type { FC } from "hono/jsx";
import { raw } from "hono/html";

interface LoginProps {
  error?: string;
}

const LoginPage: FC<LoginProps> = ({ error }) => {
  return (
    <html lang="id">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Login — Barokah Aff</title>
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
              <h1 class="text-2xl font-bold text-slate-900">Barokah Aff</h1>
              <p class="text-slate-500 text-sm mt-1">Silakan login untuk melanjutkan</p>
            </div>

            <form method="POST" action="/login" class="space-y-5">
              <div>
                <label for="username" class="block text-sm font-medium text-slate-700 mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  required
                  autocomplete="username"
                  placeholder="Masukkan username"
                  class="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label for="password" class="block text-sm font-medium text-slate-700 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  autocomplete="current-password"
                  placeholder="Masukkan password"
                  class="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
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