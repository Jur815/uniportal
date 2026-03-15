import React from "react";

export default function EmptyState({ title, subtitle = "" }) {
  return (
    <div className="empty-state">
      <h3 className="empty-state-title">{title}</h3>
      {subtitle && <p className="empty-state-subtitle">{subtitle}</p>}
    </div>
  );
}
