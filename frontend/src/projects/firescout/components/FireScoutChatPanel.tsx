import { useEffect, useRef, useState, type FormEvent } from 'react';

export type Message = { role: 'user' | 'assistant'; content: string };
export function FireScoutMessage({ message }: { message: Message }) {
  return <p><strong>{message.role === 'user' ? 'You' : 'FireScout AI (local model)'}</strong><br />{message.content}</p>;
}
async function responseJSON(response: Response) {
  const data = await response.json().catch(() => ({ error: 'Backend connection lost — start the simulator and retry.' }));
  if (!response.ok) throw new Error(data.error || 'Backend unavailable. Retry shortly.');
  return data;
}

export function FireScoutChatPanel({ sessionId, stopped }: { sessionId?: string; stopped: boolean }) {
  const [open, setOpen] = useState(false);
  const [models, setModels] = useState<string[]>([]);
  const [model, setModel] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [snapshot, setSnapshot] = useState<{ facts: string[]; timestamp: string; stale: boolean } | null>(null);
  const [pending, setPending] = useState('');
  const [busy, setBusy] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [error, setError] = useState('');
  const [retryQuestion, setRetryQuestion] = useState('');
  const input = useRef<HTMLTextAreaElement>(null);
  const request = useRef<AbortController>();
  const modelRequest = useRef<AbortController>();
  useEffect(() => () => { request.current?.abort(); modelRequest.current?.abort(); }, []);
  async function loadModels() {
    modelRequest.current?.abort();
    const abort = new AbortController(); modelRequest.current = abort;
    setLoadingModels(true); setError('');
    try {
      const data = await fetch('/api/firescout/models', { signal: abort.signal }).then(responseJSON);
      if (abort.signal.aborted) return;
      setModels(data.models); setModel(previous => data.models.includes(previous) ? previous : data.default ?? data.models[0] ?? '');
      if (!data.models.length) setError(data.notice || 'Model unavailable — install a local Ollama model.');
    } catch (e) { if (!abort.signal.aborted) setError(e instanceof Error ? e.message : 'Ollama connection lost.'); }
    finally { if (!abort.signal.aborted) setLoadingModels(false); }
  }
  useEffect(() => { if (open) { void loadModels(); input.current?.focus(); } }, [open]);
  async function ask(question: string) {
    if (!question.trim() || busy || !model || !sessionId || stopped) return;
    const abort = new AbortController(); request.current = abort;
    setBusy(true); setPending(question); setError(''); setRetryQuestion('');
    const conversation: Message[] = [...messages.slice(-8).map(message => ({ ...message, content: message.content.slice(0, 900) })), { role: 'user', content: question.trim() }];
    const timer = setTimeout(() => abort.abort(), 125000);
    try {
      const data = await fetch('/api/firescout/chat', { method: 'POST', signal: abort.signal,
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId, model, messages: conversation }) }).then(responseJSON);
      if (abort.signal.aborted || data.sessionId !== sessionId) return;
      setSnapshot({ facts: data.recordedFacts ?? [], timestamp: data.contextTimestamp, stale: data.contextStale });
      setMessages([...conversation, { role: 'assistant' as const, content: data.message }].slice(-10)); setDraft('');
    } catch (e) {
      setError(abort.signal.aborted ? 'Request cancelled or timed out. Retry when ready.' : e instanceof Error ? e.message : 'Connection lost. Retry.');
      setRetryQuestion(question);
    } finally { clearTimeout(timer); if (request.current === abort) { setBusy(false); setPending(''); } }
  }
  const submit = (event: FormEvent) => { event.preventDefault(); void ask(draft); };
  return <div className="fs-chat">
    <button className="fs-chat-toggle" aria-expanded={open} aria-controls="firescout-chat" onClick={() => setOpen(!open)}>Ask FireScout AI</button>
    {open && <section id="firescout-chat" aria-label="Ask FireScout AI local analyst">
      <p><strong>Local Ollama analyst · no RAG</strong><br />Informational demo only. Answers may be inaccurate; verify claims. Current known SIMULATED mission context only. No flight or rescue commands.</p>
      <label htmlFor="firescout-model">Installed local model</label><select id="firescout-model" value={model} onChange={e => setModel(e.target.value)} disabled={busy || loadingModels}>
        {!models.length && <option value="">Model unavailable</option>}{models.map(name => <option key={name}>{name}</option>)}</select>
      <button onClick={() => void loadModels()} disabled={busy || loadingModels}>{loadingModels ? 'Checking Ollama…' : 'Refresh models'}</button>
      {(!sessionId || stopped) && <p role="status">Run a FireScout scenario before asking about its telemetry.</p>}
      {snapshot && <p className="fs-notice"><strong>Recorded snapshot · SIMULATED{snapshot.stale ? ' · STALE / LAST KNOWN' : ''}</strong><br />{snapshot.facts.join(' ')}<br /><small>{snapshot.timestamp} · These recorded values take precedence over model prose.</small></p>}
      <div className="fs-chat-log" role="log" aria-live="polite" aria-label="FireScout conversation">
        {messages.map((message, i) => <FireScoutMessage key={i} message={message} />)}
        {busy && <p><strong>You</strong><br />{pending}<br /><em>FireScout AI is generating a response…</em></p>}
      </div>
      {error && <p role="status" className="fs-notice">{error}</p>}
      <form onSubmit={submit}>
        <label>Your question<textarea ref={input} value={draft} maxLength={2000} rows={3} onChange={e => setDraft(e.target.value)} placeholder="What does the current wind reading mean?" /></label>
        <div className="fs-toolbar"><button type="submit" disabled={busy || !model || !draft.trim() || !sessionId || stopped}>Send question</button>
          {busy && <button type="button" onClick={() => request.current?.abort()}>Cancel response</button>}
          {retryQuestion && !busy && <button type="button" onClick={() => void ask(retryQuestion)} disabled={!model || stopped}>Retry question</button>}</div>
      </form>
      <small>Chat clears on project, scenario or session reset. Telemetry is read by the backend; this chat cannot control the UAV.</small>
    </section>}
  </div>;
}
