import React, { useEffect, useRef, useState } from 'react';
import { photoUrl } from '../photos.js';

export default function StudyInput({ t, language, input, onInput, mode, onMode, length, onLength, photo, onPhoto, onRemovePhoto, photoBusy, onGenerate, busy, error }) {
  const recognition = useRef(null);
  const latest = useRef({ input, onInput });
  latest.current = { input, onInput };
  const [listening, setListening] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  useEffect(() => {
    setListening(false); setVoiceError('');
    return () => {
      if (recognition.current) {
        recognition.current.onresult = null;
        recognition.current.onend = null;
        recognition.current.onerror = null;
        recognition.current.abort();
      }
    };
  }, [language]);
  function toggleVoice() {
    if (listening) { recognition.current?.stop(); return; }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setVoiceError('voiceUnavailable'); return; }
    const session = new SpeechRecognition();
    recognition.current = session;
    session.lang = language === 'sq' ? 'sq-AL' : language;
    session.continuous = true;
    session.interimResults = false;
    session.onresult = (event) => {
      let words = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) words += event.results[i][0].transcript + ' ';
      }
      if (words.trim()) {
        const value = `${latest.current.input.trim()} ${words.trim()}`.trim().slice(0, 20000);
        latest.current.input = value;
        latest.current.onInput(value);
      }
    };
    session.onerror = (event) => setVoiceError(event.error === 'not-allowed' ? 'voiceDenied' : 'voiceFailed');
    session.onend = () => setListening(false);
    setVoiceError('');
    try { session.start(); setListening(true); }
    catch { setVoiceError('voiceFailed'); }
  }
  const fileInput = useRef(null);
  const cameraInput = useRef(null);
  const disabled = busy || photoBusy;
  const modes = [
    { value: 'explain', label: t.explain, description: t.explainHint },
    { value: 'summary', label: t.summary, description: t.summaryHint },
    { value: 'quiz', label: t.quiz, description: t.quizHint },
  ];
  function selectFile(event) {
    onPhoto(event.target.files?.[0]);
    event.target.value = '';
  }
  function pastePhoto(event) {
    const file = [...event.clipboardData.items].find((item) => item.type.startsWith('image/'))?.getAsFile();
    if (file && !listening) { event.preventDefault(); onPhoto(file); }
  }

  return (
    <section className="input-card" aria-label={t.request} onPaste={pastePhoto}
      onDragOver={(event) => { if (event.dataTransfer.types.includes('Files')) event.preventDefault(); }}
      onDrop={(event) => { if (event.dataTransfer.files.length) { event.preventDefault(); onPhoto(event.dataTransfer.files[0]); } }}>
      <label className="field-label" htmlFor="study-input">{t.topic}</label>
      <textarea id="study-input" value={input} disabled={disabled} onChange={(event) => onInput(event.target.value)}
        placeholder={t.placeholder} rows="4" maxLength="20000"
        onKeyDown={(event) => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); if (!listening) onGenerate(); } }}
        aria-describedby={error ? 'input-error' : undefined} aria-invalid={Boolean(error)} />
      <div className="photo-tools">
        <input hidden ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={selectFile} disabled={disabled} />
        <input hidden ref={cameraInput} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={selectFile} disabled={disabled} />
        <button className="secondary-button" disabled={disabled} onClick={() => fileInput.current.click()}>{t.addPhoto}</button>
        <button className="secondary-button camera-button" disabled={disabled} onClick={() => cameraInput.current.click()}>{t.takePhoto}</button>
        <button type="button" className={`secondary-button ${listening ? 'voice-active' : ''}`} disabled={disabled} aria-pressed={listening} onClick={toggleVoice}>{listening ? t.stopVoice : t.voice}</button>
        {listening && <span role="status">{t.listening}</span>}
        {photoBusy && <span role="status">{t.processing}</span>}
      </div>
      <p className="photo-hint">{t.photoHint}</p>
      <p className="photo-hint">{t.voiceHint}</p>
      {voiceError && <p className="error-message" role="alert">{t[voiceError]}</p>}
      {photo && <div className="photo-preview">
        <img src={photoUrl(photo)} alt={t.photoAlt} />
        <div><strong>{photo.name}</strong><p>{t.photoPrivacy}</p></div>
        <button className="text-button" disabled={disabled} onClick={onRemovePhoto}>{t.removePhoto}</button>
      </div>}
      <div className="mode-heading">{t.chooseMode}</div>
      <div className="mode-list" role="group" aria-label={t.chooseMode}>
        {modes.map((item) => (
          <label className={`mode-option ${mode === item.value ? 'selected' : ''}`} key={item.value} title={item.description}>
            <input className="native-radio" type="radio" name="mode" value={item.value} checked={mode === item.value} disabled={disabled} onChange={() => onMode(item.value)} />
            <span><strong>{item.label}</strong></span>
          </label>
        ))}
      </div>
      {mode !== 'quiz' && <div className="length-row"><label htmlFor="answer-length">{t.length}</label>
        <select id="answer-length" value={length} onChange={(event) => onLength(event.target.value)} disabled={disabled}>
          <option value="brief">{t.brief}</option><option value="standard">{t.standard}</option><option value="detailed">{t.detailed}</option>
        </select>
      </div>}
      <div className="input-footer">
        <div><p id="input-error" className="error-message" role={error ? 'alert' : undefined}>{error}</p>{!error && <span className="shortcut">{t.shortcut}</span>}</div>
        <button className="primary-button" onClick={onGenerate} disabled={disabled || listening}>
          {busy && <span className="spinner" aria-hidden="true" />}{busy ? t.generating : t.generate}
          {!busy && <span aria-hidden="true" className="button-arrow">→</span>}
        </button>
      </div>
    </section>
  );
}
