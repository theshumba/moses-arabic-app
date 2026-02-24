import { createContext, useContext, useEffect, useReducer, useRef } from 'react';
import { StorageService } from '../services/StorageService.js';

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

  // Hydrate from localStorage on mount
  useEffect(() => {
    const saved = StorageService.get('settings');
    if (saved) {
      dispatch({ type: 'LOAD', payload: saved });
    }
    initialized.current = true;
  }, []);

  // Persist on change (debounced via StorageService.set)
  useEffect(() => {
    if (!initialized.current) return;
    StorageService.set('settings', state.settings);
  }, [state.settings]);

  // Flush on beforeunload
  useEffect(() => {
    const handler = () => StorageService.flushAll();
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
