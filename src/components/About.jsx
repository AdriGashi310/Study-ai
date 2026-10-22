import React from 'react';

const members = ['Gjina Prapashtica', 'Jara Tahiri', 'Juna Buleshkaj', 'Harisa Bilalli', 'Lisa Ponosheci', 'Adri Gashi'];

export default function About({ t }) {
  return (
    <div className="about-page">
      <div className="eyebrow"><span className="eyebrow-line" /> {t.aboutEyebrow}</div>
      <h1>StudyAI</h1>
      <p className="about-lead">{t.aboutLead}</p>
      <div className="about-card">
        <h2>Tech Innovators</h2>
        <div className="member-grid">{members.map((name) => <span key={name}>{name}</span>)}</div>
      </div>
      <div className="about-card">
        <h2>{t.how}</h2>
        <div className="flow" aria-label={t.flow.join(' → ')}>
          {t.flow.map((step, index) => (
            <div className="flow-step" key={step}><span className="flow-number">{String(index + 1).padStart(2, '0')}</span>{step}{index < 5 && <span className="flow-arrow" aria-hidden="true">↓</span>}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
