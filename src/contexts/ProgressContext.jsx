import { createContext, useContext, useEffect, useReducer, useRef } from 'react';
import { StorageService } from '../services/StorageService.js';
import { FirebaseService } from '../services/FirebaseService.js';

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

  useEffect(() => {
    const saved = StorageService.get('progress');
    if (saved) {
      dispatch({ type: 'LOAD', payload: { cardProgress: saved } });
    }

    FirebaseService.waitForAuth().then(async (uid) => {
      if (!uid) {
        initialized.current = true;
        return;
      }

      const cloudData = await FirebaseService.read('progress');
      if (cloudData && cloudData.cardProgress) {
        const merged = { ...(saved || {}), ...cloudData.cardProgress };
        dispatch({ type: 'LOAD', payload: { cardProgress: merged } });
        StorageService.setImmediate('progress', merged);
      } else if (saved && Object.keys(saved).length > 0) {
        FirebaseService.write('progress', { cardProgress: saved });
      }
      initialized.current = true;
    });
  }, []);

  useEffect(() => {
    if (!initialized.current) return;
    StorageService.set('progress', state.cardProgress);
    FirebaseService.write('progress', { cardProgress: state.cardProgress });
  }, [state.cardProgress]);

  useEffect(() => {
    const handler = () => {
      StorageService.flushAll();
      FirebaseService.flushAll();
    };
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
