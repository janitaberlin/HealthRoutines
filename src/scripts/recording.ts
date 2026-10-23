/** Eigene Aufnahmen der Affirmationen: im Handy gespeichert (IndexedDB), nicht in der Sicherungsdatei. */
const DB = 'janita-audio';
const STORE = 'recordings';

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function run<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest): Promise<T> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const req = fn(db.transaction(STORE, mode).objectStore(STORE));
    req.onsuccess = () => resolve(req.result as T);
    req.onerror = () => reject(req.error);
  });
}

export const loadRecording = (key: string) => run<Blob | undefined>('readonly', (s) => s.get(key)).catch(() => undefined);
export const saveRecording = (key: string, blob: Blob) => run<void>('readwrite', (s) => s.put(blob, key));
export const deleteRecording = (key: string) => run<void>('readwrite', (s) => s.delete(key));

/** Mikrofon-Aufnahme starten; stop() liefert die Datei. */
export async function startRecording(): Promise<{ stop: () => Promise<Blob> }> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const type = ['audio/mp4', 'audio/webm', 'audio/ogg'].find((t) => MediaRecorder.isTypeSupported?.(t));
  const rec = new MediaRecorder(stream, type ? { mimeType: type } : undefined);
  const chunks: Blob[] = [];
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  rec.start();
  return {
    stop: () =>
      new Promise((resolve) => {
        rec.onstop = () => {
          stream.getTracks().forEach((t) => t.stop());
          resolve(new Blob(chunks, { type: rec.mimeType || type || 'audio/mp4' }));
        };
        rec.stop();
      }),
  };
}
