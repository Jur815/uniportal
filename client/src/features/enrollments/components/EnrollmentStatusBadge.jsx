import React from "react";

export default function EnrollmentStatusBadge({ status }) {
  const normalized = String(status || "").toLowerCase();

  const styles = {
    display: "inline-block",
    padding: "0.25rem 0.6rem",
    borderRadius: "999px",
    fontSize: "0.8rem",
    fontWeight: 600,
    textTransform: "capitalize",
    border: "1px solid #ddd",
  };

  if (normalized === "approved") {
    styles.backgroundColor = "#ecfdf3";
    styles.color = "#027a48";
    styles.borderColor = "#abefc6";
  } else if (normalized === "rejected") {
    styles.backgroundColor = "#fef3f2";
    styles.color = "#b42318";
    styles.borderColor = "#fecdca";
  } else {
    styles.backgroundColor = "#fffaeb";
    styles.color = "#b54708";
    styles.borderColor = "#fedf89";
  }

  return <span style={styles}>{normalized || "unknown"}</span>;
}
