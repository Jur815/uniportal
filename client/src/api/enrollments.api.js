import http from "./http";

export const enrollInCourse = async ({ academicYear, semester, courseId }) => {
  const response = await http.post("/enrollments", {
    academicYear,
    semester,
    courses: [courseId],
  });

  return response.data;
};

export const getMyCourses = async () => {
  const response = await http.get("/enrollments/my");
  return response.data;
};
