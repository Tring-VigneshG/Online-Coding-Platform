import { Routes, Route ,BrowserRouter} from "react-router-dom";
import { ToastContainer } from "react-toastify";  
import "react-toastify/dist/ReactToastify.css";

import CodeEditor from "./components/CodeEditor";
import UserDashboard from "./User/UserDashboard";
import ProblemList from "./User/ProblemList";
import AddProblem from "./User/AddProblem";
import WelcomePage from "./components/WelcomePage";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import ProtectedRoute from "./components/ProtectedRoute.jsx";  
import MyProblems from "./User/Myproblems.jsx";
import EditProblem from "./User/EditProblem.jsx";

function App() {
  return (
    <>
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="signup" element={<SignUp />} />
        <Route path="signin" element={<SignIn />} />

        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<UserDashboard />}>
            <Route index element={<ProblemList />} />
            <Route path="problems" element={<ProblemList />} />
            <Route path="add-problems" element={<AddProblem />} />
            <Route path="my-problems" element={<MyProblems />} />
            <Route path="edit-problem/:id" element={<EditProblem />} />
          </Route>
          <Route path="problems/:id" element={<CodeEditor />} />
        </Route>
      </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
