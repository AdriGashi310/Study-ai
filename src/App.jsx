import React, { useEffect, useRef, useState } from 'react';
import StudyInput from './components/StudyInput.jsx';
import StudyResult from './components/StudyResult.jsx';
import Quiz from './components/Quiz.jsx';
import History from './components/History.jsx';
import { loadHistory, saveWorkspace, deleteSession } from './history.js';
import useTranslation from './useTranslation.js';
import { languageCodes, languageName } from './languages.js';
import { postJson } from './api.js';
import { imagePayload, preparePhoto } from './photos.js';

export default function App() {
  const [page, setPage] = useState('welcome');
  const [language, setLanguage] = useState(() => {
    try { const saved = localStorage.getItem('studyai-language'); return languageCodes.includes(saved) ? saved : 'sq'; }
    catch { return 'sq'; }
  });
  const [input, setInput] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [mode, setMode] = useState('explain');
  const [length, setLength] = useState('standard');
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const photoVersion = useRef(0);
  const { t, loading: translating, failed: translationFailed, retry: retryTranslation } = useTranslation(language);

  useEffect(() => {
    let cancelled = false;
    loadHistory().then(({ sessions, workspace }) => {
      if (cancelled) return;
      setHistory(sessions);
      if (workspace) {
        setInput(workspace.input || ''); setPhoto(workspace.photo || null);
        setMode(workspace.mode || 'explain'); setLength(workspace.length || 'standard');
        setResult(workspace.result || null);
      }
    }).catch(() => { if (!cancelled) setStorageError(true); })
      .finally(() => { if (!cancelled) setReady(true); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveWorkspace({ input, photo, mode, length, result }).then(() => {
      setStorageError(false);
      if (result) setHistory((items) => [result, ...items.filter((item) => item.id !== result.id)].sort((a, b) => b.createdAt - a.createdAt));
    }).catch(() => setStorageError(true));
  }, [ready, input, photo, mode, length, result]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = ['ar', 'he', 'fa', 'ur', 'ps', 'sd', 'yi', 'ug', 'dv'].includes(language) ? 'rtl' : 'ltr';
    try { localStorage.setItem('studyai-language', language); } catch { /* Optional preference storage. */ }
  }, [language]);

  async function addPhoto(file) {
    if (!file || busy || photoBusy) return;
    const version = ++photoVersion.current;
    setPhotoBusy(true); setError('');
    try {
      const prepared = await preparePhoto(file);
      if (version === photoVersion.current) setPhoto(prepared);
    } catch (err) { setError(err.message); }
    finally { if (version === photoVersion.current) setPhotoBusy(false); }
  }

  async function generate(retry = false) {
    if (busy || photoBusy) return;
    // A new quiz keeps the original material, even after editing the input.
    const source = retry ? result.source : { input: input.trim(), photo };
    const requestMode = retry ? 'quiz' : mode;
    if (!source.input && !source.photo) { setError('EMPTY_INPUT'); return; }
    setError(''); setBusy(true);
    try {
      const data = await postJson('/api/generate', {
        input: source.input, image: imagePayload(source.photo), mode: requestMode,
        language, length, previousQuestions: retry ? result.quiz.map((item) => item.question) : [],
      });
      setResult({ id: crypto.randomUUID(), createdAt: Date.now(), source, mode: requestMode, length,
        type: requestMode === 'quiz' ? 'quiz' : 'answer', ...data });
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  function changeMode(nextMode) {
    setMode(nextMode); setResult(null); setError('');
  }

  function updateResult(id, changes) {
    setResult((current) => current?.id === id ? { ...current, ...changes } : current);
  }
  function openSession(session) {
    setInput(session.source.input); setPhoto(session.source.photo || null);
    setMode(session.mode); setLength(session.length || 'standard'); setResult(session);
    setError(''); setHistoryOpen(false);
  }
  async function removeSession(id) {
    try {
      await deleteSession(id);
      setHistory((items) => items.filter((item) => item.id !== id));
      if (result?.id === id) setResult(null);
    } catch { setStorageError(true); }
  }
  function newStudy() {
    setInput(''); setPhoto(null); setResult(null); setError('');
  }

  return (
    <div className={`site-shell ${page === 'welcome' ? 'home-shell' : ''}`}>
      <header className="header wrap">
        <button className="brand" onClick={() => setPage('welcome')} aria-label={t.home}>
          <span className="brand-mark" aria-hidden="true"><span /></span>
          <span className="brand-copy"><strong>StudyAI</strong><small>{t.tagline}</small></span>
        </button>
        <div className="header-actions">
          {page !== 'welcome' && <button className="about-link" onClick={() => setPage('welcome')}>{t.menu}</button>}
          <select aria-label={t.language} value={language} disabled={busy} onChange={(event) => setLanguage(event.target.value)}>
            {languageCodes.map(code => <option key={code} value={code}>{code === 'sq' ? 'Shqip' : languageName(code)}</option>)}
          </select>
        </div>
      </header>
      <main className="main wrap">
        {translating && <p className="translation-status" role="status">Translating… · {languageName(language)}</p>}
        {translationFailed && <p className="translation-status" role="alert">Translation unavailable. Showing English. <button className="text-button" onClick={retryTranslation}>Retry</button></p>}
        {page === 'welcome' ? <section className="welcome">
          <svg className="welcome-book" viewBox="0 0 64 56" fill="none" aria-hidden="true"><path d="M32 12C23 4 12 5 4 6v39c11-2 21 0 28 6m0-39c9-8 20-7 28-6v39c-11-2-21 0-28 6m0-39v39" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <h1>{t.welcome}</h1><p className="welcome-lead">{t.welcomeIntro}</p>
          <button className="primary-button" disabled={!ready || translating} onClick={() => setPage('study')}>{t.startStudy} <span aria-hidden="true">→</span></button>
        </section> : (
          <>
            <div className="intro">
              <h1>{t.heading}</h1><p>{t.intro}</p>
            </div>
            <div className="study-toolbar">
              <button className="secondary-button" disabled={busy || photoBusy || !ready} aria-expanded={historyOpen} onClick={() => setHistoryOpen(!historyOpen)}>{t.history} <span>{history.length}</span></button>
              <button className="text-button" disabled={busy || photoBusy || !ready} onClick={newStudy}>{t.newStudy}</button>
            </div>
            {storageError && <p className="storage-error" role="status">{t.errors.STORAGE}</p>}
            {historyOpen && <History sessions={history} t={t} language={language} onOpen={openSession} onDelete={removeSession} />}
            {!ready ? <p role="status">{t.loadingHistory}</p> : <StudyInput t={t} language={language} input={input} onInput={(value) => { setInput(value); setError(''); }}
              mode={mode} onMode={changeMode} length={length} onLength={setLength}
              photo={photo} onPhoto={addPhoto} onRemovePhoto={() => setPhoto(null)} photoBusy={photoBusy}
              onGenerate={() => generate()} busy={busy} error={error ? (t.errors[error] || t.errors.FAILED) : ''} />}
            {result?.type === 'answer' && <StudyResult key={result.id} result={result} language={language} t={t} onUpdate={(changes) => updateResult(result.id, changes)} />}
            {result?.type === 'quiz' && <Quiz key={result.id} result={result} onUpdate={(changes) => updateResult(result.id, changes)} onTryAgain={() => generate(true)} busy={busy} t={t} />}
          </>
        )}
      </main>
      {page !== 'welcome' && <footer className="footer wrap">StudyAI <span>·</span> Tech Innovators <span>·</span> 2026</footer>}
    </div>
  );
}
