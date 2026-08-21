import type { FC } from "hono/jsx";
import Layout from "../../components/layout";
import type { AuthUser } from "../../middleware/auth";

interface PostLog {
  id: number;
  group_name: string;
  account_email: string;
  platforms: string;
  caption: string | null;
  status: string;
  bundle_post_id: string | null;
  error: string | null;
  created_at: string;
}

interface PostLogsProps {
  user: AuthUser;
  logs: PostLog[];
}

const PostLogsPage: FC<PostLogsProps> = ({ user, logs }) => {
  return (
    <Layout user={user} title="Post Logs" currentPath="/post-logs">
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div class="p-6 border-b border-slate-200">
          <h2 class="text-lg font-semibold text-slate-800">Riwayat Post</h2>
          <p class="text-xs text-slate-500 mt-1">Log semua post yang dikirim via Bundle Social</p>
        </div>

        {logs.length === 0 ? (
          <div class="empty-state">
            <div class="empty-state-icon"><i class="fa-solid fa-clipboard-list"></i></div>
            <p class="empty-state-text">Belum ada riwayat post</p>
            <p class="text-xs text-slate-400 mb-4">Post pertama Anda akan muncul di sini setelah mengirim konten</p>
            <a href="/post" class="empty-state-action">Post Sekarang</a>
          </div>
        ) : (
          <div class="overflow-x-auto">
            <table class="responsive-table">
              <thead>
                <tr>
                  <th>Waktu</th>
                  <th>Grup</th>
                  <th>Akun</th>
                  <th>Platform</th>
                  <th>Status</th>
                  <th>Caption</th>
                  <th>Error</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  let platforms: string[] = [];
                  try { platforms = JSON.parse(log.platforms); } catch { platforms = []; }
                  return (
                    <tr>
                      <td data-label="Waktu">
                        <span class="text-sm text-slate-600">{log.created_at}</span>
                      </td>
                      <td data-label="Grup">
                        <span class="text-sm font-medium text-slate-700">{log.group_name}</span>
                      </td>
                      <td data-label="Akun">
                        <span class="text-xs text-slate-500">{log.account_email}</span>
                      </td>
                      <td data-label="Platform">
                        <div class="flex flex-wrap gap-1">
                          {platforms.map((p) => (
                            <span class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">{p}</span>
                          ))}
                        </div>
                      </td>
                      <td data-label="Status">
                        <span class={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          log.status === "success" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                        }`}>
                          {log.status === "success" ? "Berhasil" : "Gagal"}
                        </span>
                        {log.bundle_post_id && (
                          <div class="text-[10px] text-slate-400 mt-0.5">{log.bundle_post_id.substring(0, 12)}...</div>
                        )}
                      </td>
                      <td data-label="Caption">
                        <span class="text-xs text-slate-500 line-clamp-2">{log.caption || "-"}</span>
                      </td>
                      <td data-label="Error">
                        {log.error ? (
                          <span class="text-xs text-red-500 line-clamp-2">{log.error}</span>
                        ) : (
                          <span class="text-xs text-slate-300">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PostLogsPage;
