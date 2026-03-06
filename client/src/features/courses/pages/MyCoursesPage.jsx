const myCourses = [
  { id: 1, code: "CSC101", title: "Introduction to Computer Science" },
  { id: 2, code: "MAT101", title: "Calculus I" },
];

export default function MyCoursesPage() {
  return (
    <div className="page">
      <h1>My Courses</h1>

      <div className="grid">
        {myCourses.map((course) => (
          <div key={course.id} className="card">
            <h3>
              {course.code} - {course.title}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
}
