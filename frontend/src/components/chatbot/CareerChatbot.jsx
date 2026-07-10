import { useEffect, useMemo, useState } from 'react';
import api from '../../utils/api';

export default function CareerChatbot() {
    const [sessions, setSessions] = useState([]);
    const [activeSession, setActiveSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [draft, setDraft] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const loadSessions = async () => {
        try {
            const { data } = await api.get('/chatbot/sessions');
            setSessions(data);
            if (!activeSession && data[0]) {
                setActiveSession(data[0]);
            }
        } catch {
            setSessions([]);
        }
    };

    const loadMessages = async (sessionId) => {
        try {
            const { data } = await api.get(`/chatbot/sessions/${sessionId}`);
            setMessages(data.messages || []);
        } catch {
            setMessages([]);
        }
    };

    useEffect(() => {
        const init = async () => {
            await loadSessions();
            setLoading(false);
        };
        void init();
    }, []);

    useEffect(() => {
        if (activeSession?.id) {
            void loadMessages(activeSession.id);
        }
    }, [activeSession]);

    const selectedSession = useMemo(() => sessions.find(session => session.id === activeSession?.id) || null, [activeSession, sessions]);

    const handleNewChat = async () => {
        try {
            const { data } = await api.post('/chatbot/sessions', { title: 'New Chat' });
            setActiveSession(data);
            setMessages([]);
            await loadSessions();
        } catch {
            // no-op
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!draft.trim()) return;
        setSubmitting(true);
        try {
            const payload = { sessionId: activeSession?.id, content: draft.trim() };
            const { data } = await api.post('/chatbot/messages', payload);
            setMessages(prev => [...prev, { role: 'user', content: draft.trim() }, { role: 'assistant', content: data.message?.content || '' }]);
            setDraft('');
            await loadSessions();
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: 'I could not respond right now. Please try again.' }]);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="card">Loading career assistant…</div>;

    return (
        <div style={{ display: 'grid', gap: '16px' }}>
            <div className="page-header">
                <h2>AI Career Chatbot</h2>
                <p>Ask for resume feedback, role guidance, skill planning, and interview prep.</p>
            </div>

            <div className="cards-grid">
                <div className="card" style={{ minWidth: 260 }}>
                    <button className="btn btn-primary" style={{ width: '100%', marginBottom: '12px' }} onClick={handleNewChat}>+ New Chat</button>
                    <div style={{ display: 'grid', gap: '8px' }}>
                        {sessions.map(session => (
                            <button key={session.id} className={`btn btn-ghost ${selectedSession?.id === session.id ? 'active' : ''}`} style={{ textAlign: 'left' }} onClick={() => setActiveSession(session)}>
                                {session.title}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="card" style={{ minHeight: 420 }}>
                    <div style={{ minHeight: 320, display: 'grid', gap: '8px', marginBottom: '12px' }}>
                        {messages.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>Start a conversation to get personalized suggestions.</p>}
                        {messages.map((msg, index) => (
                            <div key={`${msg.role}-${index}`} style={{ padding: '10px 12px', borderRadius: '10px', background: msg.role === 'assistant' ? 'var(--surface)' : 'rgba(37, 99, 235, 0.08)' }}>
                                <strong>{msg.role === 'assistant' ? 'CampusHire AI' : 'You'}</strong>
                                <div style={{ marginTop: '4px', whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px' }}>
                        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Ask about roles, interviews, or your next step" style={{ flex: 1 }} />
                        <button className="btn btn-primary" disabled={submitting}>{submitting ? '...' : 'Send'}</button>
                    </form>
                </div>
            </div>
        </div>
    );
}
