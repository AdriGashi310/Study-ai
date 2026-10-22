import { useEffect, useState } from 'react';
import { translations } from './i18n.js';
import { postJson } from './api.js';

export default function useTranslation(language) {
  const [remote, setRemote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    if (translations[language]) { setLoading(false); return; }
    const key = `studyai-translation-v1-${language}`;
    try {
      const cached = JSON.parse(localStorage.getItem(key));
      if (cached?.welcome && cached?.errors) { setRemote({ language, text: cached }); setLoading(false); return; }
    } catch { /* Cache is optional. */ }
    setLoading(true);
    postJson('/api/translate', { language }).then(({ text }) => {
      if (cancelled) return;
      setRemote({ language, text });
      try { localStorage.setItem(key, JSON.stringify(text)); } catch { /* Optional cache. */ }
    }).catch(() => { if (!cancelled) setFailed(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [language, retry]);
  return { t: translations[language] || (remote?.language === language ? remote.text : translations.en), loading, failed, retry: () => setRetry(n => n + 1) };
}
