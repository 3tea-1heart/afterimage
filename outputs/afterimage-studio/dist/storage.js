// Local draft persistence. IndexedDB keeps multi-megabyte base64 photos out of localStorage.
const DB = 'afterimage-studio', STORE = 'drafts', KEY = 'current';
let opening = null;

function openDb() {
  if (!opening) opening = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return opening;
}

function run(mode, act) {
  return openDb().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode), store = tx.objectStore(STORE);
    act(store);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  }));
}

export async function saveDraft(doc) {
  try { await run('readwrite', s => s.put(doc, KEY)); return true; } catch { return false; }
}

export async function loadDraft() {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const req = db.transaction(STORE, 'readonly').objectStore(STORE).get(KEY);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch { return null; }
}

export async function clearDraft() {
  try { await run('readwrite', s => s.delete(KEY)); return true; } catch { return false; }
}
