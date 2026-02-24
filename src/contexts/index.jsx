import { ProgressProvider } from './ProgressContext.jsx';
import { SettingsProvider } from './SettingsContext.jsx';

/**
 * AppProviders — composes all context providers into a single wrapper.
 *
 * Nesting order:
 *   SettingsProvider (outer) — no dependencies
 *   ProgressProvider (inner) — may later read settings (newCardsPerSession)
 */
export function AppProviders({ children }) {
  return (
    <SettingsProvider>
      <ProgressProvider>
        {children}
      </ProgressProvider>
    </SettingsProvider>
  );
}
