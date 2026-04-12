export default function SearchBar({ search, setSearch }) {
  return (
    <input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Search..."
      className="w-full mb-4 px-3 py-2 bg-gray-800 rounded"
    />
  );
}