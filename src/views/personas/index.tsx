import type { FC } from "hono/jsx";
import type { JWTPayload } from "../../middleware/auth";
import Layout from "../../components/layout";

interface PersonaListProps {
  user: JWTPayload;
  serviceName: string;
  personas: any[];
  error?: string;
  success?: string;
}

const PersonaListPage: FC<PersonaListProps> = ({ user, serviceName, personas, error, success }) => {
  return (
    <Layout user={user} title="Persona" currentPath="/personas">
      {error && (
        <div class="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
      )}
      {success && (
        <div class="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">{success}</div>
      )}

      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <h2 class="text-lg font-semibold text-slate-800 mb-4">Create Persona</h2>
        <form method="POST" action="/personas" class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input name="name" required placeholder="Maya" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Type</label>
            <select name="type" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="personal">Personal</option>
              <option value="business">Business</option>
            </select>
          </div>
          <div class="col-span-2">
            <label class="block text-sm font-medium text-slate-700 mb-1">Traits (comma separated)</label>
            <input name="traits" placeholder="ramah, kreatif, peduli" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div class="col-span-2">
            <label class="block text-sm font-medium text-slate-700 mb-1">Backstory</label>
            <textarea name="backstory" rows="3" required placeholder="Cerita latar belakang persona..." class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Tone</label>
            <select name="tone" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="hangat">Hangat</option>
              <option value="santai">Santai</option>
              <option value="humoris">Humois</option>
              <option value="inspiratif">Inspiratif</option>
              <option value="formal">Formal</option>
              <option value="serius">Serius</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Language</label>
            <select name="language" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="indonesia">Indonesia</option>
              <option value="english">English</option>
              <option value="campur">Campur</option>
            </select>
          </div>
          <div class="col-span-2">
            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 cursor-pointer">
              Create Persona
            </button>
          </div>
        </form>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-slate-200">
        <div class="p-6 border-b border-slate-200">
          <h2 class="text-lg font-semibold text-slate-800">My Personas ({serviceName})</h2>
        </div>
        {personas.length === 0 ? (
          <div class="p-6 text-center text-slate-500 text-sm">No personas yet. Create one above.</div>
        ) : (
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
            {personas.map((p: any) => (
              <div class="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <div class="flex items-center justify-between mb-2">
                  <h3 class="font-semibold text-slate-800">{p.name}</h3>
                  <span class="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{p.type}</span>
                </div>
                <p class="text-sm text-slate-500 mb-1">{p.tone} · {p.language}</p>
                <p class="text-sm text-slate-600 line-clamp-2 mb-3">{p.backstory?.slice(0, 100)}...</p>
                <div class="flex gap-2">
                  <a href={`/personas/${p.id}/chat`} class="text-xs px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 no-underline">
                    Chat
                  </a>
                  <form method="POST" action={`/personas/${p.id}/delete`} style="display:inline" onsubmit="return confirm('Delete this persona?')">
                    <button class="text-xs px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 cursor-pointer">
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PersonaListPage;