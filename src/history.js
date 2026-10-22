// IndexedDB stores photos and notes locally, without accounts or a server database.
let database;
function openDatabase() {
  if (!database) database = new Promise((resolve, reject) => {
    const request = indexedDB.open('studyai-history', 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore('sessions', { keyPath: 'id' });
      request.result.createObjectStore('workspace');
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => { database = null; reject(request.error); };
    request.onblocked = () => { database = null; reject(new Error('Storage blocked')); };
  });
  return database;
}

export async function loadHistory() {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['sessions', 'workspace'], 'readonly');
    const sessions = transaction.objectStore('sessions').getAll();
    const workspace = transaction.objectStore('workspace').get('current');
    transaction.oncomplete = () => resolve({
      sessions: sessions.result.sort((a, b) => b.createdAt - a.createdAt),
      workspace: workspace.result,
    });
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

export async function saveWorkspace(workspace) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['sessions', 'workspace'], 'readwrite');
    transaction.objectStore('workspace').put(workspace, 'current');
    if (workspace.result) transaction.objectStore('sessions').put(workspace.result);
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

export async function deleteSession(id) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('sessions', 'readwrite');
    transaction.objectStore('sessions').delete(id);
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}
