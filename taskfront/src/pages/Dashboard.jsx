import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../features/auth/AuthContext";
import toast from "react-hot-toast";
import Header from "../components/Header";
import useProjects from "../features/projects/hooks/useProjects";
import ProjectForm from "../features/projects/components/ProjectForm";
import SearchBar from "../features/projects/components/SearchBar";
import ProjectList from "../features/projects/components/ProjectList";

export default function Dashboard() {
  const {
    projects,
    loading,
    createProject,
    deleteProject,
    updateProject,
    setProjects,
    page,
    setPage,
    total,
    limit,
  } = useProjects();
  
  const totalPages = Math.ceil(total / limit);
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleCreate = async () => {
    if (!name.trim()) return toast.error("Name required");
    await createProject(name);
    setName("");
  };

  const handleSave = async () => {
    if (!editText.trim()) return;

    await updateProject(editingId, editText);
    setEditingId(null);
    setEditText("");
  };

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="p-6 text-white bg-gray-900 min-h-screen">
      <div className="max-w-2xl mx-auto">

        <Header />
        <ProjectForm
          name={name}
          setName={setName}
          onCreate={handleCreate}
        />

        <SearchBar search={search} setSearch={setSearch} />

        {loading ? (
          <div className="space-y-3 mt-6">
            <div className="h-12 bg-gray-700 rounded animate-pulse"></div>
            <div className="h-12 bg-gray-700 rounded animate-pulse"></div>
            <div className="h-12 bg-gray-700 rounded animate-pulse"></div>
          </div>
        ) : filtered.length === 0 ? (
            search ? (
              <p className="text-center text-gray-400 mt-10">
                No results found 🔍
              </p>
            ) : (
              <p className="text-center text-gray-400 mt-10">
                No projects yet. Create one 🚀
              </p>
            )
          ) : (
          <ProjectList
            projects={filtered}
            onDelete={deleteProject}
            navigate={navigate}
            editingId={editingId}
            editText={editText}
            setEditText={setEditText}
            setEditingId={setEditingId}
            onSave={handleSave}
            setProjects={setProjects}
          />
          
        )}
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 rounded ${
                page === i + 1 ? "bg-blue-500" : "bg-gray-700"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}