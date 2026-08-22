import type { FC } from "hono/jsx";
import { raw } from "hono/html";
import type { AuthUser } from "../middleware/auth";

interface SidebarProps {
  user: AuthUser;
  currentPath: string;
  autoPostActive: boolean;
  autoGenerateActive: boolean;
}

interface SidebarLink {
  href: string;
  label: string;
  icon: string;
  children?: SidebarLink[];
  badge?: string;
  badgeColor?: string;
}

const adminLinks: SidebarLink[] = [
  { href: "/dashboard", label: "Dashboard", icon: "fa-table-columns" },
  { href: "/admin/users", label: "Users", icon: "fa-users" },
  { href: "/account", label: "Akun Saya", icon: "fa-circle-user" },
];

const userLinks = (autoPostActive: boolean, autoGenerateActive: boolean): SidebarLink[] => [
  { href: "/dashboard", label: "Dashboard", icon: "fa-table-columns" },
  { href: "/create-bunsos", label: "Management Bundle Social", icon: "fa-box",
    children: [
      { href: "/create-bunsos", label: "Auto Create Bunsoc", icon: "fa-bolt" },
      { href: "/platform/connect", label: "Platform Connect", icon: "fa-plug" },
    ],
  },
  { href: "/personas", label: "Akun Personal", icon: "fa-user-pen" },
  { href: "/affiliate-link", label: "Link Affiliate", icon: "fa-link" },
  { href: "/post", label: "Management Post", icon: "fa-paper-plane",
    badge: autoPostActive ? "Auto Post ON" : "Auto Post OFF",
    badgeColor: autoPostActive ? "bg-emerald-500" : "bg-slate-400",
    children: [
      { href: "/post", label: "Compose & Post", icon: "fa-paper-plane" },
      { href: "/post-logs", label: "Riwayat Post", icon: "fa-clock-rotate-left" },
    ],
  },
  { href: "/generate", label: "Generate Konten", icon: "fa-wand-magic-sparkles",
    badge: autoGenerateActive ? "Auto Scrape ON" : "Auto Scrape OFF",
    badgeColor: autoGenerateActive ? "bg-emerald-500" : "bg-slate-400",
  },
  { href: "/settings", label: "Settings", icon: "fa-sliders" },
  { href: "/account", label: "Akun Saya", icon: "fa-circle-user" },
];

