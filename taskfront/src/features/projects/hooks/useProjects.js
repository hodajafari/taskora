import { useState, useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import * as projectApi from "../api/projectApi";

export default function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const limit = 10;
  useEffect(() => {
  const fetchProjects = async () => {
    try {
      if (projects.length === 0) {
        setLoading(true);
      }

      const res = await projectApi.getProjects({
        page,
        limit,
      });

      setProjects(res.data.results);
      setTotal(res.data.count);

    } catch (err) {
      console.log(err);
      toast.error("Failed to load");
    } finally {
      setLoading(false);
    }
  };

  fetchProjects();
}, [page, refresh]);
  const createProject = async (name) => {
  try {
    await projectApi.createProject({ name });

    setRefresh((r) => r + 1); // 👈 refetch

  } catch (err) {
    console.error(err.response?.data);
    toast.error("Create failed");
  }
};

  const deleteProject = async (id) => {
    try {
      await projectApi.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch {
      toast.error("Delete failed");
    }
  };

  const updateProject = async (id, name) => {
    try {
      const res = await projectApi.updateProject(id, { name });
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? res.data : p))
      );
    } catch {
      toast.error("Update failed");
    }
  };

  return {
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
  };
}