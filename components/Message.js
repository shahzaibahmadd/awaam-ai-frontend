export default function Message({ sender, text }) {
  const isAI = sender === 'ai';

  return (
    <div className={`flex ${isAI ? 'justify-start' : 'justify-end'} mb-4`}>
      <div
        className={`max-w-xl px-4 py-3 rounded-lg shadow-md ${
          isAI
            ? 'bg-gray-700 text-white'
            : 'bg-green-600 text-white'
        }`}
      >
        {/* We use whitespace-pre-wrap to respect newlines from the AI's response */}
        <p className="whitespace-pre-wrap">{text}</p>
      </div>
    </div>
  );
}