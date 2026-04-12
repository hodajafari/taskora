import API from "../../../api/axios";

export const getTasks = async (projectId) => {
  const res = await API.get(`tasks/?project=${projectId}`);

  return Array.isArray(res.data)
    ? res.data
    : res.data.results || [];
};
export const createTask = (data) => {
  return API.post("tasks/", data);
};
export const deleteTask = (taskId) => {
  return API.delete(`tasks/${taskId}/`);
};

export const updateTask = ({ taskId, title }) => {
  return API.patch(`tasks/${taskId}/`, { title });
};

export const updateTaskStatus = ({ taskId, status }) => {
  return API.patch(`tasks/${taskId}/`, { status });
};