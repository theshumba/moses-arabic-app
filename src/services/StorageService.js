/**
 * StorageService — the ONLY module that touches localStorage directly.
 * All persistence flows through this service.
 *
 * Features:
 * - Auto-prefixed keys (moses-arabic-*)
 * - Debounced writes (2s default)
 * - QuotaExceededError handling
 * - Export/import with version validation
 * - Quota usage reporting
 */

const STORAGE_PREFIX = 'moses-arabic-';
const DEBOUNCE_MS = 2000;
const EXPORT_VERSION = 1;

/** @type {Map<string, { value: any, timer: number }>} */
const pendingWrites = new Map();

/**
 * Build the full prefixed key.
 * @param {string} key
 * @returns {string}
 */
function prefixKey(key) {
  return `${STORAGE_PREFIX}${key}`;
}

/**
 * Safely write to localStorage, catching QuotaExceededError.
 * @param {string} fullKey - Already-prefixed key
 * @param {string} serialized - JSON string to write
 * @returns {boolean} true if write succeeded
 */
function safeSetItem(fullKey, serialized) {
  try {
    localStorage.setItem(fullKey, serialized);
    return true;
  } catch (err) {
    if (err.name === 'QuotaExceededError' || err.code === 22) {
      console.error(`[StorageService] QuotaExceededError writing key "${fullKey}"`);
      return false;
    }
    throw err;
  }
}

const StorageService = {
  /**
   * Read a value from localStorage. Key is auto-prefixed.
   * @param {string} key
   * @returns {any|null} Parsed JSON value or null if missing/corrupt
   */
  get(key) {
    try {
      const raw = localStorage.getItem(prefixKey(key));
      if (raw === null) return null;
      return JSON.parse(raw);
    } catch {
      console.error(`[StorageService] Failed to parse key "${key}"`);
      return null;
    }
  },

  /**
   * Debounced write. Batches writes and flushes after DEBOUNCE_MS.
   * @param {string} key
   * @param {any} value - Must be JSON-serializable
   * @returns {void}
   */
  set(key, value) {
    const fullKey = prefixKey(key);

    // Cancel existing timer for this key
    const existing = pendingWrites.get(fullKey);
    if (existing) {
      clearTimeout(existing.timer);
    }

    const timer = setTimeout(() => {
      const serialized = JSON.stringify(value);
      safeSetItem(fullKey, serialized);
      pendingWrites.delete(fullKey);
    }, DEBOUNCE_MS);

    pendingWrites.set(fullKey, { value, timer });
  },

  /**
   * Immediate (non-debounced) write.
   * @param {string} key
   * @param {any} value
   * @returns {boolean} true if write succeeded
   */
  setImmediate(key, value) {
    const fullKey = prefixKey(key);

    // Cancel any pending debounced write for this key
    const existing = pendingWrites.get(fullKey);
    if (existing) {
      clearTimeout(existing.timer);
      pendingWrites.delete(fullKey);
    }

    const serialized = JSON.stringify(value);
    return safeSetItem(fullKey, serialized);
  },

  /**
   * Remove a key from localStorage. Auto-prefixed.
   * @param {string} key
   */
  remove(key) {
    const fullKey = prefixKey(key);

    // Cancel any pending write
    const existing = pendingWrites.get(fullKey);
    if (existing) {
      clearTimeout(existing.timer);
      pendingWrites.delete(fullKey);
    }

    localStorage.removeItem(fullKey);
  },

  /**
   * Export all moses-arabic-* keys as a JSON string.
   * Includes _meta with version and timestamp.
   * @returns {string} JSON string
   */
  exportAll() {
    // Flush pending writes first
    this.flushAll();

    const data = { _meta: { version: EXPORT_VERSION, timestamp: new Date().toISOString() } };

    for (let i = 0; i < localStorage.length; i++) {
      const fullKey = localStorage.key(i);
      if (fullKey && fullKey.startsWith(STORAGE_PREFIX)) {
        const shortKey = fullKey.slice(STORAGE_PREFIX.length);
        try {
          data[shortKey] = JSON.parse(localStorage.getItem(fullKey));
        } catch {
          data[shortKey] = localStorage.getItem(fullKey);
        }
      }
    }

    return JSON.stringify(data, null, 2);
  },

  /**
   * Import data from a JSON string. Validates _meta.version, clears existing, imports all keys.
   * @param {string} jsonString
   * @returns {{ success: boolean, error?: string }}
   */
  importAll(jsonString) {
    let data;
    try {
      data = JSON.parse(jsonString);
    } catch {
      return { success: false, error: 'Invalid JSON' };
    }

    if (!data._meta || typeof data._meta.version !== 'number') {
      return { success: false, error: 'Missing or invalid _meta.version' };
    }

    if (data._meta.version > EXPORT_VERSION) {
      return { success: false, error: `Unsupported version ${data._meta.version} (max: ${EXPORT_VERSION})` };
    }

    // Clear existing data
    this.clear();

    // Import all keys except _meta
    for (const [key, value] of Object.entries(data)) {
      if (key === '_meta') continue;
      const success = safeSetItem(prefixKey(key), JSON.stringify(value));
      if (!success) {
        return { success: false, error: `QuotaExceededError importing key "${key}"` };
      }
    }

    return { success: true };
  },

  /**
   * Remove all moses-arabic-* keys from localStorage.
   */
  clear() {
    // Cancel all pending writes
    for (const [, entry] of pendingWrites) {
      clearTimeout(entry.timer);
    }
    pendingWrites.clear();

    // Collect keys first to avoid mutation during iteration
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const fullKey = localStorage.key(i);
      if (fullKey && fullKey.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(fullKey);
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));
  },

  /**
   * Force all pending debounced writes to execute immediately.
   */
  flushAll() {
    for (const [fullKey, entry] of pendingWrites) {
      clearTimeout(entry.timer);
      const serialized = JSON.stringify(entry.value);
      safeSetItem(fullKey, serialized);
    }
    pendingWrites.clear();
  },

  /**
   * Get quota usage information.
   * @returns {{ used: number, limit: number, percent: number }}
   */
  getQuotaUsage() {
    let used = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        const value = localStorage.getItem(key);
        // Each char is 2 bytes in UTF-16
        used += (key.length + (value ? value.length : 0)) * 2;
      }
    }

    // Most browsers provide 5-10MB; estimate 5MB
    const limit = 5 * 1024 * 1024;
    const percent = limit > 0 ? Math.round((used / limit) * 100) : 0;

    return { used, limit, percent };
  },
};

export { StorageService, STORAGE_PREFIX, DEBOUNCE_MS };
