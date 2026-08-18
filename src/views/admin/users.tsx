import type { FC } from "hono/jsx";
import { raw } from "hono/html";
import Layout from "../../components/layout";
import type { AuthUser } from "../../middleware/auth";
import type { User } from "../../lib/db";

interface UsersPageProps {
  user: AuthUser;
  users: User[];
}

const UsersPage: FC<UsersPageProps> = ({ user: currentUser, users }) => {
  return (
    <Layout user={currentUser} title="Manajemen User" currentPath="/admin/users">
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 lg:px-6 py-4 border-b border-slate-200">
          <h2 class="text-lg font-semibold text-slate-800">Daftar User</h2>
          <button
            onclick="openCreateUserModal()"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
          >
            + Tambah User
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 border-b border-slate-200">
              <tr>
                <th class="text-left px-6 py-3 text-slate-600 font-medium">ID</th>
                <th class="text-left px-6 py-3 text-slate-600 font-medium">Username</th>
                <th class="text-left px-6 py-3 text-slate-600 font-medium">Email</th>
                <th class="text-left px-6 py-3 text-slate-600 font-medium">Role</th>
                <th class="text-left px-6 py-3 text-slate-600 font-medium">2FA</th>
                <th class="text-left px-6 py-3 text-slate-600 font-medium">Dibuat</th>
                <th class="text-right px-6 py-3 text-slate-600 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              {users.map((u) => {
                return (
                <tr class="hover:bg-slate-50 transition">
                  <td class="px-6 py-4 text-slate-500 font-mono text-xs">#{u.id}</td>
                  <td class="px-6 py-4 font-medium text-slate-800">{u.username}</td>
                  <td class="px-6 py-4 text-slate-500 text-xs">{u.email || <span class="text-red-400">-</span>}</td>
                  <td class="px-6 py-4">
                    <span
                      class={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <span class={`px-2 py-0.5 rounded-full text-xs font-medium ${u.two_factor_enabled ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                      {u.two_factor_enabled ? "ON" : "OFF"}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-slate-500">{u.created_at}</td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <button
                        onclick={`openEditUser(${u.id})`}
                        class="text-blue-600 hover:text-blue-800 text-sm font-medium cursor-pointer"
                      >
                        Edit
                      </button>
                      {u.id !== currentUser.id && (
                        <button
                          onclick={`deleteUser(${u.id})`}
                          class="text-red-600 hover:text-red-800 text-sm font-medium cursor-pointer"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )})}
              {users.length === 0 && (
                <tr>
                  <td colspan="7" class="empty-state">
                    <div class="empty-state-icon">👥</div>
                    <p class="empty-state-text">Belum ada user terdaftar</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div id="createUserModal" class="hidden fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div class="bg-white rounded-xl shadow-lg w-full max-w-md p-4 sm:p-6" onclick="event.stopPropagation()">
          <h3 class="text-lg font-semibold text-slate-800 mb-4">Tambah User Baru</h3>
          <form
            method="POST"
            action="/admin/users"
            class="space-y-4"
          >
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Username *</label>
              <input
                type="text"
                name="username"
                required
                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Email *</label>
              <input
                type="email"
                name="email"
                required
                placeholder="user@example.com"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Password *</label>
              <input
                type="password"
                name="password"
                required
                minlength="6"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Role</label>
              <select
                name="role"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div class="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onclick="closeCreateUserModal()"
                class="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg cursor-pointer"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      </div>

      <div id="editUserModal" class="hidden fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div class="bg-white rounded-xl shadow-lg w-full max-w-md p-4 sm:p-6" onclick="event.stopPropagation()">
          <h3 class="text-lg font-semibold text-slate-800 mb-4">Edit User</h3>
          <form
            id="editUserForm"
            onsubmit="return submitEditUser(event)"
            class="space-y-4"
          >
            <input type="hidden" id="editUserId" name="id" />
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Username</label>
              <input
                type="text"
                id="editUsername"
                name="username"
                required
                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                id="editEmail"
                name="email"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Password (kosongkan jika tidak diubah)</label>
              <input
                type="password"
                name="password"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Role</label>
              <select
                id="editRole"
                name="role"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div class="flex items-center gap-2">
              <input type="hidden" name="two_factor_enabled" value="0" />
              <input type="checkbox" id="editTwoFactor" name="two_factor_enabled" value="1" class="w-4 h-4 text-blue-600 rounded" />
              <label for="editTwoFactor" class="text-sm text-slate-700">2FA (Email OTP) Aktif</label>
            </div>
            <div class="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onclick="closeEditUserModal()"
                class="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg cursor-pointer"
              >
                Update
              </button>
            </div>
          </form>
        </div>
      </div>

      <script>{raw(`
        window._usersData = ${JSON.stringify(users)};
        function openCreateUserModal() {
          document.getElementById('createUserModal').classList.remove('hidden');
        }
        function closeCreateUserModal() {
          document.getElementById('createUserModal').classList.add('hidden');
        }
        function openEditUserModal() {
          document.getElementById('editUserModal').classList.remove('hidden');
        }
        function closeEditUserModal() {
          document.getElementById('editUserModal').classList.add('hidden');
        }
        function openEditUser(id) {
          var u = window._usersData.find(function(x) { return x.id === id; });
          if (!u) return;
          document.getElementById('editUserId').value = u.id;
          document.getElementById('editUsername').value = u.username;
          document.getElementById('editEmail').value = u.email || '';
          document.getElementById('editRole').value = u.role;
          document.getElementById('editTwoFactor').checked = u.two_factor_enabled === 1;
          openEditUserModal();
        }
        function submitEditUser(event) {
          event.preventDefault();
          var id = document.getElementById('editUserId').value;
          var form = document.getElementById('editUserForm');
          var data = new FormData(form);
          fetch('/admin/users/' + id, { method: 'PUT', body: data }).then(function(r) {
            if (r.redirected) {
              showToast('success', 'Sukses', 'User berhasil diupdate');
              setTimeout(function() { window.location.reload(); }, 800);
            }
          });
          closeEditUserModal();
          return false;
        }
        function deleteUser(id) {
          var u = window._usersData.find(function(x) { return x.id === id; });
          var name = u ? u.username : '#' + id;
          showConfirm('Hapus User', 'Yakin hapus user "' + name + '"?', function() {
            fetch('/admin/users/' + id, { method: 'DELETE' }).then(function() {
              window.location.reload();
            });
          });
        }
      `)}</script>
    </Layout>
  );
};

export default UsersPage;