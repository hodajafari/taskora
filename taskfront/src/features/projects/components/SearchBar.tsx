import type {
  ChangeEvent,
  Dispatch,
  JSX,
  SetStateAction,
} from "react";

interface SearchBarProps {
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
}

export default function SearchBar({
  search,
  setSearch,
}: SearchBarProps): JSX.Element {
  const handleSearchChange = (
    event: ChangeEvent<HTMLInputElement>,
  ): void => {
    setSearch(event.target.value);
  };

  return (
    <input
      value={search}
      onChange={handleSearchChange}
      placeholder="Search..."
      className="w-full mb-4 px-3 py-2 bg-gray-800 rounded"
    />
  );
}