import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

function renderInline(str, keyPrefix) {
  const parts = [];
  const regex = /\*\*(.+?)\*\*|\*(.+?)\*/g;
  let last = 0, match, i = 0;
  while ((match = regex.exec(str)) !== null) {
    if (match.index > last) parts.push(str.slice(last, match.index));
    if (match[1] !== undefined) parts.push(<strong key={`${keyPrefix}-b${i++}`}>{match[1]}</strong>);
    else parts.push(<em key={`${keyPrefix}-e${i++}`}>{match[2]}</em>);
    last = match.index + match[0].length;
  }
  if (last < str.length) parts.push(str.slice(last));
  return parts.length === 0 ? str : parts;
}

function renderMarkdown(text) {
  if (!text) return null;
  const lines = text.split('\n');
  const out = [];
  let listBuf = [];
  let listType = null;
  let k = 0;

  const flushList = () => {
    if (!listBuf.length) return;
    const Tag = listType === 'ol' ? 'ol' : 'ul';
    out.push(<Tag key={k++} style={{ margin: '4px 0 4px 18px', padding: 0 }}>{listBuf}</Tag>);
    listBuf = [];
    listType = null;
  };

  for (const line of lines) {
    const ulMatch = line.match(/^[-*] (.*)/);
    const olMatch = line.match(/^\d+\. (.*)/);
    const h3 = line.startsWith('### ');
    const h2 = line.startsWith('## ');
    const h1 = line.startsWith('# ');

    if (ulMatch) {
      if (listType === 'ol') flushList();
      listType = 'ul';
      listBuf.push(<li key={k++} style={{ lineHeight: 1.5 }}>{renderInline(ulMatch[1], k)}</li>);
    } else if (olMatch) {
      if (listType === 'ul') flushList();
      listType = 'ol';
      listBuf.push(<li key={k++} style={{ lineHeight: 1.5 }}>{renderInline(olMatch[1], k)}</li>);
    } else {
      flushList();
      if (h3) {
        out.push(<p key={k++} style={{ margin: '6px 0 2px', fontWeight: 700, fontSize: 13 }}>{renderInline(line.slice(4), k)}</p>);
      } else if (h2) {
        out.push(<p key={k++} style={{ margin: '8px 0 2px', fontWeight: 700, fontSize: 14 }}>{renderInline(line.slice(3), k)}</p>);
      } else if (h1) {
        out.push(<p key={k++} style={{ margin: '8px 0 2px', fontWeight: 700, fontSize: 15 }}>{renderInline(line.slice(2), k)}</p>);
      } else if (line.trim() === '') {
        out.push(<br key={k++} />);
      } else {
        out.push(<p key={k++} style={{ margin: '2px 0', lineHeight: 1.55 }}>{renderInline(line, k)}</p>);
      }
    }
  }
  flushList();
  return out;
}

