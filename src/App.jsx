function App() {
  return (
    <div className="min-h-screen bg-bg text-text flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">Moses Arabic</h1>
      <p className="text-text-muted mb-6">Personal Arabic SRS - 7 Day Sprint</p>
      <p className="font-arabic text-3xl text-text" dir="rtl">
        بسم الله الرحمن الرحيم
      </p>
      <div className="mt-8 flex gap-4">
        <span className="px-3 py-1 rounded bg-again text-white text-sm">Again</span>
        <span className="px-3 py-1 rounded bg-hard text-white text-sm">Hard</span>
        <span className="px-3 py-1 rounded bg-good text-white text-sm">Good</span>
        <span className="px-3 py-1 rounded bg-easy text-white text-sm">Easy</span>
      </div>
      <div className="mt-6 flex gap-3">
        <span className="px-3 py-1 rounded bg-stage-script text-white text-sm">Script</span>
        <span className="px-3 py-1 rounded bg-stage-core text-white text-sm">Core</span>
        <span className="px-3 py-1 rounded bg-stage-grammar text-white text-sm">Grammar</span>
        <span className="px-3 py-1 rounded bg-stage-vocab text-white text-sm">Vocab</span>
      </div>
    </div>
  );
}

export default App;
