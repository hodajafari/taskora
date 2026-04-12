import API from "../../../api/axios";

export const getProjects = ({ page, limit }) =>
  API.get(`/projects?page=${page}&limit=${limit}`);
export const createProject = (data) => API.post("projects/", data);
export const deleteProject = (id) => API.delete(`projects/${id}/`);
export const updateProject = (id, data) =>
  API.put(`projects/${id}/`, data);