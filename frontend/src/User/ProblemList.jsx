import React, { useState } from "react";
import { Link } from "react-router-dom";
import { gql, useQuery } from "@apollo/client";

const GET_PROBLEMS = gql`
  query GetProblems {
    problems {
      id
      title
      difficulty
    }
  }
`;

const GET_USER_SUBMISSIONS = gql`
  query GetUserSubmissions {
    submissions {
      problemId
      status
    }
  }
`;

const ProblemList = () => {
  const { loading, error, data } = useQuery(GET_PROBLEMS, { fetchPolicy: "network-only" });
  const { data: submissionsData } = useQuery(GET_USER_SUBMISSIONS);

  const [filter, setFilter] = useState("Unsolved");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const problemsPerPage = 5;

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-danger">Error: {error.message}</p>;

  const solvedProblemIds = new Set(
    submissionsData?.submissions
      ?.filter((sub) => sub.status === "Accepted")
      .map((sub) => sub.problemId)
  );

 
  const filteredProblems = data.problems
    .filter((problem) => (filter === "Solved" ? solvedProblemIds.has(problem.id) : !solvedProblemIds.has(problem.id)))
    .filter((problem) => problem.title.toLowerCase().includes(searchTerm.toLowerCase()));

 
  const totalPages = Math.ceil(filteredProblems.length / problemsPerPage);
  const startIndex = (currentPage - 1) * problemsPerPage;
  const paginatedProblems = filteredProblems.slice(startIndex, startIndex + problemsPerPage);

  return (
    <div className="container">
      <h2 className="mb-4 text-warning">Problems</h2>

      
      <input
        type="text"
        className="form-control mb-3"
        placeholder="Search problems..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

     
      <div className="mb-3">
        <button
          className={`btn ${filter === "Unsolved" ? "btn-warning" : "btn-outline-warning"} me-2`}
          onClick={() => setFilter("Unsolved")}
        >
          Unsolved Problems
        </button>
        <button
          className={`btn ${filter === "Solved" ? "btn-success" : "btn-outline-success"}`}
          onClick={() => setFilter("Solved")}
        >
          Solved Problems
        </button>
      </div>

    
      <div className="p-4 list-group">
        {paginatedProblems.length > 0 ? (
          paginatedProblems.map((problem) => (
            <div key={problem.id} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-1">{problem.title}</h5>
                <small className={`text-${problem.difficulty === "Easy" ? "success" : problem.difficulty === "Medium" ? "warning" : "danger"}`}>
                  {problem.difficulty}
                </small>
              </div>
              <Link to={`/problems/${problem.id}`} className="btn btn-warning">Solve</Link>
            </div>
          ))
        ) : (
          <p className="text-muted">No {filter.toLowerCase()} problems found.</p>
        )}
      </div>

      {filteredProblems.length > problemsPerPage && (
        <nav className="mt-3">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>
                Previous
              </button>
            </li>
            {[...Array(totalPages).keys()].map((page) => (
              <li key={page + 1} className={`page-item ${currentPage === page + 1 ? "active" : ""}`}>
                <button className="page-link" onClick={() => setCurrentPage(page + 1)}>
                  {page + 1}
                </button>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>
                Next
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
};

export default ProblemList;
