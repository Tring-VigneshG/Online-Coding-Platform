import React, { useEffect, useState } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { useParams, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Editor from "@monaco-editor/react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const GET_PROBLEM = gql`
  query GetProblem($id: ID!) {
    problem(id: $id) {
      id
      title
      description
      examples
      problem_constraints
      difficulty
      solution_code
      solution_language
      testCases {
        input
        expected_output
      }
    }
  }
`;

const UPDATE_PROBLEM = gql`
  mutation UpdateProblem(
    $id: ID!
    $title: String!
    $description: String!
    $examples: String!
    $constraints: String!
    $difficulty: String!
    $solutionCode: String!
    $solutionLanguage: String!
    $testCases: [TestCaseInput!]!
  ) {
    updateProblem(
      id: $id
      title: $title
      description: $description
      examples: $examples
      constraints: $constraints
      difficulty: $difficulty
      solutionCode: $solutionCode
      solutionLanguage: $solutionLanguage
      testCases: $testCases
    ) {
      id
      title
    }
  }
`;

const EditProblem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, error, data } = useQuery(GET_PROBLEM, { variables: { id },fetchPolicy:"network-only" });
  const [updateProblem] = useMutation(UPDATE_PROBLEM);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [examples, setExamples] = useState("");
  const [constraints, setConstraints] = useState("");
  const [solutionCode, setSolutionCode] = useState("");
  const [solutionLanguage, setSolutionLanguage] = useState("python");
  const [testCases, setTestCases] = useState([]);
  const [difficulty, setDifficulty] = useState("Easy");

  useEffect(() => {
    if (data?.problem) {
      const problem = data.problem;
      setTitle(problem.title);
      setDescription(problem.description);
      setExamples(problem.examples);
      setConstraints(problem.problem_constraints);
      setSolutionCode(problem.solution_code);
      setSolutionLanguage(problem.solution_language);
      setTestCases(problem.testCases);
      setDifficulty(problem.difficulty);
    }
  }, [data]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const hasValidTestCase = testCases.some(tc => tc.input.trim() !== "" && tc.expected_output.trim() !== "");

    if (!hasValidTestCase) {
      toast.error("At least one test case must have an input and an expected output!", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    const sanitizedTestCases = testCases.map(({ __typename, ...rest }) => rest);
    
    try {
      await updateProblem({
        variables: { id, title, description, examples, constraints, solutionCode, difficulty, solutionLanguage, testCases:sanitizedTestCases },
      });
      toast.success("Problem Updated Successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
      navigate("/dashboard/my-problems");
    } catch (err) {
      console.log("Update failed", err);
    }
  };

  const handleTestCaseChange = (index, field, value) => {
    const updatedTestCases = [...testCases];
    updatedTestCases[index][field] = value;
    setTestCases(updatedTestCases);
  };

  const addTestCase = () => {
    setTestCases([...testCases, { input: "", expected_output: "" }]);
  };

  const deleteTestCase = (index) => {
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  if (loading) return <p className="text-center text-warning">Loading problem...</p>;
  if (error) return <p className="text-danger text-center">Error fetching problem.</p>;

  return (
    <div className="container mt-4">
      <h2 className="text-warning">Edit Problem</h2>
      <form onSubmit={handleUpdate}>
        <div className="mb-3">
          <label className="form-label">Problem Title</label>
          <input type="text" className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div className="mb-3">
          <label className="form-label">Description</label>
          <ReactQuill value={description} onChange={setDescription} />
        </div>

        <div className="mb-3">
          <label className="form-label">Example</label>
          <ReactQuill value={examples} onChange={setExamples} />
        </div>

        <div className="mb-3">
          <label className="form-label">Constraint</label>
          <ReactQuill value={constraints} onChange={setConstraints} />
        </div>

        <div className="mb-3">
          <label className="form-label">Difficulty</label>
          <select className="form-control" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Solution Code Language</label>
          <select className="form-control" value={solutionLanguage} onChange={(e) => setSolutionLanguage(e.target.value)}>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Solution Code</label>
          <Editor height="200px" language={solutionLanguage} value={solutionCode} onChange={setSolutionCode} />
        </div>

        <h3 className="text-warning">Test Cases</h3>
        {testCases.map((testCase, index) => (
          <div key={index} className="mb-3">
            <label className="form-label">Test Case {index + 1}</label>
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Input"
              value={testCase.input}
              onChange={(e) => handleTestCaseChange(index, "input", e.target.value)}
            />
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Expected Output"
              value={testCase.expected_output}
              onChange={(e) => handleTestCaseChange(index, "expected_output", e.target.value)}
            />
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => deleteTestCase(index)}
            >
              Delete
            </button>
          </div>
        ))}

        <button type="button" className="btn btn-secondary mb-3" onClick={addTestCase}>
          Add Test Case
        </button>

        <button type="submit" className="btn btn-warning mb-3 ms-1">Update Problem</button>
      </form>
    </div>
  );
};

export default EditProblem;