function MarkoBotShell() {
  const { currentUser } = useAuth();
  const sessionId = currentUser?.id ?? null;

  const [messages, setMessages] = useState([
    { role: 'assistant', content: '¡Hola! Soy tu agente Marko. ¿En qué puedo ayudarte hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isHealthy, setIsHealthy] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [showHistorial, setShowHistorial] = useState(true);
  const [activeHistorialId, setActiveHistorialId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    fetch('/marko-api/health')
      .then((r) => r.json())
      .then((d) => setIsHealthy(d.status === 'ok'))
      .catch(() => setIsHealthy(false));
  }, []);


  const fetchHistorial = React.useCallback(() => {
    if (!sessionId) return;
    fetch(`/marko-api/historial?session_id=${encodeURIComponent(sessionId)}&limit=30`)
      .then((r) => r.ok ? r.json() : [])
      .then((d) => setHistorial(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    fetchHistorial();
  }, [sessionId, fetchHistorial]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  const loadConversation = (item) => {
    setActiveHistorialId(item.id);
    const msgs = Array.isArray(item.datos) && item.datos.length > 0
      ? item.datos
      : [
          { role: 'user', content: item.message },
          { role: 'assistant', content: item.respuesta },
        ];
    setMessages(msgs);
    setError(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const eliminarConversacion = async (e, id) => {
    e.stopPropagation(); // no disparar loadConversation
    try {
      await fetch(`/marko-api/historial/${id}`, { method: 'DELETE' });
      setHistorial((prev) => prev.filter((h) => h.id !== id));
      if (activeHistorialId === id) nuevaConversacion();
    } catch {}
  };

  const nuevaConversacion = () => {
    setActiveHistorialId(null);
    setMessages([{ role: 'assistant', content: '¡Hola! Soy tu agente Marko. ¿En qué puedo ayudarte hoy?' }]);
    setError(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const reintentarConexion = () => {
    setIsHealthy(null);
    fetch('/marko-api/health')
      .then((r) => r.json())
      .then((d) => {
        const healthy = d.status === 'ok';
        setIsHealthy(healthy);
        if (healthy) fetchHistorial();
      })
      .catch(() => setIsHealthy(false));
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    const sentMessage = input;
    const historySnapshot = messages; // captura antes del update optimista
    const userMsg = { role: 'user', content: sentMessage };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    try {
      const res = await fetch('/marko-api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: sentMessage,
          session_id: sessionId,
          historial_id: activeHistorialId ?? undefined,
          history: historySnapshot.length > 0 ? historySnapshot : undefined,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.respuesta }]);
      if (data.historial_id) setActiveHistorialId(data.historial_id);
      fetchHistorial();
    } catch {
      setError('No se pudo enviar el mensaje. Intenta de nuevo.');
      setMessages((prev) => prev.filter((m) => m !== userMsg));
      setInput(sentMessage);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const formatDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleString('es-ES', {
      day: '2-digit', month: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%', background: 'var(--bg)', color: 'var(--text)', overflow: 'hidden' }}>

      {/* ── CHAT PRINCIPAL ── */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>

        {/* Header */}
        <header style={{
          display: 'flex', alignItems: 'center', gap: 10,
          height: 56, padding: '0 16px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg)',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>🤖</span>
          <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)' }}>
            Asistente Marko
          </span>

          {/* Status dot */}
          <span style={{
            width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
            background: isHealthy === null ? 'var(--text3)' : isHealthy ? 'var(--green)' : 'var(--red)',
            boxShadow: isHealthy ? '0 0 0 2px var(--green-bg)' : isHealthy === false ? '0 0 0 2px var(--red-bg)' : 'none',
          }} title={isHealthy === null ? 'Verificando…' : isHealthy ? 'Conectado' : 'Sin conexión'} />

          {isHealthy === false && (
            <button onClick={reintentarConexion} style={{
              padding: '3px 10px', borderRadius: 6,
              background: 'var(--red-bg)', color: 'var(--red)',
              border: '1px solid var(--red)', fontSize: 12,
              cursor: 'pointer', fontWeight: 500,
            }}>
              Reintentar
            </button>
          )}

          {/* Espaciador */}
          <div style={{ flex: 1 }} />

          {/* Usuario activo */}
          {sessionId && (
            <span style={{
              fontSize: 12, color: 'var(--text3)',
              background: 'var(--bg3)', border: '1px solid var(--border)',
              borderRadius: 6, padding: '3px 8px', fontWeight: 500,
            }}>
              {sessionId}
            </span>
          )}

          {/* Nueva conversación */}
          <button onClick={nuevaConversacion} style={{
            padding: '5px 12px', borderRadius: 8,
            background: 'var(--bg2)', color: 'var(--text2)',
            border: '1px solid var(--border2)', fontSize: 12,
            cursor: 'pointer', fontWeight: 500,
            whiteSpace: 'nowrap',
          }}>
            + Nueva
          </button>
        </header>

        {/* Mensajes */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '24px 20px',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              alignItems: 'flex-end',
              gap: 8,
            }}>
              {/* Avatar del asistente */}
              {msg.role === 'assistant' && (
                <div style={{
                  width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                  background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15,
                }}>
                  🤖
                </div>
              )}

              {/* Burbuja */}
              <div style={{
                maxWidth: '72%',
                padding: '10px 14px',
                borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                fontSize: 14,
                wordBreak: 'break-word',
                ...(msg.role === 'user'
                  ? {
                    background: 'var(--accent)',
                    color: '#fff',
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.55,
                  }
                  : {
                    background: 'var(--bg2)',
                    color: 'var(--text)',
                    border: '1px solid var(--border)',
                  }),
              }}>
                {msg.role === 'user' ? msg.content : renderMarkdown(msg.content)}
              </div>
            </div>
          ))}

          {/* Indicador de escritura */}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
              }}>🤖</div>
              <div style={{
                padding: '10px 14px', borderRadius: '18px 18px 18px 4px',
                background: 'var(--bg2)', border: '1px solid var(--border)',
                display: 'flex', gap: 4, alignItems: 'center',
              }}>
                {[0, 1, 2].map((i) => (
                  <span key={i} style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: 'var(--text3)',
                    animation: `typing-dot 1.2s ${i * 0.2}s ease-in-out infinite`,
                  }} />
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: '8px 20px', fontSize: 13,
            color: 'var(--red)', background: 'var(--red-bg)',
            borderTop: '1px solid var(--border)',
          }}>
            {error}
          </div>
        )}

        {/* Input */}
        <form onSubmit={sendMessage} style={{
          display: 'flex', gap: 10, padding: '12px 16px',
          borderTop: '1px solid var(--border)',
          background: 'var(--bg)',
          flexShrink: 0,
        }}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading || !isHealthy}
            maxLength={2000}
            placeholder={isHealthy === false ? 'Sin conexión con el backend…' : 'Escribe tu consulta…'}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 10,
              border: '1px solid var(--border2)',
              background: 'var(--bg2)',
              color: 'var(--text)',
              fontSize: 14,
              outline: 'none',
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--accent-border)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border2)'}
          />
          <button
            type="submit"
            disabled={loading || !input.trim() || !isHealthy}
            style={{
              padding: '10px 20px',
              borderRadius: 10,
              background: 'var(--accent)',
              color: '#fff',
              fontWeight: 600,
              fontSize: 14,
              border: 'none',
              cursor: loading || !input.trim() || !isHealthy ? 'not-allowed' : 'pointer',
              opacity: loading || !input.trim() || !isHealthy ? 0.5 : 1,
              transition: 'opacity 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            {loading ? 'Enviando…' : 'Enviar'}
          </button>
        </form>
      </div>

      {/* ── HISTORIAL SIDEBAR ── */}
      <aside style={{
        flexShrink: 0,
        width: showHistorial ? 300 : 40,
        minWidth: showHistorial ? 300 : 40,
        display: 'flex',
        flexDirection: 'column',
        borderLeft: '1px solid var(--border)',
        background: 'var(--bg2)',
        transition: 'width 0.25s ease, min-width 0.25s ease',
        overflow: 'hidden',
      }}>

        {/* Header sidebar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: 56, padding: '0 12px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
          gap: 8,
        }}>
          {showHistorial && (
            <span style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: 'var(--text3)',
              whiteSpace: 'nowrap', overflow: 'hidden',
            }}>
              Historial
            </span>
          )}
          <button
            onClick={() => setShowHistorial((v) => !v)}
            style={{
              marginLeft: 'auto',
              width: 28, height: 28, borderRadius: 6,
              border: '1px solid var(--border)',
              background: 'var(--bg3)',
              color: 'var(--text3)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, flexShrink: 0,
            }}
            title={showHistorial ? 'Colapsar historial' : 'Expandir historial'}
          >
            {showHistorial ? '›' : '‹'}
          </button>
        </div>

        {/* Lista de entradas */}
        {showHistorial && (
          <div style={{
            flex: 1, overflowY: 'auto',
            padding: '12px 10px',
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            {historial.length === 0 ? (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: 8, paddingTop: 48,
                color: 'var(--text3)', fontSize: 13, textAlign: 'center',
              }}>
                <span style={{ fontSize: 28 }}>📭</span>
                <span>Sin historial aún</span>
              </div>
            ) : (
              historial.map((item, idx) => {
                const isActive = activeHistorialId === item.id;
                return (
                  <div
                    key={item.id ?? idx}
                    onClick={() => loadConversation(item)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: isActive ? '1px solid var(--accent-border)' : '1px solid var(--border)',
                      background: isActive ? 'var(--accent-bg)' : 'var(--bg)',
                      display: 'flex', flexDirection: 'column', gap: 6,
                      cursor: 'pointer',
                      transition: 'border-color 0.15s, background 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.borderColor = 'var(--border2)';
                        e.currentTarget.style.background = 'var(--bg3)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.background = 'var(--bg)';
                      }
                    }}
                  >
                    {/* Fecha */}
                    {item.created_at && (
                      <span style={{ fontSize: 11, color: 'var(--text3)', fontVariantNumeric: 'tabular-nums' }}>
                        {formatDate(item.created_at)}
                      </span>
                    )}

                    {/* Pregunta */}
                    <p style={{
                      margin: 0, fontSize: 13, fontWeight: 600,
                      color: isActive ? 'var(--accent)' : 'var(--text)',
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      lineHeight: 1.4,
                    }}>
                      {item.message}
                    </p>

                    <div style={{ height: 1, background: 'var(--border)' }} />

                    {/* Respuesta */}
                    <p style={{
                      margin: 0, fontSize: 12, color: 'var(--text2)',
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      lineHeight: 1.45,
                    }}>
                      {item.respuesta}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
                      {isActive && (
                        <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>
                          Activa · continúa escribiendo
                        </span>
                      )}
                      <button
                        onClick={(e) => eliminarConversacion(e, item.id)}
                        style={{
                          marginLeft: 'auto',
                          padding: '2px 6px',
                          borderRadius: 5,
                          border: '1px solid var(--border)',
                          background: 'transparent',
                          color: 'var(--text3)',
                          fontSize: 11,
                          cursor: 'pointer',
                          lineHeight: 1,
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.borderColor = 'var(--red)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text3)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                        title="Eliminar conversación"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </aside>

      {/* Keyframes para el indicador de escritura */}
      <style>{`
        @keyframes typing-dot {
          0%, 60%, 100% { opacity: 0.25; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-3px); }
        }
      `}</style>
    </div>
  );
}

export default MarkoBotShell;
