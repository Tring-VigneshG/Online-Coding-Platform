import React, { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import { gql, useMutation, useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const GET_PROBLEM = gql`
  query GetProblem($id: ID!) {
    problem(id: $id) {
      id
      title
      description
      difficulty
      examples
      problem_constraints
    }
  }
`;

const RUN_CODE_MUTATION = gql`
  mutation RunCode($problemId: Int!, $language: String!, $code: String!) {
    runCode(problemId: $problemId, language: $language, code: $code) {
      input
      expectedOutput
      actualOutput
      passed
    }
  }
`;

const SUBMIT_CODE_MUTATION = gql`
  mutation SubmitCode($problemId: Int!, $language: String!, $code: String!) {
    submitCode(problemId: $problemId, language: $language, code: $code) {
      id
      status
    }
  }
`;

const GET_SUBMISSIONS = gql`
  query GetSubmissions($problemId: Int!) {
    submissions(problemId: $problemId) {
      id
      language
      status
      createdAt
      code
    }
  }
`;

const CodeEditor = () => {
  const { id } = useParams();
  const { loading, error, data } = useQuery(GET_PROBLEM, { variables: { id } });

  const { data: submissionsData, refetch: refetchSubmissions } = useQuery(GET_SUBMISSIONS, {
    variables: { problemId: parseInt(id) },
  });

  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("# Write your code here...");
  const [activeTab, setActiveTab] = useState("Description");
  const [testResults, setTestResults] = useState([]);
  const [rawOutput, setRawOutput] = useState("No output yet");
  const [allTestsPassed, setAllTestsPassed] = useState(false);

  const [runCodeMutation, { loading: runLoading }] = useMutation(RUN_CODE_MUTATION);
  const [submitCode] = useMutation(SUBMIT_CODE_MUTATION);

  useEffect(() => {
    if (language === "java") {
      setCode("// Write your code here...");
    } else {
      setCode("# Write your code here...");
    }
  }, [language]);

  const runCode = async () => {
    const { data } = await runCodeMutation({
      variables: { problemId: parseInt(id), language, code },
    });

    setTestResults(data.runCode);

    setRawOutput(data.runCode.map(tc => tc.actualOutput).join("\n"));
    setActiveTab("Test Cases");
    setAllTestsPassed(data.runCode.every(tc => tc.passed));
  };

  const handleSubmitCode = async () => {
    const { data } = await submitCode({
      variables: { problemId: parseInt(id), language, code },
    });

    alert(`Submission Status: ${data.submitCode.status}`);
    refetchSubmissions();
  };

  const loadSubmission = (submissionCode) => {
    setCode(submissionCode);
    console.log(submissionCode);
  };

  if (loading) return <p className="text-light">Loading problem...</p>;
  if (error) return <p className="text-danger">Error loading problem: {error.message}</p>;

  return (
    <div className="container-fluid vh-100 d-flex p-0 w-100 m-0">
      <div className="col-4 bg-dark text-light p-4">
        <ul className="nav nav-tabs mb-3">
          {["Description", "Examples", "Constraints", "Test Cases", "Submission History"].map(tab => (
            <li className="nav-item" key={tab}>
              <button
                className={`nav-link ${activeTab === tab ? "active text-warning" : "text-secondary"}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            </li>
          ))}
        </ul>

        <div>
          {activeTab === "Description" && (
            <>
              <h4 className="text-warning">{data.problem.title}</h4>
              <div dangerouslySetInnerHTML={{ __html: data.problem.description }} />
              <p><strong>Difficulty:</strong> {data.problem.difficulty}</p>
            </>
          )}
          {activeTab === "Examples" && (
            <div className="bg-secondary p-3 rounded" dangerouslySetInnerHTML={{ __html: data.problem.examples }} />
          )}
          {activeTab === "Constraints" && (
            <div dangerouslySetInnerHTML={{ __html: data.problem.problem_constraints }} />
          )}
          {activeTab === "Test Cases" && (
            <div className="p-3 rounded  text-light">
              <h5 className="fw-bold text-warning">Test Case Results</h5>
              {testResults.length > 0 ? (
                testResults.map((test, index) => (
                  <div
                    key={index}
                    className={`p-3 mb-3 rounded shadow ${test.passed ? "bg-success text-light" : "bg-danger text-light"}`}
                  >
                    <h6 className="fw-bold">{test.passed ? "✅ Passed" : "Failed"}</h6>
                    <p className="mb-1"><strong>📝 Input:</strong> <code className="bg-light text-dark p-1 rounded">{test.input}</code></p>
                    <p className="mb-1"><strong>✅ Expected:</strong> <span className="text-warning">{test.expectedOutput}</span></p>
                    <p className="mb-1"><strong>🔴 Actual:</strong> <span className="fw-bold">{test.actualOutput}</span></p>
                  </div>
                ))
              ) : (
                <p className="text-light text-center fw-bold">No test cases executed yet.</p>
              )}
            </div>
          )}


          {activeTab === "Submission History" && submissionsData && (
            <div className="bg-secondary p-3 rounded">
              {submissionsData.submissions.map(sub => (
                <pre key={sub.id} className="p-2 border-bottom">
                  <b>📅 Date:</b> {new Date(parseInt(sub.createdAt)).toLocaleString()} {'\n'}
                  <b>💻 Language:</b> {sub.language} {'\n'}
                  <button className="btn btn-sm btn-warning mt-2" onClick={() => loadSubmission(sub.code)}>View in Editor</button>
                  <b>✅ Status:</b> {sub.status}
                </pre>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="col-8 d-flex flex-column p-4 bg-dark text-light">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="text-warning">Code Editor</h2>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className="form-select w-auto">
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>
        </div>

        <Editor height="50vh" language={language} value={code} onChange={setCode} theme="vs-dark" />

        <button onClick={runCode} className="btn btn-warning w-100 fw-bold mt-3" disabled={runLoading}>
          {runLoading ? "Running..." : "Run Code"}
        </button>

        {allTestsPassed && (
          <button onClick={handleSubmitCode} className="btn btn-success w-100 fw-bold mt-3">
            Submit Code
          </button>
        )}
      </div>
    </div>
  );
};

export default CodeEditor;