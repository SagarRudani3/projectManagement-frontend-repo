import request from "./request";

export const getProjects = () => {
  return request<any[]>("projects");
};

export const createProject = (data: { name: string; description: string }) => {
  return request<any>("projects", {
    method: "POST",
    body: data,
  });
};

export const login = (email: string) => {
  return request<any>("auth/login", {
    method: "POST",
    body: { email },
  });
};

export const verifyOtp = (email: string, otp: string) => {
  return request<any>("auth/verify", {
    method: "POST",
    body: { email, otp },
  });
};

export const deleteProject = (id: string) => {
  return request<any>(`projects/${id}`, {
    method: "DELETE",
  });
};

export const getColumns = (projectId: string) => {
  return request<any[]>(`columns?projectId=${projectId}`);
};

export const getTasks = (columnId: string) => {
  return request<any[]>(`tasks?columnId=${columnId}`);
};

export const createTask = (data: {
  title: string;
  description?: string;
  projectId: string;
  columnId: string;
}) => {
  return request<any>("tasks", {
    method: "POST",
    body: data,
  });
};

export const editTask = (
  taskId: string,
  data: { title?: string; description?: string; columnId?: string }
) => {
  return request<any>(`tasks/${taskId}`, {
    method: "PATCH",
    body: data,
  });
};

export const deleteTask = (taskId: string) => {
  return request<any>(`tasks/${taskId}`, {
    method: "DELETE",
  });
};

export const moveTask = (taskId: string, newColumnId: string) => {
  return request<any>(`tasks/${taskId}/move`, {
    method: "PATCH",
    body: { columnId: newColumnId },
  });
};
