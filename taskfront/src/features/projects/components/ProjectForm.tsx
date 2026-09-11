import type {
  ChangeEvent,
  Dispatch,
  KeyboardEvent,
  SetStateAction,
} from "react";

interface ProjectFormProps {
  name: string;
  setName: Dispatch<SetStateAction<string>>;
  onCreate: () => void;
}

export default function ProjectForm({
  name,
  setName,
  onCreate,
}: ProjectFormProps) {
  const handleNameChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setName(event.target.value);
  };

  const handleNameKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
  ): void => {
    if (event.key === "Enter") {
      onCreate();
    }
  };

  return (
    <div className="flex gap-2 mb-4">
      <input
        value={name}
        onChange={handleNameChange}
        onKeyDown={handleNameKeyDown}
        className="flex-1 px-3 py-2 bg-gray-800 rounded"
        placeholder="New project..."
      />
      <button onClick={onCreate} className="bg-blue-500 px-4 rounded">
        create
      </button>
    </div>
  );
}