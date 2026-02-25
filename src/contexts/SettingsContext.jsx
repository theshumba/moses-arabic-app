import { createContext, useContext, useEffect, useReducer, useRef } from 'react';
import { StorageService } from '../services/StorageService.js';
import { FirebaseService } from '../services/FirebaseService.js';

const SettingsStateContext = createContext(null);
const SettingsDispatchContext = createContext(null);

const DEFAULT_SETTINGS = {
  studyMode: 'flip',
  newCardsPerSession: 50,
};

const initialState = { settings: { ...DEFAULT_SETTINGS } };

function settingsReducer(state, action) {
  switch (action.type) {
    case 'LOAD':
      return { ...state, settings: { ...DEFAULT_SETTINGS, ...action.payload } };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    default:
      return state;
  }
}

export function SettingsProvider({ children }) {
  const [state, dispatch] = useReducer(settingsReducer, initialState);
  const initialized = useRef(false);

  useEffect(() => {
    const saved = StorageService.get('settings');
    if (saved) {
      dispatch({ type: 'LOAD', payload: saved });
    }

    FirebaseService.waitForAuth().then(async (uid) => {
      if (!uid) {
        initialized.current = true;
        return;
      }

      const cloudData = await FirebaseService.read('settings');
      if (cloudData) {
        const merged = { ...(saved || {}), ...cloudData };
        dispatch({ type: 'LOAD', payload: merged });
        StorageService.setImmediate('settings', merged);
      } else if (saved) {
        FirebaseService.write('settings', saved);
      }
      initialized.current = true;
    });
  }, []);

  useEffect(() => {
    if (!initialized.current) return;
    StorageService.set('settings', state.settings);
    FirebaseService.write('settings', state.settings);
  }, [state.settings]);

  useEffect(() => {
    const handler = () => {
      StorageService.flushAll();
      FirebaseService.flushAll();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  return (
    <SettingsStateContext value={state}>
      <SettingsDispatchContext value={dispatch}>
        {children}
      </SettingsDispatchContext>
    </SettingsStateContext>
  );
}

export function useSettingsState() {
  const ctx = useContext(SettingsStateContext);
  if (ctx === null) throw new Error('useSettingsState must be used within SettingsProvider');
  return ctx;
}

export function useSettingsDispatch() {
  const ctx = useContext(SettingsDispatchContext);
  if (ctx === null) throw new Error('useSettingsDispatch must be used within SettingsProvider');
  return ctx;
}
