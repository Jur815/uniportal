import http from "./http";

export const getFaculties = async (params = {}) => {
  const response = await http.get("/faculties", { params });
  return response.data;
};

export const createFaculty = async (payload) => {
  const response = await http.post("/faculties", payload);
  return response.data;
};

export const updateFaculty = async (facultyId, payload) => {
  const response = await http.patch(`/faculties/${facultyId}`, payload);
  return response.data;
};

export const deactivateFaculty = async (facultyId) => {
  const response = await http.delete(`/faculties/${facultyId}`);
  return response.data;
};

export const getDepartments = async (params = {}) => {
  const response = await http.get("/departments", { params });
  return response.data;
};

export const createDepartment = async (payload) => {
  const response = await http.post("/departments", payload);
  return response.data;
};

export const updateDepartment = async (departmentId, payload) => {
  const response = await http.patch(`/departments/${departmentId}`, payload);
  return response.data;
};

export const deactivateDepartment = async (departmentId) => {
  const response = await http.delete(`/departments/${departmentId}`);
  return response.data;
};

export const getPrograms = async (params = {}) => {
  const response = await http.get("/programs", { params });
  return response.data;
};

export const createProgram = async (payload) => {
  const response = await http.post("/programs", payload);
  return response.data;
};
