import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";

export default function App() {
  return (
    <div>
      <Navbar />
      <main style={{ padding: "20px" }}>
        <Outlet />
      </main>
    </div>
  );
}
