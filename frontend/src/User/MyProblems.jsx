import React from "react";
import { useQuery, useMutation } from "@apollo/client";
import { gql } from "@apollo/client";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min"; 

const GET_MY_PROBLEMS = gql`
  query GetMyProblems {
    myProblems {
      id
      title
    }
  }
`;

const DELETE_PROBLEM = gql`
  mutation DeleteProblem($id: ID!) {
    deleteProblem(id: $id) {
      success
      message
    }
  }
`;

const MyProblems = () => {
  const { loading, error, data, refetch } = useQuery(GET_MY_PROBLEMS, { fetchPolicy: "network-only" });
  const [deleteProblem] = useMutation(DELETE_PROBLEM);
  const navigate = useNavigate();

  if (loading) return <p className="text-center text-primary">Loading problems...</p>;
  if (error) return <p className="text-danger text-center">Error fetching problems.</p>;

  const handleDelete = async (id) => {
    try {
      await deleteProblem({ variables: { id } });
      toast.success("Problem deleted successfully!", { autoClose: 1000 });
      refetch();
    } catch (err) {
      toast.error("Failed to delete problem.");
    }
  };

  const handleEdit = (id) => {
    navigate(`/dashboard/edit-problem/${id}`);
  };

  return (
    <div className="container mt-4">
      <h2 className="text-primary text-center">My Problems</h2>
      <table className="table table-light table-bordered mt-3">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data?.myProblems.map((problem) => (
            <tr key={problem.id} className="align-middle">
              <td><strong>{problem.id}</strong></td>
              <td>{problem.title}</td>
              <td>
                
                <button
                  className="btn btn-outline-primary btn-sm me-2"
                  onClick={() => handleEdit(problem.id)}
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Edit this problem"
                >
                  ✏️
                </button>

         
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => handleDelete(problem.id)}
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Delete this problem"
                >
                  🗑️
                </button>

              
                <Link
                  to={`/problems/${problem.id}`}
                  className="btn btn-outline-warning btn-sm ms-2"
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="View problem details"
                >
                  👁️
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MyProblems;
