import React, { useState, useEffect } from "react";
import { gql, useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom"; 
import { FaEye, FaEyeSlash } from "react-icons/fa"; 
import validator from "validator";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SIGNIN_MUTATION = gql`
  mutation Signin($email: String!, $password: String!) {
    signin(email: $email, password: $password) {
      token
      user {
        id
        name
        email
      }
    }
  }
`;

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [touched, setTouched] = useState({ email: false, password: false });

  const navigate = useNavigate();
  const [signin, { loading }] = useMutation(SIGNIN_MUTATION);

  useEffect(() => {
    if (touched.email) {
      setEmailError(validator.isEmail(email) ? null : "Invalid email format.");
    }
    if (touched.password) {
      setPasswordError(password.length !=0 ? null : "Password cannot be empty");
    }
  }, [email, password, touched]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setTouched({ email: true, password: true });

    if (!validator.isEmail(email) || password.length ==0) {
      return; 
    }

    try {
      const { data } = await signin({ variables: { email, password } });
      if (data?.signin?.token) {
        localStorage.setItem("token", data.signin.token);
        toast.success("Login successful!", { autoClose: 1000 });
        navigate("/dashboard"); 
      }
    } catch (err) {
      toast.error(err.message || "Invalid email or password.", { autoClose: 3000 });
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-dark text-white">
      <div className="card bg-black text-light p-4" style={{ width: "350px" }}>
        <h2 className="text-center text-warning">Sign In</h2>
        {error && <p className="text-danger text-center">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control bg-dark text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
              required
            />
            {touched.email && emailError && <small className="text-danger">{emailError}</small>}
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"} 
                className="form-control bg-dark text-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, password: true }))} 
                
              />
              <span
                className="input-group-text bg-dark text-white"
                onClick={() => setShowPassword(!showPassword)}
                style={{ cursor: "pointer" }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />} 
              </span>
            </div>
            {touched.password && passwordError && <small className="text-danger">{passwordError}</small>}
          </div>
          <button type="submit" className="btn btn-warning w-100" disabled={loading || emailError || passwordError}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
        <p className="mt-3 text-center">
          Don't have an account? <a href="/signup" className="text-warning">Sign Up</a>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
