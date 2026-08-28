import React, { useState, useRef, useEffect } from 'react';

const initialMessages = [
  {
    role: 'assistant',
    content: '¡Hola! Soy tu agente. ¿En qué puedo ayudarte hoy?'
  }
];

function ChatBotShell() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(() => {
    // Puedes cambiar esto por el userId real si lo tienes
    return 'chat-' + Math.random().toString(36).slice(2, 10);
  });
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    const userMsg = { role: 'user', content: input };
    setMessages((msgs) => [...msgs, userMsg]);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          session_id: sessionId
        })
      });
      if (!res.ok) throw new Error('Error en el servidor');
      const data = await res.json();
      setMessages((msgs) => [
        ...msgs,
        { role: 'assistant', content: data.respuesta }
      ]);
      setInput('');
    } catch (err) {
      setError('No se pudo enviar el mensaje.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] rounded-md shadow-lg">
      <header className="flex items-center h-12 px-4 border-b border-[var(--border)] font-mono text-[14px] tracking-[0.18em]">
        marko<span className="text-[var(--accent)]">_</span>chatbot
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 marko-scrollbar">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`max-w-[80%] px-3 py-2 rounded-lg text-[13px] whitespace-pre-line ${
              msg.role === 'user'
                ? 'ml-auto bg-[var(--accent-bg)] text-[var(--accent)]'
                : 'bg-[var(--bg2)] text-[var(--text)]'
            }`}
          >
            {msg.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {error && (
        <div className="px-4 py-2 text-[12px] text-[var(--red)]">{error}</div>
      )}
      <form
        onSubmit={sendMessage}
        className="flex items-center gap-2 p-3 border-t border-[var(--border)] bg-[var(--bg)]"
      >
        <input
          type="text"
          className="flex-1 rounded border border-[var(--border)] bg-[var(--bg3)] px-3 py-2 text-[13px] outline-none focus:border-[var(--accent-border)]"
          placeholder="Escribe tu mensaje..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          maxLength={2000}
        />
        <button
          type="submit"
          className="rounded px-4 py-2 bg-[var(--accent)] text-white font-medium disabled:opacity-60"
          disabled={loading || !input.trim()}
        >
          {loading ? '...' : 'Enviar'}
        </button>
      </form>
    </div>
  );
}

export default ChatBotShell;
