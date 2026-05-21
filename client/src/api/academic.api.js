import http from "./http";

export const getFaculties = async () => {
  const response = await http.get("/faculties");
  return response.data;
};

export const createFaculty = async (payload) => {
  const response = await http.post("/faculties", payload);
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

export const getPrograms = async (params = {}) => {
  const response = await http.get("/programs", { params });
  return response.data;
};

export const createProgram = async (payload) => {
  const response = await http.post("/programs", payload);
  return response.data;
};
