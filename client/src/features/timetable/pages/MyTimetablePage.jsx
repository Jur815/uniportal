import React, { useEffect, useMemo, useState } from "react";

import { getMyTimetable } from "../../../api/timetable.api";
import Card from "../../../components/ui/Card";
import EmptyState from "../../../components/ui/EmptyState";
import Loader from "../../../components/ui/Loader";
import PageHeader from "../../../components/ui/PageHeader";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function MyTimetablePage() {
  const [entries, setEntries] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadTimetable = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getMyTimetable();

        if (!isMounted) return;
        setEntries(response?.data?.entries || []);
        setActiveSession(response?.data?.activeSession || null);
      } catch (err) {
        if (!isMounted) return;
        setError(err?.response?.data?.message || "Failed to load timetable");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadTimetable();

    return () => {
      isMounted = false;
    };
  }, []);

  const groupedEntries = useMemo(() => {
    return DAYS.map((day) => ({
      day,
      entries: entries
        .filter((entry) => entry.dayOfWeek === day)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    })).filter((group) => group.entries.length > 0);
  }, [entries]);

  if (loading) return <Loader text="Loading your timetable..." />;
  if (error) return <EmptyState title={error} />;

  return (
    <div>
      <PageHeader
        title="My Timetable"
        subtitle={
          activeSession
            ? `${activeSession.academicYear} / Semester ${activeSession.semester}`
            : "Your active academic timetable"
        }
      />

      {entries.length === 0 ? (
        <EmptyState title="No timetable entries found for your current registration context." />
      ) : (
        <div className="timetable-day-list">
          {groupedEntries.map((group) => (
            <Card key={group.day}>
              <div className="timetable-day-header">
                <h2>{group.day}</h2>
                <span>{group.entries.length} class(es)</span>
              </div>

              <div className="responsive-table">
                <table>
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Course</th>
                      <th>Venue</th>
                      <th>Lecturer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.entries.map((entry) => (
                      <tr key={entry._id}>
                        <td>
                          {entry.startTime} - {entry.endTime}
                        </td>
                        <td>
                          <strong>{entry.course?.code || "Course"}</strong>
                          <br />
                          {entry.course?.title || "Untitled course"}
                        </td>
                        <td>{entry.venue}</td>
                        <td>{entry.lecturerName || "To be assigned"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
