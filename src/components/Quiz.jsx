import React from 'react';

export default function Quiz({ result, onUpdate, onTryAgain, busy, t }) {
  const questions = result.quiz;
  const { index = 0, choices = [] } = result.progress || {};
  const selected = choices[index] ?? null;
  const score = choices.reduce((total, choice, number) => total + (choice === questions[number].correctAnswer ? 1 : 0), 0);
  const complete = index === questions.length;
  const question = questions[index];

  function choose(answerIndex) {
    if (selected !== null) return;
    onUpdate({ progress: { index, choices: [...choices, answerIndex] } });
  }

  function next() {
    onUpdate({ progress: { index: index + 1, choices } });
  }

  return (
    <section className="result-card quiz-card" aria-label={t.practice}>
      <div className="result-topline"><span className="result-dot" /> {t.practice}</div>
      {complete ? (
        <div className="quiz-complete">
          <h2>{t.complete}</h2>
          <p><strong>{score} / {questions.length} {t.correctCount}</strong></p>
          <div className="score-percent">{Math.round((score / questions.length) * 100)}%</div>
          <button className="primary-button" onClick={onTryAgain} disabled={busy}>
            {busy && <span className="spinner" aria-hidden="true" />}
            {busy ? t.generating : t.tryAgain}
          </button>
          <details className="quiz-review"><summary>{t.review}</summary>
            {questions.map((item, number) => <div className="review-item" key={number}>
              <strong>{number + 1}. {item.question}</strong>
              <p className={choices[number] === item.correctAnswer ? 'review-correct' : 'review-incorrect'}>{t.yourAnswer}: {item.options[choices[number]]}</p>
              {choices[number] !== item.correctAnswer && <p>{t.correctAnswer}: {item.options[item.correctAnswer]}</p>}
              <p>{item.explanation}</p>
            </div>)}
          </details>
        </div>
      ) : (
        <>
          <div className="quiz-progress"><span>{t.question} {index + 1} {t.of} {questions.length}</span><span>{Math.round((index / questions.length) * 100)}% {t.progress}</span></div>
          <div className="progress-track"><span style={{ width: `${(index / questions.length) * 100}%` }} /></div>
          <h2 className="quiz-question">{question.question}</h2>
          <div className="answers">
            {question.options.map((option, answerIndex) => {
              const correct = selected !== null && answerIndex === question.correctAnswer;
              const incorrect = selected === answerIndex && answerIndex !== question.correctAnswer;
              return (
                <button
                  className={`answer ${correct ? 'correct' : ''} ${incorrect ? 'incorrect' : ''}`}
                  key={`${option}-${answerIndex}`}
                  onClick={() => choose(answerIndex)}
                  disabled={selected !== null}
                >
                  <span className="answer-letter">{String.fromCharCode(65 + answerIndex)}</span>
                  <span>{option}</span>
                  {correct && <span className="answer-status">✓</span>}
                  {incorrect && <span className="answer-status">×</span>}
                </button>
              );
            })}
          </div>
          {selected !== null && (
            <div className="quiz-feedback" role="status">
              <strong>{selected === question.correctAnswer ? t.correct : `${t.correctAnswer}: ${question.options[question.correctAnswer]}`}</strong>
              <p>{question.explanation}</p>
              <button className="primary-button" onClick={next}>{index === questions.length - 1 ? t.results : t.next} <span aria-hidden="true">→</span></button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
