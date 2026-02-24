import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppProviders } from './contexts/index.jsx';
import AppShell from './components/layout/AppShell.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import StudyPage from './pages/StudyPage.jsx';
import DecksPage from './pages/DecksPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

const router = createBrowserRouter([
  {
    Component: AppShell,
    children: [
      { index: true, Component: DashboardPage },
      { path: 'study/:deckId', Component: StudyPage },
      { path: 'study', Component: StudyPage },
      { path: 'decks', Component: DecksPage },
      { path: 'settings', Component: SettingsPage },
    ],
  },
]);

export default function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}
