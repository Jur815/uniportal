import http from "./http";

export const getAllCourses = async (params = {}) => {
  const response = await http.get("/courses", { params });
  return response.data;
};

export const getAdminCourses = async (params = {}) => {
  const response = await http.get("/courses/admin", { params });
  return response.data;
};

export const getAdminCourseDetail = async (courseId) => {
  const response = await http.get(`/courses/admin/${courseId}`);
  return response.data;
};

export const createCourse = async (payload) => {
  const response = await http.post("/courses", payload);
  return response.data;
};

export const updateCourse = async (courseId, payload) => {
  const response = await http.patch(`/courses/${courseId}`, payload);
  return response.data;
};

export const updateCourseStatus = async (courseId, isActive) => {
  const response = await http.patch(`/courses/${courseId}/status`, {
    isActive,
  });
  return response.data;
};
