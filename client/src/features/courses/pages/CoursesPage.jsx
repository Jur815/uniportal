const courses = [
  {
    id: 1,
    code: "CSC101",
    title: "Introduction to Computer Science",
    creditHours: 3,
  },
  { id: 2, code: "MAT101", title: "Calculus I", creditHours: 3 },
  { id: 3, code: "ENG101", title: "Academic Writing", creditHours: 2 },
];

export default function CoursesPage() {
  return (
    <div className="page">
      <h1>Courses</h1>

      <div className="grid">
        {courses.map((course) => (
          <div key={course.id} className="card">
            <h3>
              {course.code} - {course.title}
            </h3>
            <p>Credit Hours: {course.creditHours}</p>
            <button className="btn">Enroll</button>
          </div>
        ))}
      </div>
    </div>
  );
}
