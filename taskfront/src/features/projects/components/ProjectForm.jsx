export default function ProjectForm({ name, setName, onCreate }) {
  return (
    <div className="flex gap-2 mb-4">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onCreate()}
        className="flex-1 px-3 py-2 bg-gray-800 rounded"
        placeholder="New project..."
      />
      <button onClick={onCreate} className="bg-blue-500 px-4 rounded">
        create
      </button>
    </div>
  );
}