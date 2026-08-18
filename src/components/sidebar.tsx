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
  { href: "/dashboard", label: "Dashboard", icon: "layout-dashboard" },
  { href: "/admin/users", label: "Users", icon: "users" },
  { href: "/account", label: "Akun Saya", icon: "circle-user-round" },
];

const userLinks = (autoPostActive: boolean, autoGenerateActive: boolean): SidebarLink[] => [
  { href: "/dashboard", label: "Dashboard", icon: "layout-dashboard" },
  { href: "/manage-account", label: "Management Bundle Social", icon: "package",
    children: [
      { href: "/create-bunsos", label: "Auto Create Bunsoc", icon: "zap" },
      { href: "/platform/connect", label: "Platform Connect", icon: "plug" },
    ],
  },
  { href: "/personas", label: "Akun Personal", icon: "user-round-pen" },
  { href: "/affiliate-link", label: "Link Affiliate", icon: "link" },
  { href: "/post", label: "Management Post", icon: "send",
    badge: autoPostActive ? "Auto Post ON" : "Auto Post OFF",
    badgeColor: autoPostActive ? "bg-emerald-500" : "bg-slate-400",
  },
  { href: "/generate", label: "Generate Konten", icon: "sparkles",
    badge: autoGenerateActive ? "Auto Scrape ON" : "Auto Scrape OFF",
    badgeColor: autoGenerateActive ? "bg-emerald-500" : "bg-slate-400",
  },
  { href: "/settings", label: "Settings", icon: "sliders-horizontal" },
  { href: "/account", label: "Akun Saya", icon: "circle-user-round" },
];

const Sidebar: FC<SidebarProps> = ({ user, currentPath, autoPostActive, autoGenerateActive }) => {
  const links = user.role === "admin" ? adminLinks : userLinks(autoPostActive, autoGenerateActive);

  return (
    <div x-data="sidebarState">
      <div
        x-show="sidebarOpen"
        x-transition:enter="transition-opacity ease-out duration-200"
        x-transition:enter-start="opacity-0"
        x-transition:enter-end="opacity-100"
        x-transition:leave="transition-opacity ease-in duration-200"
        x-transition:leave-start="opacity-100"
        x-transition:leave-end="opacity-0"
        class="fixed inset-0 bg-black/50 z-40 lg:hidden"
        x-cloak
        x-on:click="sidebarOpen = false"
      />

      <aside
        x-show="sidebarOpen"
        x-transition:enter="transition-transform ease-out duration-200"
        x-transition:enter-start="-translate-x-full"
        x-transition:enter-end="translate-x-0"
        x-transition:leave="transition-transform ease-in duration-200"
        x-transition:leave-start="translate-x-0"
        x-transition:leave-end="-translate-x-full"
        class="fixed left-0 top-0 h-screen w-[260px] bg-sidebar-bg flex flex-col z-50 lg:translate-x-0"
        x-cloak
      >
        <div class="flex items-center justify-between px-5 h-16 border-b border-slate-700/50">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-sm">
              BA
            </div>
            <span class="text-white font-semibold text-base">Dashboard Management Affiliate</span>
          </div>
          <button
            x-on:click="sidebarOpen = false"
            class="lg:hidden text-slate-400 hover:text-white cursor-pointer"
          >
            <i data-lucide="x" class="w-5 h-5" />
          </button>
        </div>

        <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {links.map((link) => {
            if (link.children && link.children.length > 0) {
              const isParentActive = currentPath === link.href;
              const childActive = link.children.some(c => currentPath.startsWith(c.href));
              const expanded = isParentActive || childActive;
              return (
                <div x-data={`({ open: ${expanded} })`}>
                  <button
                    x-on:click="open = !open"
                    class={`sidebar-link w-full text-left ${isParentActive ? "active" : ""}`}
                  >
                    <i data-lucide={link.icon} class="w-5 h-5 flex-shrink-0" />
                    <span class="flex-1">{link.label}</span>
                    <i data-lucide="chevron-right" x-show="!open" class="w-4 h-4 flex-shrink-0 transition-transform" />
                    <i data-lucide="chevron-down" x-show="open" class="w-4 h-4 flex-shrink-0" />
                  </button>
                  <div x-show="open" class="ml-4 space-y-1 mt-1">
                    {link.children.map((child) => (
                      <a
                        href={child.href}
                        class={`sidebar-link text-sm ${currentPath === child.href || currentPath.startsWith(child.href) ? "active" : ""}`}
                        x-on:click="closeOnMobile()"
                      >
                        <i data-lucide={child.icon} class="w-4 h-4 flex-shrink-0" />
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
                x-on:click="closeOnMobile()"
              >
                <i data-lucide={link.icon} class="w-5 h-5 flex-shrink-0" />
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
            <i data-lucide="log-out" class="w-5 h-5 flex-shrink-0" />
            <span>Logout</span>
          </a>
        </div>
      </aside>

      <script>{raw(`
        document.addEventListener('alpine:init', function() {
          Alpine.data('sidebarState', function() {
            return {
              sidebarOpen: window.innerWidth >= 1024,
              closeOnMobile() {
                if (window.innerWidth < 1024) this.sidebarOpen = false;
              },
              init() {
                var self = this;
                window.addEventListener('resize', function() {
                  if (window.innerWidth >= 1024) self.sidebarOpen = true;
                });
                window.addEventListener('toggle-sidebar', function() {
                  self.sidebarOpen = !self.sidebarOpen;
                });
                // Re-render lucide icons when sidebar opens
                this.$watch('sidebarOpen', function() {
                  setTimeout(function() { lucide.createIcons(); }, 50);
                });
              }
            };
          });
        });
      `)}</script>
    </div>
  );
};

export default Sidebar;