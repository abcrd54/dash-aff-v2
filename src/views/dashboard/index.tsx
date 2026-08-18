import type { FC } from "hono/jsx";
import Layout from "../../components/layout";
import type { AuthUser } from "../../middleware/auth";

interface DashboardProps {
  user: AuthUser;
  stats: {
    users: number;
    posts: number;
    bunsocialTotal: number;
    bunsocialReady: number;
    platformsConnected: number;
    identityGroups: number;
    estimatedMonthlyPosts: number;
  };
  autoPostActive?: boolean;
  autoGenerateActive?: boolean;
}

const UserDashboard: FC<DashboardProps> = ({ user, stats, autoPostActive = false, autoGenerateActive = false }) => {
  const adminCards = [
    { label: "Total Users", value: stats.users, color: "bg-purple-500", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
    { label: "Total Post", value: stats.posts, color: "bg-blue-500", icon: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" },
  ];

  const affiliateCards = [
    { label: "Bunsocial Siap", value: stats.bunsocialReady, color: "bg-emerald-500", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
    { label: "Platform Connected", value: stats.platformsConnected, color: "bg-blue-500", icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" },
    { label: "Grup Identitas", value: stats.identityGroups, color: "bg-indigo-500", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
    { label: "Estimasi Post/Bulan", value: stats.estimatedMonthlyPosts, color: "bg-amber-500", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  ];

  const cards = user.role === "admin" ? [...adminCards, ...affiliateCards] : affiliateCards;

  return (
    <Layout user={user} title="Dashboard" currentPath="/dashboard" autoPostActive={autoPostActive} autoGenerateActive={autoGenerateActive}>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {cards.map((card) => (
          <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-slate-500 font-medium">{card.label}</p>
                <p class="text-3xl font-bold text-slate-900 mt-1">{card.value}</p>
              </div>
              <div class={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}>
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d={card.icon} />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
        <h2 class="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <a href="/post" class="flex items-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition text-sm font-medium text-blue-700">
            <span class="text-lg">📤</span> Post Sekarang
          </a>
          <a href="/generate" class="flex items-center gap-2 p-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition text-sm font-medium text-purple-700">
            <span class="text-lg">✨</span> Generate Konten
          </a>
          <a href="/affiliate-link" class="flex items-center gap-2 p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition text-sm font-medium text-emerald-700">
            <span class="text-lg">🔗</span> Tambah Link
          </a>
          <a href="/create-bunsos" class="flex items-center gap-2 p-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition text-sm font-medium text-amber-700">
            <span class="text-lg">➕</span> Buat Akun
          </a>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-slate-800 mb-2">Selamat Datang, {user.username}!</h2>
        <p class="text-slate-500 text-sm">
          Anda login sebagai <span class="font-medium text-slate-700">{user.role}</span>.
          Gunakan sidebar untuk navigasi ke menu yang tersedia.
        </p>
      </div>
    </Layout>
  );
};

export default UserDashboard;