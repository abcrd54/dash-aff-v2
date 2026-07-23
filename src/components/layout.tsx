import type { FC } from "hono/jsx";
import { raw } from "hono/html";
import type { JWTPayload } from "../middleware/auth";
import Sidebar from "./sidebar";
import Navbar from "./navbar";

interface LayoutProps {
  user: JWTPayload;
  title: string;
  currentPath: string;
  children?: any;
}

const Layout: FC<LayoutProps> = ({ user, title, currentPath, children }) => {
  return (
    <html lang="id">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title} — Barokah Aff</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="/css/main.css" />
        <script src="https://unpkg.com/htmx.org@1.9.12" />
        <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.1/dist/cdn.min.js" />
        <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11" />
        <script src="https://unpkg.com/lucide@latest" />
        <script>{raw(`
          document.addEventListener('DOMContentLoaded', function() {
            lucide.createIcons();
            var btn = document.getElementById('sidebar-toggle-btn');
            if (btn) {
              btn.addEventListener('click', function() {
                window.dispatchEvent(new CustomEvent('toggle-sidebar'));
              });
            }

            var params = new URLSearchParams(window.location.search);
            var error = params.get('error');
            var success = params.get('success');
            if (error) {
              Swal.fire({ icon: 'error', title: 'Error', text: error, toast: true, position: 'top-end', showConfirmButton: false, timer: 4000, timerProgressBar: true });
            }
            if (success) {
              Swal.fire({ icon: 'success', title: 'Sukses', text: success, toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true });
            }
            if (error || success) {
              var url = new URL(window.location);
              url.searchParams.delete('error');
              url.searchParams.delete('success');
              window.history.replaceState({}, '', url);
            }
          });

          window.showToast = function(icon, title, text) {
            Swal.fire({ icon: icon, title: title, text: text, toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true });
          };

          window.showConfirm = function(title, text, callback) {
            Swal.fire({ title: title, text: text, icon: 'warning', showCancelButton: true, confirmButtonColor: '#2563eb', cancelButtonColor: '#64748b', confirmButtonText: 'Ya, lanjutkan', cancelButtonText: 'Batal' }).then(function(result) {
              if (result.isConfirmed) callback();
            });
          };
        `)}</script>
      </head>
      <body class="bg-slate-100 min-h-screen">
        <Sidebar user={user} currentPath={currentPath} />
        <div class="lg:ml-[260px] min-h-screen">
          <Navbar user={user} title={title} />
          <main class="p-4 lg:p-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
};

export default Layout;