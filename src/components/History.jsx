import React from 'react';
import { photoUrl } from '../photos.js';

export default function History({ sessions, t, language, onOpen, onDelete }) {
  return (
    <section className="history-card" aria-label={t.history}>
      <h2>{t.history}</h2><p className="history-info">{t.historyHint}</p>
      {!sessions.length && <p className="history-empty">{t.noHistory}</p>}
      <div className="history-list">
        {sessions.map((session) => <div className="history-item" key={session.id}>
          <button className="history-open" onClick={() => onOpen(session)}>
            {session.source.photo && <img src={photoUrl(session.source.photo)} alt="" />}
            <span><strong>{session.source.input || session.source.photo?.name || t.photoAlt}</strong>
              <small>{t[session.mode]} · {new Intl.DateTimeFormat(language === 'sq' ? 'sq-AL' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(session.createdAt)}</small>
            </span>
          </button>
          <button className="text-button history-delete" aria-label={`${t.deleteStudy}: ${session.source.input || session.source.photo?.name}`} onClick={() => onDelete(session.id)}>{t.deleteStudy}</button>
        </div>)}
      </div>
    </section>
  );
}
