import type { FC } from "hono/jsx";
import Layout from "../../components/layout";
import type { JWTPayload } from "../../middleware/auth";

interface ManageAccountProps {
  user: JWTPayload;
}

const ManageAccountPage: FC<ManageAccountProps> = ({ user }) => {
  return (
    <Layout user={user} title="Management Akun" currentPath="/manage-account">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 class="text-lg font-semibold text-slate-800 mb-4">Ganti Username</h2>
          <form method="POST" action="/manage-account" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Username Saat Ini</label>
              <input
                type="text"
                value={user.username}
                disabled
                class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Username Baru</label>
              <input
                name="username"
                type="text"
                required
                minlength="3"
                placeholder="Masukkan username baru"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Password (konfirmasi)</label>
              <input
                name="password"
                type="password"
                required
                placeholder="Masukkan password untuk konfirmasi"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg cursor-pointer transition"
            >
              Simpan Perubahan
            </button>
          </form>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 class="text-lg font-semibold text-slate-800 mb-4">Informasi Akun</h2>
          <div class="space-y-3">
            <div>
              <span class="text-xs text-slate-500">Username</span>
              <p class="text-sm font-medium text-slate-800">{user.username}</p>
            </div>
            <div>
              <span class="text-xs text-slate-500">Role</span>
              <p class="text-sm">
                <span class={`px-2 py-0.5 rounded-full text-xs font-medium ${user.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                  {user.role}
                </span>
              </p>
            </div>
            <div>
              <span class="text-xs text-slate-500">ID</span>
              <p class="text-sm font-mono text-slate-600">#{user.id}</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ManageAccountPage;