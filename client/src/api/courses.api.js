import http from "./http";

export const getAllCourses = async () => {
  const response = await http.get("/courses");
  return response.data;
};

export const createCourse = async (payload) => {
  const response = await http.post("/courses", payload);
  return response.data;
};
