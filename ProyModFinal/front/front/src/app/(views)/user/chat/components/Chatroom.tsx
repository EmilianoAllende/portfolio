"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { Send } from "lucide-react";
import { useChatStore } from "@/stores/chatStore";
import { useAuthStore } from "@/stores/authStore";
import api from "@/lib/axiosInstance";
import { IAuthMeUser } from "@/interfaces/index";

function getRoomId(userId1: string, userId2: string): string {
  const [a, b] = [userId1, userId2].sort();
  return `${a}__${b}`;
}

export default function ChatRoomLayout() {
  const { messages, connect, disconnect, joinRoom, leaveRoom, sendMessage, resetMessages } = useChatStore();
  const user = useAuthStore((state) => state.user);
  
  const [chatUsers, setChatUsers] = useState<IAuthMeUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previousRoomRef = useRef<string | null>(null);

  const tenantSlug = "nivo-a";

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/employees/list");
        setChatUsers(response.data);
        setError(null);
      } catch (err) {
        console.error("Error al obtener la lista de empleados:", err);
        setError("No se pudo cargar la lista de chats.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (tenantSlug) {
      connect(tenantSlug);
    }
    return () => {
      disconnect();
    };
  }, [tenantSlug, connect, disconnect]);

  useEffect(() => {
    if (!activeRoom || !user?.userId) return;

    const newRoom = getRoomId(user.userId, activeRoom);

    if (previousRoomRef.current && previousRoomRef.current !== newRoom) {
      leaveRoom(previousRoomRef.current);
      resetMessages(previousRoomRef.current);
    }

    joinRoom(newRoom);
    previousRoomRef.current = newRoom;
    
  }, [activeRoom, user?.userId, joinRoom, leaveRoom, resetMessages]);

  const currentRoomName = useMemo(() => {
    if (activeRoom && user?.userId) {
      return getRoomId(user.userId, activeRoom);
    }
    return null;
  }, [activeRoom, user?.userId]);

  const handleSend = () => {
    if (!message.trim() || !currentRoomName) return;
    sendMessage(message, currentRoomName);
    setMessage("");
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const filteredEmployees = useMemo(
    () => chatUsers.filter((employee) => employee.userId !== user?.userId),
    [chatUsers, user?.userId]
  );

  return (
    <div
      className="flex text-[#444141]"
      style={{
        height: "calc(100dvh - 64px)",
        backgroundColor: "var(--color-background-light, #F4F3F8)",
      }}
    >
      <aside className="w-80 flex-shrink-0 bg-white border-r border-[#f0f2f1]">
        <div className="p-4 border-b border-[#f0f2f1]">
          <h2 className="text-xl font-semibold text-[#0d0d0d]">Chats</h2>
        </div>
        <div className="overflow-y-auto">
          {isLoading ? (
            <p className="p-4 text-gray-500">Cargando contactos...</p>
          ) : error ? (
            <p className="p-4 text-red-500">{error}</p>
          ) : (
            filteredEmployees.map((employee) => {
              if (!employee.userId) return null;
              return (
                <div
                  key={employee.userId}
                  onClick={() => setActiveRoom(employee.userId)}
                  className={`p-4 cursor-pointer hover:bg-[#f0f2f1] flex items-center gap-4 ${
                    activeRoom === employee.userId
                      ? "bg-[#6d5cc42d] border-r-4 border-[#6e5cc4]"
                      : ""
                  }`}
                >
                  <div>
                    <p className="font-semibold text-[#0d0d0d]">{employee.name}</p>
                    <p className="text-sm text-[#777] truncate">{employee.email}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        {activeRoom ? (
          <>
            <header className="p-4 bg-white border-b border-[#f0f2f1]">
              <p className="text-lg font-semibold text-[#0d0d0d]">
                {chatUsers.find((u) => u.userId === activeRoom)?.name ?? "Conversación"}
              </p>
            </header>

            <div className="flex-grow p-6 overflow-y-auto">
              {(currentRoomName && messages[currentRoomName] || []).map((msg, idx) => {
                const isOwn = msg.user === user?.name;
                return (
                  <div
                    key={idx}
                    className={`flex flex-col mb-4 ${isOwn ? "items-end" : "items-start"}`}
                  >
                    <span className="text-sm text-[#999] mb-1">{isOwn ? "Yo" : msg.user}</span>
                    <div
                      className={`p-3 rounded-lg max-w-[70%] shadow-sm ${
                        isOwn
                          ? "bg-[#6e5cc4] text-white rounded-br-none"
                          : "bg-[#e8e2fa] text-[#444141] rounded-bl-none"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                      <p
                        className={`text-xs mt-1 text-right ${
                          isOwn ? "text-white/80" : "text-[#777]"
                        }`}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <footer className="p-4 bg-[#ffffff] border-t border-[#f0f2f1]">
              <div className="flex items-end gap-2 rounded-xl bg-[#f0f2f1] p-2 relative">
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribe un mensaje..."
                  rows={1}
                  className="flex-1 resize-none bg-transparent text-[#444141] outline-none max-h-32 overflow-y-auto pr-10"
                />
                <button
                  onClick={handleSend}
                  className="absolute right-2 bottom-2 text-[#6e5cc4] hover:text-[#4e4090] cursor-pointer"
                >
                  <Send size={25} />
                </button>
              </div>
            </footer>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-center text-[#888] px-4">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Bienvenido a NIVO</h2>
              <p>Seleccioná una conversación para comenzar a chatear</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}