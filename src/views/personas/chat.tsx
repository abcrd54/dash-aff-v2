import type { FC } from "hono/jsx";
import type { JWTPayload } from "../../middleware/auth";
import Layout from "../../components/layout";

interface ChatPageProps {
  user: JWTPayload;
  personaId: string;
  personaName: string;
  persona: any;
  wsUrl: string;
  error?: string;
}

const ChatPage: FC<ChatPageProps> = ({ user, personaId, personaName, persona, wsUrl, error }) => {
  return (
    <Layout user={user} title={`Chat ${personaName}`} currentPath="/personas">
      {error && (
        <div class="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      <div class="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col" style="height: calc(100vh - 160px)">
        <div class="p-4 border-b border-slate-200 flex items-center gap-3">
          <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {personaName.charAt(0)}
          </div>
          <div>
            <div class="font-semibold text-slate-800 text-sm">{personaName}</div>
            <div class="text-xs text-slate-500">{persona.tone} · {persona.type}</div>
          </div>
        </div>

        <div id="chat-messages" class="flex-1 overflow-y-auto p-4 space-y-4"></div>

        <div class="p-4 border-t border-slate-200">
          <div class="flex gap-2">
            <textarea
              id="chat-input"
              rows="1"
              placeholder={`Chat with ${personaName}...`}
              class="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendMessage()}"
              oninput="this.style.height='auto';this.style.height=Math.min(this.scrollHeight,120)+'px'"
            ></textarea>
            <button id="send-btn" onclick="sendMessage()" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 cursor-pointer">
              Send
            </button>
          </div>
        </div>
      </div>

      <script dangerouslySetInnerHTML={{ __html: `
        const WS_URL = "${wsUrl}";
        let ws = null;
        let isStreaming = false;
        let pendingMessages = [];
        let reconnectTimer = null;

        function connectWS() {
          if (ws && ws.readyState === WebSocket.OPEN) return;
          ws = new WebSocket(WS_URL);
          ws.onopen = () => {
            console.log("WS connected");
            while (pendingMessages.length > 0) {
              ws.send(JSON.stringify(pendingMessages.shift()));
            }
          };
          ws.onmessage = (ev) => {
            try {
              const d = JSON.parse(ev.data);
              const el = document.getElementById("chat-messages");
              if (d.type === "ping") return;
              if (d.type === "chunk") {
                const last = el.lastElementChild;
                if (last && last.classList.contains("bot-msg")) {
                  last.querySelector(".content").textContent += d.content;
                } else {
                  appendBubble("bot", d.content);
                }
              } else if (d.type === "done") {
                isStreaming = false;
                document.getElementById("send-btn").disabled = false;
              } else if (d.type === "error") {
                isStreaming = false;
                document.getElementById("send-btn").disabled = false;
                appendBubble("bot", d.message, true);
              }
              el.scrollTop = el.scrollHeight;
            } catch(e) {
              console.error("WS parse error:", e);
            }
          };
          ws.onclose = () => {
            ws = null;
            isStreaming = false;
            document.getElementById("send-btn").disabled = false;
            if (reconnectTimer) clearTimeout(reconnectTimer);
            reconnectTimer = setTimeout(connectWS, 3000);
          };
          ws.onerror = () => {
            isStreaming = false;
            document.getElementById("send-btn").disabled = false;
            if (!document.querySelector(".bot-msg .content")?.textContent?.includes("WebSocket error")) {
              appendBubble("bot", "Connection lost. Reconnecting...", true);
            }
          };
        }

        function appendBubble(role, content, isError) {
          const el = document.getElementById("chat-messages");
          const div = document.createElement("div");
          div.className = "flex " + (role === "user" ? "justify-end" : "justify-start") + (role === "bot" ? " bot-msg" : "");
          div.innerHTML = '<div class="max-w-[70%] px-4 py-2 rounded-lg text-sm ' +
            (role === "user" ? "bg-blue-600 text-white" : (isError ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-800")) +
            '"><span class="content whitespace-pre-wrap">' + esc(content) + '</span></div>';
          el.appendChild(div);
        }

        function sendMessage() {
          if (isStreaming) return;
          const input = document.getElementById("chat-input");
          const msg = input.value.trim();
          if (!msg) return;
          input.value = ""; input.style.height = "auto";
          appendBubble("user", msg);
          isStreaming = true;
          document.getElementById("send-btn").disabled = true;

          if (!ws || ws.readyState !== WebSocket.OPEN) {
            pendingMessages.push({ message: msg });
            connectWS();
          } else {
            ws.send(JSON.stringify({ message: msg }));
          }
        }

        function esc(s) {
          const d = document.createElement("div");
          d.textContent = s;
          return d.innerHTML;
        }

        connectWS();
      `}} />
    </Layout>
  );
};

export default ChatPage;
