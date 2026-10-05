/* ==========================================================================
   IndexedDB Settings Folder Storage Service
   Remembers only the single chosen settings folder handle so that
   the app can reconnect to it at startup or on demand.
   Only one settings folder is remembered; previous folders are not kept.
   No API keys, user secrets, or drafts are stored in browser storage.
   ========================================================================== */

const DB_NAME = 'plr_settings_db';
const DB_VERSION = 2;
const STORE_NAME = 'settings_folder';

export interface SavedSettingsFolderRecord {
  id: string;
  name: string;
  handle: FileSystemDirectoryHandle;
  connectedAt: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      reject(new Error('IndexedDB is not supported in this environment.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (db.objectStoreNames.contains('saved_folders')) {
        db.deleteObjectStore('saved_folders');
      }
      if (db.objectStoreNames.contains('meta')) {
        db.deleteObjectStore('meta');
      }
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save the single active settings folder handle (overwriting any previous one)
 */
export async function saveSettingsFolder(handle: FileSystemDirectoryHandle): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    // Clear everything first to guarantee only one settings folder is stored
    store.clear();

    const record: SavedSettingsFolderRecord = {
      id: 'current_settings_folder',
      name: handle.name,
      handle,
      connectedAt: Date.now(),
    };

    store.put(record);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Retrieve the single saved settings folder handle
 */
export async function getSavedSettingsFolder(): Promise<SavedSettingsFolderRecord | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get('current_settings_folder');
      req.onsuccess = () => resolve((req.result as SavedSettingsFolderRecord) || null);
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    console.warn('Failed to get saved settings folder:', err);
    return null;
  }
}

/**
 * Clear the saved settings folder from storage
 */
export async function clearSavedSettingsFolder(): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Failed to clear settings folder:', err);
  }
}
