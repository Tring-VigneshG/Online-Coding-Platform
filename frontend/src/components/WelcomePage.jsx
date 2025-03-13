import React from "react";

const WelcomePage = () => {
  return (
    <div className="bg-dark text-white min-vh-100">

      <nav className="navbar navbar-expand-lg navbar-dark bg-black px-3">
        <a href="#" className="navbar-brand fw-bold fs-4 text-warning">
          CodeMaster
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <a href="/signin" className="nav-link text-light">
                Login
              </a>
            </li>
            <li className="nav-item">
              <a href="/signup" className="nav-link text-light">
                Register
              </a>
            </li>
          </ul>
        </div>
      </nav>

    
      <div className="container text-center py-5">
        <div className="row justify-content-center align-items-center">
          <div className="col-md-8">
            <h1 className="display-4 fw-bold text-warning">
              Welcome to CodeMaster
            </h1>
            <p className="lead mt-3">
              The ultimate coding platform to test your skills, solve problems,
              and challenge yourself like never before.
            </p>
            <div className="mt-4">
              <a href="/signup" className="btn btn-warning me-3">
                Get Started
              </a>
              <a href="/signin" className="btn btn-outline-light">
                Login
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
