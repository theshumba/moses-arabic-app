import { useParams } from 'react-router-dom';

export default function StudyPage() {
  const { deckId } = useParams();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Study</h1>
      <p className="text-text-muted">
        {deckId ? `Studying deck: ${deckId}` : 'Select a deck to study.'}
      </p>
      <p className="text-text-dim mt-2">Study flow coming in Phase 3.</p>
    </div>
  );
}
