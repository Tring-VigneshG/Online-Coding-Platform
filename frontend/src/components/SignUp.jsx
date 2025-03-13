import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import validator from "validator";
import { gql, useMutation } from "@apollo/client";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SIGNUP_MUTATION = gql`
  mutation Signup($name: String!, $email: String!, $password: String!) {
    signup(name: $name, email: $email, password: $password) {
      token
      user {
        id
        name
        email
      }
    }
  }
`;

const SignUp = () => {
    const navigate = useNavigate(); 
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [nameError, setNameError] = useState(null);
    const [emailError, setEmailError] = useState(null);
    const [passwordError, setPasswordError] = useState(null);
    const [touched, setTouched] = useState({ name: false, email: false, password: false });

    const [signup, { loading }] = useMutation(SIGNUP_MUTATION);

    useEffect(() => {
        if (touched.name) {
            setNameError(name.trim().length === 0 ? "Name cannot be empty." : null);
        }
        if (touched.email) {
            setEmailError(validator.isEmail(email) ? null : "Invalid email format.");
        }
        if (touched.password) {
            setPasswordError(
                validator.isStrongPassword(password, {
                    minLength: 8,
                    minUppercase: 1,
                    minLowercase: 1,
                    minNumbers: 1,
                    minSymbols: 1,
                }) ? null : "Password must be 8+ chars, 1 uppercase, 1 number, 1 symbol."
            );
        }
    }, [name, email, password, touched]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setTouched({ name: true, email: true, password: true });
        const nameValidation = name.trim().length === 0 ? "Name cannot be empty." : null;
        const emailValidation = validator.isEmail(email) ? null : "Invalid email format.";
        const passwordValidation = validator.isStrongPassword(password, {
            minLength: 8,
            minUppercase: 1,
            minLowercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        }) ? null : "Password must be 8+ chars, 1 uppercase, 1 number, 1 symbol.";

        setNameError(nameValidation);
        setEmailError(emailValidation);
        setPasswordError(passwordValidation);

        if (nameValidation || emailValidation || passwordValidation) return;

        try {
            const { data } = await signup({ variables: { name, email, password } });
            if (data?.signup?.token) {
                localStorage.setItem("token", data.signup.token);
                toast.success(`Signup successful! Welcome, ${data.signup.user.name}.`, { position: "top-right" });
                setName("");
                setEmail("");
                setPassword("");
                setTouched({ name: false, email: false, password: false });
                setTimeout(() => {
                    navigate("/signin");
                }, 2000);
            }
        } catch (err) {
            if (err.message.includes("Email already exists")) {
                toast.error("Email already exists. Please use a different email.", { position: "top-right" });
            } else {
                toast.error("Signup failed. Please try again.", { position: "top-right" });
            }
        }
    };

    return (
        <div className="d-flex align-items-center justify-content-center vh-100 bg-dark text-white">
            <ToastContainer /> 
            <div className="card bg-black text-light p-4" style={{ width: "350px" }}>
                <h2 className="text-center text-warning">Sign Up</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Full Name</label>
                        <input
                            type="text"
                            className="form-control bg-dark text-white"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onBlur={() => setTouched((prev) => ({ ...prev, name: true }))} 
                        />
                        {touched.name && nameError && <small className="text-danger">{nameError}</small>}
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-control bg-dark text-white"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onBlur={() => setTouched((prev) => ({ ...prev, email: true }))} 
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
                    <button type="submit" className="btn btn-warning w-100" disabled={loading}>
                        {loading ? "Signing Up..." : "Register"}
                    </button>
                </form>

                <p className="mt-3 text-center">
                    Already have an account? <a href="/signin" className="text-warning">Sign In</a>
                </p>
            </div>
        </div>
    );
};

export default SignUp;
