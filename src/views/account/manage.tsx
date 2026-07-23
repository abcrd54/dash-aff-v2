import type { FC } from "hono/jsx";
import Layout from "../../components/layout";
import type { JWTPayload } from "../../middleware/auth";

interface ManageAccountProps {
  user: JWTPayload;
}

const ManageAccountPage: FC<ManageAccountProps> = ({ user }) => {
  return (
    <Layout user={user} title="Management Akun" currentPath="/manage-account">
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
        <i data-lucide="settings" class="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-slate-700 mb-2">Management Akun</h3>
        <p class="text-slate-400 text-sm">Kelola pengaturan akun Anda di sini.</p>
      </div>
    </Layout>
  );
};

export default ManageAccountPage;