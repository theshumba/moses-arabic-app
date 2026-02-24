import { createContext, useContext, useEffect, useReducer, useRef } from 'react';
import { StorageService } from '../services/StorageService.js';

const ProgressStateContext = createContext(null);
const ProgressDispatchContext = createContext(null);

const initialState = { cardProgress: {} };

function progressReducer(state, action) {
  switch (action.type) {
    case 'LOAD':
      return { ...state, ...action.payload };
    case 'REVIEW_CARD':
      return {
        ...state,
        cardProgress: {
          ...state.cardProgress,
          [action.payload.cardId]: action.payload.progress,
        },
      };
    case 'CLEAR_ALL':
      return { cardProgress: {} };
    default:
      return state;
  }
}

export function ProgressProvider({ children }) {
  const [state, dispatch] = useReducer(progressReducer, initialState);
  const initialized = useRef(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const saved = StorageService.get('progress');
    if (saved) {
      dispatch({ type: 'LOAD', payload: { cardProgress: saved } });
    }
    initialized.current = true;
  }, []);

  // Persist on change (debounced via StorageService.set)
  useEffect(() => {
    if (!initialized.current) return;
    StorageService.set('progress', state.cardProgress);
  }, [state.cardProgress]);

  // Flush on beforeunload
  useEffect(() => {
    const handler = () => StorageService.flushAll();
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  return (
    <ProgressStateContext value={state}>
      <ProgressDispatchContext value={dispatch}>
        {children}
      </ProgressDispatchContext>
    </ProgressStateContext>
  );
}

export function useProgressState() {
  const ctx = useContext(ProgressStateContext);
  if (ctx === null) throw new Error('useProgressState must be used within ProgressProvider');
  return ctx;
}

export function useProgressDispatch() {
  const ctx = useContext(ProgressDispatchContext);
  if (ctx === null) throw new Error('useProgressDispatch must be used within ProgressProvider');
  return ctx;
}
