import type { FC } from "hono/jsx";
import Layout from "../../components/layout";
import type { JWTPayload } from "../../middleware/auth";

interface AccountPageProps {
  user: JWTPayload;
}

const AccountPage: FC<AccountPageProps> = ({ user }) => {
  return (
    <Layout user={user} title="Akun Saya" currentPath="/account">
      <div class="max-w-xl">
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
          <h3 class="text-lg font-semibold text-slate-800 mb-4">Informasi Akun</h3>
          <div class="space-y-3">
            <div class="flex justify-between py-2 border-b border-slate-100">
              <span class="text-slate-500 text-sm">Username</span>
              <span class="text-slate-800 font-medium text-sm">{user.username}</span>
            </div>
            <div class="flex justify-between py-2">
              <span class="text-slate-500 text-sm">Role</span>
              <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                {user.role}
              </span>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 class="text-lg font-semibold text-slate-800 mb-4">Ganti Password</h3>

          <form method="POST" action="/account/password" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Password Lama</label>
              <input
                type="password"
                name="current_password"
                required
                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Password Baru</label>
              <input
                type="password"
                name="new_password"
                required
                minlength="6"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default AccountPage;