const Sidebar: FC<SidebarProps> = ({ user, currentPath, autoPostActive, autoGenerateActive }) => {
  const links = user.role === "admin" ? adminLinks : userLinks(autoPostActive, autoGenerateActive);

  return (
    <div id="sidebar-root">
      <div
        id="sidebar-overlay"
        class="fixed inset-0 bg-black/50 z-40 lg:hidden hidden transition-opacity duration-200"
      />

      <aside
        id="app-sidebar"
        class="fixed left-0 top-0 h-screen w-[260px] bg-sidebar-bg flex flex-col z-50 -translate-x-full transition-transform duration-200 lg:translate-x-0"
      >
        <div class="flex items-center justify-between px-5 h-16 border-b border-slate-700/50">
          <div class="flex items-center gap-3">
            <img src="/images/icon-512.png" alt="Logo" class="w-9 h-9 object-contain flex-shrink-0" />
            <span class="text-white font-semibold text-base">Dashboard Management Affiliate</span>
          </div>
          <button
            type="button"
            data-sidebar-close
            class="lg:hidden text-slate-400 hover:text-white cursor-pointer"
          >
            <i class="fa-solid fa-xmark w-5 h-5"></i>
          </button>
        </div>

        <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {links.map((link) => {
            if (link.children && link.children.length > 0) {
              const isParentActive = currentPath === link.href;
              const childActive = link.children.some(c => currentPath.startsWith(c.href));
              const expanded = isParentActive || childActive;
              return (
                <div data-sidebar-group>
                  <button
                    type="button"
                    data-sidebar-group-toggle
                    aria-expanded={expanded ? "true" : "false"}
                    class={`sidebar-link w-full text-left ${isParentActive ? "active" : ""}`}
                  >
                    <i class={`fa-solid ${link.icon} w-5 h-5 flex-shrink-0`}></i>
                    <span class="flex-1">{link.label}</span>
                    <span data-sidebar-collapsed-icon class={`flex-shrink-0 flex ${expanded ? "hidden" : ""}`}>
                      <i class="fa-solid fa-chevron-right w-4 h-4"></i>
                    </span>
                    <span data-sidebar-expanded-icon class={`flex-shrink-0 flex ${expanded ? "" : "hidden"}`}>
                      <i class="fa-solid fa-chevron-down w-4 h-4"></i>
                    </span>
                  </button>
                  <div data-sidebar-submenu class={`ml-4 space-y-1 mt-1 ${expanded ? "" : "hidden"}`}>
                    {link.children.map((child) => (
                      <a
                        href={child.href}
                        class={`sidebar-link text-sm ${currentPath === child.href || currentPath.startsWith(child.href) ? "active" : ""}`}
                        data-sidebar-close-mobile
                      >
                        <i class={`fa-solid ${child.icon} w-4 h-4 flex-shrink-0`}></i>
                        <span>{child.label}</span>
                      </a>
                    ))}
                  </div>
                </div>
              );
            }
            return (
              <a
                href={link.href}
                class={`sidebar-link ${currentPath === link.href || (link.href !== "/dashboard" && currentPath.startsWith(link.href)) ? "active" : ""}`}
                data-sidebar-close-mobile
              >
                <i class={`fa-solid ${link.icon} w-5 h-5 flex-shrink-0`}></i>
                <span class="flex-1">{link.label}</span>
                {link.badge && (
                  <span class={`${link.badgeColor || "bg-slate-400"} text-white text-[9px] px-1.5 py-0.5 rounded-full font-medium leading-none`}>
                    {link.badge}
                  </span>
                )}
              </a>
            );
          })}
        </nav>

        <div class="px-3 py-4 border-t border-slate-700/50">
          <a
            href="/logout"
            class="sidebar-link text-red-400 hover:text-red-300 hover:bg-red-900/20"
          >
            <i class="fa-solid fa-right-from-bracket w-5 h-5 flex-shrink-0"></i>
            <span>Logout</span>
          </a>
        </div>
      </aside>

      <script>{raw(`
        document.addEventListener('DOMContentLoaded', function() {
          var sidebar = document.getElementById('app-sidebar');
          var overlay = document.getElementById('sidebar-overlay');
          var isOpen = false;

          function setSidebarOpen(open) {
            isOpen = open;
            sidebar.classList.toggle('-translate-x-full', !open);
            sidebar.classList.toggle('translate-x-0', open);
            overlay.classList.toggle('hidden', !open);
          }

          window.addEventListener('toggle-sidebar', function() {
            setSidebarOpen(!isOpen);
          });
          overlay.addEventListener('click', function() { setSidebarOpen(false); });
          document.querySelectorAll('[data-sidebar-close]').forEach(function(button) {
            button.addEventListener('click', function() { setSidebarOpen(false); });
          });
          document.querySelectorAll('[data-sidebar-close-mobile]').forEach(function(link) {
            link.addEventListener('click', function() {
              if (window.innerWidth < 1024) setSidebarOpen(false);
            });
          });
          document.querySelectorAll('[data-sidebar-group-toggle]').forEach(function(button) {
            button.addEventListener('click', function() {
              var group = button.closest('[data-sidebar-group]');
              var submenu = group.querySelector('[data-sidebar-submenu]');
              var expanded = button.getAttribute('aria-expanded') !== 'true';
              button.setAttribute('aria-expanded', String(expanded));
              submenu.classList.toggle('hidden', !expanded);
              group.querySelector('[data-sidebar-collapsed-icon]').classList.toggle('hidden', expanded);
              group.querySelector('[data-sidebar-expanded-icon]').classList.toggle('hidden', !expanded);
            });
          });
        });
      `)}</script>
    </div>
  );
};

export default Sidebar;
