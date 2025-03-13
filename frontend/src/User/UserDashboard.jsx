import React from "react";
import { Outlet, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
const UserDashboard = () => {
  return (
    <div className="d-flex vh-100">
      <div className="d-flex flex-column bg-dark text-white p-3" style={{ width: "250px" }}>
        <h1 className="h4 fw-bold text-warning">Coding Platform</h1>
        <nav className="mt-4">
          <Link to="problems" className="d-block text-light text-decoration-none fw-semibold py-2 px-3 rounded sidebar-link">
            Problems
          </Link>
          <Link to="add-problems" className="d-block text-light text-decoration-none fw-semibold py-2 px-3 rounded sidebar-link">
            Add Problems
          </Link>
          <Link to="my-problems" className="d-block text-light text-decoration-none fw-semibold py-2 px-3 rounded sidebar-link">
            My Problems
          </Link>
          <Link to="profile" className="d-block text-light text-decoration-none fw-semibold py-2 px-3 rounded sidebar-link mt-2">
            Profile
          </Link>
        </nav>
      </div>
      <div className=" bg-light flex-grow-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};
export default UserDashboard;
