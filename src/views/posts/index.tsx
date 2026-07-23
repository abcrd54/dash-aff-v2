import type { FC } from "hono/jsx";
import { raw } from "hono/html";
import Layout from "../../components/layout";
import type { JWTPayload } from "../../middleware/auth";
import type { Post } from "../../lib/db";

interface PostsPageProps {
  user: JWTPayload;
  posts: Post[];
}

const PostsPage: FC<PostsPageProps> = ({ user, posts }) => {
  return (
    <Layout user={user} title="Manajemen Post" currentPath="/posts">
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 lg:px-6 py-4 border-b border-slate-200">
          <h2 class="text-lg font-semibold text-slate-800">Daftar Post</h2>
          <button
            onclick="openCreatePostModal()"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
          >
            + Tambah Post
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 border-b border-slate-200">
              <tr>
                <th class="text-left px-6 py-3 text-slate-600 font-medium">Judul</th>
                <th class="text-left px-6 py-3 text-slate-600 font-medium">Slug</th>
                <th class="text-left px-6 py-3 text-slate-600 font-medium">Status</th>
                <th class="text-left px-6 py-3 text-slate-600 font-medium">Tanggal</th>
                <th class="text-right px-6 py-3 text-slate-600 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              {posts.map((p) => (
                <tr class="hover:bg-slate-50 transition">
                  <td class="px-6 py-4 font-medium text-slate-800 max-w-[200px] truncate">{p.title}</td>
                  <td class="px-6 py-4 text-slate-500 text-xs font-mono">{p.slug}</td>
                  <td class="px-6 py-4">
                    <span
                      class={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-slate-500 text-xs">{p.created_at}</td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <button
                        onclick={`openEditPost(${p.id})`}
                        class="text-blue-600 hover:text-blue-800 text-sm font-medium cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onclick={`deletePost(${p.id})`}
                        class="text-red-600 hover:text-red-800 text-sm font-medium cursor-pointer"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr>
                  <td colspan="5" class="px-6 py-12 text-center text-slate-400">
                    Belum ada post.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div id="createPostModal" class="hidden fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div class="bg-white rounded-xl shadow-lg w-full max-w-lg p-4 sm:p-6" onclick="event.stopPropagation()">
          <h3 class="text-lg font-semibold text-slate-800 mb-4">Tambah Post Baru</h3>
          <form
            method="POST"
            action="/posts"
            onsubmit="closeCreatePostModal()"
            class="space-y-4"
          >
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Judul</label>
              <input
                type="text"
                name="title"
                required
                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Slug</label>
              <input
                type="text"
                name="slug"
                placeholder="otomatis dari judul jika kosong"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Konten</label>
              <textarea
                name="body"
                rows={6}
                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                name="status"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div class="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onclick="closeCreatePostModal()"
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

      <div id="editPostModal" class="hidden fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div class="bg-white rounded-xl shadow-lg w-full max-w-lg p-4 sm:p-6" onclick="event.stopPropagation()">
          <h3 class="text-lg font-semibold text-slate-800 mb-4">Edit Post</h3>
          <form
            id="editPostForm"
            onsubmit="return submitEditPost(event)"
            class="space-y-4"
          >
            <input type="hidden" id="editPostId" />
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Judul</label>
              <input
                type="text"
                id="editPostTitle"
                name="title"
                required
                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Slug</label>
              <input
                type="text"
                id="editPostSlug"
                name="slug"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Konten</label>
              <textarea
                id="editPostBody"
                name="body"
                rows={6}
                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                id="editPostStatus"
                name="status"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div class="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onclick="closeEditPostModal()"
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
        window._postsData = ${JSON.stringify(posts)};
        function openCreatePostModal() { document.getElementById('createPostModal').classList.remove('hidden'); }
        function closeCreatePostModal() { document.getElementById('createPostModal').classList.add('hidden'); }
        function closeEditPostModal() { document.getElementById('editPostModal').classList.add('hidden'); }
        function openEditPost(id) {
          var p = window._postsData.find(function(x) { return x.id === id; });
          if (!p) return;
          document.getElementById('editPostId').value = p.id;
          document.getElementById('editPostTitle').value = p.title;
          document.getElementById('editPostSlug').value = p.slug;
          document.getElementById('editPostBody').value = p.body;
          document.getElementById('editPostStatus').value = p.status;
          document.getElementById('editPostModal').classList.remove('hidden');
        }
        function submitEditPost(event) {
          event.preventDefault();
          var id = document.getElementById('editPostId').value;
          var data = new FormData(document.getElementById('editPostForm'));
          fetch('/posts/' + id, { method: 'PUT', body: data }).then(function(r) {
            if (r.redirected) {
              showToast('success', 'Sukses', 'Post berhasil diupdate');
              setTimeout(function() { window.location.reload(); }, 800);
            }
          });
          closeEditPostModal();
          return false;
        }
        function deletePost(id) {
          var p = window._postsData.find(function(x) { return x.id === id; });
          var name = p ? p.title : '#' + id;
          showConfirm('Hapus Post', 'Yakin hapus post "' + name + '"?', function() {
            fetch('/posts/' + id, { method: 'DELETE' }).then(function() {
              window.location.reload();
            });
          });
        }
      `)}</script>
    </Layout>
  );
};

export default PostsPage;
