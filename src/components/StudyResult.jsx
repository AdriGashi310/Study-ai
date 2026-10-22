import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { postJson } from '../api.js';
import { imagePayload } from '../photos.js';

export default function StudyResult({ result, language, t, onUpdate }) {
  const followUp = result.followUp || '';
  const followUps = result.followUps || [];
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const title = result.mode === 'summary' ? t.yourSummary : t.yourExplanation;
  const notes = [result.answer, ...followUps.map((item) => `\n${item.question}\n${item.answer}`)].join('\n');

  async function askFollowUp(question) {
    if (!question.trim() || busy) return;
    setBusy(true); setError(''); setCopied(false);
    try {
      const previousAnswer = [result.answer, ...followUps.slice(-4).map((item) => `Question: ${item.question}\nAnswer: ${item.answer}`)].join('\n\n').slice(-60000);
      const data = await postJson('/api/follow-up', {
        originalInput: result.source.input, image: imagePayload(result.source.photo),
        previousAnswer, followUp: question.trim(), language,
      });
      onUpdate({ followUps: [...followUps, { question: question.trim(), answer: data.answer }], followUp: '' });
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  async function copyNotes() {
    try { await navigator.clipboard.writeText(notes); setCopied(true); setError(''); }
    catch { setError('COPY'); }
  }
  function downloadNotes() {
    const url = URL.createObjectURL(new Blob([notes], { type: 'text/markdown;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url; link.download = 'StudyAI-notes.md'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <section className="result-card" aria-label={title}>
      <div className="result-topline"><span className="result-dot" /> {t.notes}<span className="result-mode">{t[result.mode]}</span></div>
      <div className="result-heading"><h2>{title}</h2><div className="notes-actions">
        <button className="text-button" onClick={copyNotes}>{copied ? t.copied : t.copy}</button>
        <button className="text-button" onClick={downloadNotes}>{t.download}</button>
      </div></div>
      <div className="markdown-content"><Markdown>{result.answer}</Markdown></div>
      {followUps.map((item, index) => <div className="followup-answer" key={index}>
        <div className="followup-question">{item.question}</div>
        <div className="markdown-content"><Markdown>{item.answer}</Markdown></div>
      </div>)}
      <form className="followup-form" onSubmit={(event) => { event.preventDefault(); askFollowUp(followUp); }}>
        <label htmlFor="followup-input">{t.keepExploring}</label>
        <div className="quick-followups">
          <button type="button" disabled={busy} onClick={() => askFollowUp(t.simplerQuestion)}>{t.simpler}</button>
          <button type="button" disabled={busy} onClick={() => askFollowUp(t.exampleQuestion)}>{t.example}</button>
        </div>
        <div className="followup-row">
          <input id="followup-input" type="text" value={followUp} disabled={busy} onChange={(event) => onUpdate({ followUp: event.target.value })} placeholder={t.followPlaceholder} maxLength="10000" />
          <button type="submit" disabled={busy || !followUp.trim()}>{busy ? t.thinking : t.ask}</button>
        </div>
        {busy && <p className="thinking-status" role="status">{t.thinking}</p>}
        {error && <p className="error-message" role="alert">{t.errors[error] || t.errors.FAILED}</p>}
      </form>
    </section>
  );
}
