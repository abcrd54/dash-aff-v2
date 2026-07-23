import type { FC } from "hono/jsx";
import Layout from "../../components/layout";
import type { JWTPayload } from "../../middleware/auth";

interface DashboardProps {
  user: JWTPayload;
  stats: { users: number; posts: number; content: number };
}

const UserDashboard: FC<DashboardProps> = ({ user, stats }) => {
  const cards = [
    ...(user.role === "admin"
      ? [
          { label: "Total Users", value: stats.users, color: "bg-purple-500", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
        ]
      : []),
    { label: "Total Post", value: stats.posts, color: "bg-blue-500", icon: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" },
    { label: "Total Konten", value: stats.content, color: "bg-emerald-500", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  ];

  return (
    <Layout user={user} title="Dashboard" currentPath="/dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {cards.map((card) => (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">{card.label}</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{card.value}</p>
              </div>
              <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d={card.icon} />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-2">Selamat Datang, {user.username}!</h2>
        <p className="text-slate-500 text-sm">
          Anda login sebagai <span className="font-medium text-slate-700">{user.role}</span>. 
          Gunakan sidebar untuk navigasi ke menu yang tersedia.
        </p>
      </div>
    </Layout>
  );
};

export default UserDashboard;
