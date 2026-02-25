import { useState } from 'react';
import { FirebaseService } from '../services/FirebaseService.js';
import { StorageService } from '../services/StorageService.js';
import { useProgressDispatch } from '../contexts/ProgressContext.jsx';
import { useSettingsDispatch } from '../contexts/SettingsContext.jsx';

export default function SettingsPage() {
  const [linkCode, setLinkCode] = useState(null);
  const [inputCode, setInputCode] = useState('');
  const [generating, setGenerating] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [message, setMessage] = useState(null);
  const progressDispatch = useProgressDispatch();
  const settingsDispatch = useSettingsDispatch();

  const handleGenerateCode = async () => {
    setGenerating(true);
    setMessage(null);
    const code = await FirebaseService.generateLinkCode();
    if (code) {
      setLinkCode(code);
    } else {
      setMessage({ type: 'error', text: 'Failed to generate code. Check your connection.' });
    }
    setGenerating(false);
  };

  const handleRedeemCode = async () => {
    if (inputCode.length !== 6) {
      setMessage({ type: 'error', text: 'Code must be 6 characters.' });
      return;
    }
    setRedeeming(true);
    setMessage(null);
    const result = await FirebaseService.redeemLinkCode(inputCode);
    if (result.success) {
      if (result.data.progress?.cardProgress) {
        StorageService.setImmediate('progress', result.data.progress.cardProgress);
        progressDispatch({ type: 'LOAD', payload: { cardProgress: result.data.progress.cardProgress } });
      }
      if (result.data.settings) {
        StorageService.setImmediate('settings', result.data.settings);
        settingsDispatch({ type: 'LOAD', payload: result.data.settings });
      }
      if (result.data.stats?.sessions) {
        StorageService.setImmediate('sessions', result.data.stats.sessions);
      }
      if (result.data.stats?.streak) {
        StorageService.setImmediate('streak', result.data.stats.streak);
      }
      setMessage({ type: 'success', text: 'Device linked! Your progress has been synced.' });
      setInputCode('');
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to redeem code.' });
    }
    setRedeeming(false);
  };

  const handleExport = () => {
    const json = StorageService.exportAll();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moses-arabic-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = StorageService.importAll(reader.result);
      if (result.success) {
        setMessage({ type: 'success', text: 'Data imported! Reloading...' });
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* Sync status */}
      <div className="mb-6">
        <h2 className="text-sm uppercase tracking-wide text-text-muted mb-3">Cloud Sync</h2>
        <p className="text-text-dim text-sm mb-4">
          Your progress syncs automatically across devices. Use a link code to connect a new device.
        </p>
      </div>

      {/* Link Device */}
      <div className="rounded-xl border border-border bg-surface p-5 mb-4">
        <h3 className="font-medium mb-3">Link a Device</h3>

        {/* Generate code */}
        <div className="mb-4">
          <p className="text-text-dim text-sm mb-2">Generate a code on this device, then enter it on your other device.</p>
          <button
            onClick={handleGenerateCode}
            disabled={generating}
            className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/80 transition-colors disabled:opacity-50"
          >
            {generating ? 'Generating...' : 'Generate Link Code'}
          </button>
          {linkCode && (
            <div className="mt-3 p-3 rounded-lg bg-surface-2 border border-border text-center">
              <div className="text-xs text-text-dim mb-1">Your link code (expires in 10 min):</div>
              <div className="text-3xl font-mono font-bold tracking-widest text-accent">{linkCode}</div>
            </div>
          )}
        </div>

        {/* Redeem code */}
        <div className="border-t border-border pt-4">
          <p className="text-text-dim text-sm mb-2">Or enter a code from your other device:</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase().slice(0, 6))}
              placeholder="ABC123"
              maxLength={6}
              className="flex-1 px-3 py-2 rounded-lg bg-surface-2 border border-border text-text font-mono text-lg tracking-widest text-center uppercase placeholder:text-text-dim/50"
            />
            <button
              onClick={handleRedeemCode}
              disabled={redeeming || inputCode.length !== 6}
              className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/80 transition-colors disabled:opacity-50"
            >
              {redeeming ? 'Linking...' : 'Link'}
            </button>
          </div>
        </div>
      </div>

      {/* Status message */}
      {message && (
        <div className={`rounded-lg p-3 mb-4 text-sm ${message.type === 'error' ? 'bg-again/20 text-again' : 'bg-good/20 text-good'}`}>
          {message.text}
        </div>
      )}

      {/* Data Management */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <h3 className="font-medium mb-3">Data Management</h3>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="px-4 py-2 rounded-lg bg-surface-2 border border-border text-text-muted text-sm hover:bg-surface transition-colors"
          >
            Export Backup
          </button>
          <label className="px-4 py-2 rounded-lg bg-surface-2 border border-border text-text-muted text-sm hover:bg-surface transition-colors cursor-pointer">
            Import Backup
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
}
