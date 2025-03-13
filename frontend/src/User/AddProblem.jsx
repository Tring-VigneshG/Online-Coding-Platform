import React, { useEffect, useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Editor from "@monaco-editor/react";

const ADD_PROBLEM = gql`
  mutation AddProblem($title: String!, $description: String!, $examples: String!, $constraints: String!,  $difficulty:String!,$solutionCode: String!, $solutionLanguage: String!, $testCases: [TestCaseInput!]!) {
    addProblem(title: $title, description: $description, examples: $examples, constraints: $constraints, difficulty:$difficulty, solutionCode: $solutionCode, solutionLanguage: $solutionLanguage, testCases: $testCases) {
      id
      title
    }
  }
`;

const AddProblem = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [examples, setExamples] = useState("");
  const [constraints, setConstraints] = useState("");
  const [solutionCode, setSolutionCode] = useState("# Write your code here...");
  const [solutionLanguage, setSolutionLanguage] = useState("python");
  const [testCases, setTestCases] = useState([{ input: "", expected_output: "" }]);
  const [difficulty, setDifficulty] = useState("Easy");
  const navigate = useNavigate();
  const [addProblem] = useMutation(ADD_PROBLEM);
  useEffect(()=>{
  setSolutionCode(solutionLanguage=="python"?"# Write your code here...":"// Write your code here");
  },[solutionLanguage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addProblem({
      variables: { title, description, examples, constraints,  solutionCode: solutionCode,difficulty, solutionLanguage, testCases },
    });
    alert("Problem Added Successfully!");
    navigate("/dashboard");
  };

  const handleTestCaseChange = (index, field, value) => {
    const updatedTestCases = [...testCases];
    updatedTestCases[index][field] = value;
    setTestCases(updatedTestCases);
  };

  const addTestCase = () => {
    setTestCases([...testCases, { input: "", expected_output: "" }]);
  };

  return (
    <div className="container mt-4">
      <h2 className="text-warning">Add Problem</h2>
      <form onSubmit={handleSubmit}>
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
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        
        <div className="mb-3">
          <label className="form-label">Solution code Language</label>
          <select className="form-control" value={solutionLanguage} onChange={(e) => setSolutionLanguage(e.target.value)}>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Solution Code</label>
          <Editor
            height="200px"
            defaultLanguage={solutionLanguage}
            value={solutionCode}
            onChange={setSolutionCode}
          />
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
              className="form-control"
              placeholder="Expected Output"
              value={testCase.expectedOutput}
              onChange={(e) => handleTestCaseChange(index, "expected_output", e.target.value)}
            />
          </div>
        ))}
        <button type="button" className="btn btn-secondary mb-3" onClick={addTestCase}>Add Test Case</button>
        
        <button type="submit" className="btn btn-warning mb-3 ms-1">Add Problem</button>
      </form>
    </div>
  );
};

export default AddProblem;
