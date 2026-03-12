import http from "./http";

export const enrollInCourse = async (courseId) => {
  const response = await http.post("/enrollments", { courseId });
  return response.data;
};

export const getMyCourses = async () => {
  const response = await http.get("/enrollments/my");
  return response.data;
};
