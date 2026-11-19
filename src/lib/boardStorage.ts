/**
 * 1-User = 1-Personal-Board IndexedDB Persistence Engine
 * Persists each learner's isolated board state AND submission file blobs (.py, .ipynb, .csv)
 * in IndexedDB for Guest Mode / offline durability, alongside localStorage fast boot.
 */

const DB_NAME = 'ai_mastery_hub_boards_v2';
const BOARD_STORE = 'boards';
const ARTIFACT_STORE = 'artifacts';
const DB_VERSION = 2;

export interface BoardSyncCapabilities {
  indexedDbAvailable: boolean;
  supabaseConfigured: boolean;
  modeLabel: string;
}

export interface StoredArtifact {
  id: string;
  boardId: string;
  moduleId: string;
  filename: string;
  mimeType: string;
  blob: Blob;
  createdAt: string;
}

export function getBoardSyncCapabilities(): BoardSyncCapabilities {
  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const indexedDbAvailable =
    typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';

  return {
    indexedDbAvailable,
    supabaseConfigured,
    modeLabel: supabaseConfigured
      ? 'Supabase Cloud + IndexedDB Cache'
      : indexedDbAvailable
        ? 'Guest Mode (IndexedDB + LocalStorage)'
        : 'Guest Mode (LocalStorage)',
  };
}

function openBoardsDb(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || typeof window.indexedDB === 'undefined') {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    try {
      const req = window.indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(BOARD_STORE)) {
          db.createObjectStore(BOARD_STORE, { keyPath: 'boardId' });
        }
        if (!db.objectStoreNames.contains(ARTIFACT_STORE)) {
          const store = db.createObjectStore(ARTIFACT_STORE, { keyPath: 'id' });
          store.createIndex('by_board_module', ['boardId', 'moduleId'], { unique: false });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function saveBoardToIndexedDb<T>(boardId: string, payload: T): Promise<void> {
  const db = await openBoardsDb();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(BOARD_STORE, 'readwrite');
      tx.objectStore(BOARD_STORE).put({
        boardId,
        updatedAt: new Date().toISOString(),
        payload,
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

export async function loadBoardFromIndexedDb<T>(boardId: string): Promise<T | null> {
  const db = await openBoardsDb();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(BOARD_STORE, 'readonly');
      const req = tx.objectStore(BOARD_STORE).get(boardId);
      req.onsuccess = () => {
        const rec = req.result as { payload?: T } | undefined;
        resolve(rec?.payload ?? null);
      };
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function saveArtifactBlobToIndexedDb(artifact: StoredArtifact): Promise<void> {
  const db = await openBoardsDb();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(ARTIFACT_STORE, 'readwrite');
      tx.objectStore(ARTIFACT_STORE).put(artifact);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

export async function loadArtifactBlobFromIndexedDb(id: string): Promise<StoredArtifact | null> {
  const db = await openBoardsDb();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(ARTIFACT_STORE, 'readonly');
      const req = tx.objectStore(ARTIFACT_STORE).get(id);
      req.onsuccess = () => resolve((req.result as StoredArtifact | undefined) ?? null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}
