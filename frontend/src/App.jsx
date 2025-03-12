import { Routes, Route } from "react-router-dom";
import CodeEditor from "./components/CodeEditor";
import UserDashboard from "./User/UserDashboard";
import ProblemList from "./User/ProblemList";
// import Profile from "./User/Profile"; 
import "./App.css";
import AddProblem from "./User/AddProblem";
import WelcomePage from "./components/WelcomePage";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";

function App() {
  return (
    <Routes>
    <Route path="/" element={<WelcomePage />} />
    <Route path="signup" element={<SignUp />} />
    <Route path="signin" element={<SignIn />} />
    <Route path="dashboard" element={<UserDashboard />}>
      <Route path="problems" element={<ProblemList />} />
      <Route path="add-problems" element={<AddProblem />} />
    </Route>
    <Route path="problems/:id" element={<CodeEditor />} />
  </Routes>
  );
}

export default App;
