// The backend returns error codes so the interface can show them in either language.
export async function postJson(url, body) {
  let response;
  try {
    response = await fetch(url, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
  } catch {
    throw new Error('NETWORK');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.code || 'FAILED');
  return data;
}
