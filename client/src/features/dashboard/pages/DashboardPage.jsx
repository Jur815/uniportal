import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/context/useAuth";

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  const isAdmin = user.role === "admin";
  const isStudent = user.role === "student";

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white shadow rounded-xl p-6 border">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {user.name}
        </h1>
        <p className="text-gray-600 mt-2">
          Role: <span className="font-medium capitalize">{user.role}</span>
        </p>
        <p className="text-gray-600">
          Email: <span className="font-medium">{user.email}</span>
        </p>
      </div>

      {isStudent && (
        <>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white shadow rounded-xl p-5 border">
              <h2 className="text-lg font-semibold text-gray-800">
                Browse Courses
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                View available courses for your program and semester.
              </p>
              <Link
                to="/courses"
                className="inline-block mt-4 text-blue-600 font-medium hover:underline"
              >
                Go to Courses
              </Link>
            </div>

            <div className="bg-white shadow rounded-xl p-5 border">
              <h2 className="text-lg font-semibold text-gray-800">
                My Courses
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                Check the courses you have already registered.
              </p>
              <Link
                to="/my-courses"
                className="inline-block mt-4 text-blue-600 font-medium hover:underline"
              >
                View My Courses
              </Link>
            </div>

            <div className="bg-white shadow rounded-xl p-5 border">
              <h2 className="text-lg font-semibold text-gray-800">
                My Profile
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                Update your personal information and account details.
              </p>
              <Link
                to="/profile"
                className="inline-block mt-4 text-blue-600 font-medium hover:underline"
              >
                Edit Profile
              </Link>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-blue-900">
              Student Quick Summary
            </h2>
            <p className="text-sm text-blue-800 mt-2">
              Use this dashboard to access course registration, review your
              enrolled courses, and keep your profile up to date.
            </p>
          </div>
        </>
      )}

      {isAdmin && (
        <>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white shadow rounded-xl p-5 border">
              <h2 className="text-lg font-semibold text-gray-800">Courses</h2>
              <p className="text-sm text-gray-600 mt-2">
                Manage all university courses and academic offerings.
              </p>
              <Link
                to="/courses"
                className="inline-block mt-4 text-blue-600 font-medium hover:underline"
              >
                Manage Courses
              </Link>
            </div>

            <div className="bg-white shadow rounded-xl p-5 border">
              <h2 className="text-lg font-semibold text-gray-800">
                Enrollments
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                Review and manage student enrollment requests.
              </p>
              <Link
                to="/admin/enrollments"
                className="inline-block mt-4 text-blue-600 font-medium hover:underline"
              >
                View Enrollments
              </Link>
            </div>

            <div className="bg-white shadow rounded-xl p-5 border">
              <h2 className="text-lg font-semibold text-gray-800">
                Admin Tools
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                Perform academic and administrative management tasks.
              </p>
              <Link
                to="/courses"
                className="inline-block mt-4 text-blue-600 font-medium hover:underline"
              >
                Open Admin Area
              </Link>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-green-900">
              Admin Quick Summary
            </h2>
            <p className="text-sm text-green-800 mt-2">
              Use this dashboard to manage courses, monitor enrollments, and
              oversee student academic operations.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
