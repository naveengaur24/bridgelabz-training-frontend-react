import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Reusable alert toast state function for other pages
export let showToast = () => {};

export const Login = () => {
  const { login, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isLoggedIn) {
      navigate('/', { replace: true });
    }
  }, [isLoggedIn, navigate]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [isErrorToast, setIsErrorToast] = useState(false);
  const [showToastAlert, setShowToastAlert] = useState(false);

  const triggerToast = (msg, isErr = false) => {
    setToastMsg(msg);
    setIsErrorToast(isErr);
    setShowToastAlert(true);
    setTimeout(() => {
      setShowToastAlert(false);
    }, 4000);
  };

  // Expose toast trigger globally
  showToast = triggerToast;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login(email, password);
      if (res.success) {
        triggerToast(`Welcome back, ${res.data.name}!`);
        // Slight delay to allow toast visibility before navigate
        setTimeout(() => {
          navigate('/');
        }, 800);
      }
    } catch (err) {
      console.error(err);
      triggerToast(err.message || 'Login failed. Invalid credentials.', true);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card animated">
        
        <div className="auth-brand">
          <i className="bi bi-lightbulb-fill"></i>
          <span>Fundoo Notes</span>
        </div>

        <h4 className="text-center mb-4 font-title fw-bold">Sign In</h4>
        
        <form onSubmit={handleSubmit}>
          <div className="form-floating mb-3">
            <input
              type="email"
              className="form-control"
              id="login-email"
              placeholder="name@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label htmlFor="login-email">Email address</label>
          </div>

          <div className="form-floating mb-3">
            <input
              type="password"
              className="form-control"
              id="login-password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label htmlFor="login-password">Password</label>
          </div>

          <button type="submit" className="btn btn-keep w-100 mb-3">
            Login
          </button>

          <div className="d-flex justify-content-between mt-2">
            <Link to="/register" className="auth-link">Create Account</Link>
            <Link to="/forgot-password" className="auth-link">Forgot Password?</Link>
          </div>
        </form>

      </div>

      {/* Global alert toast */}
      {showToastAlert && (
        <div className="toast-container position-fixed bottom-0 start-0 p-3" style={{ zIndex: 1060 }}>
          <div
            className={`toast align-items-center text-white border-0 shadow show ${isErrorToast ? 'bg-danger' : 'bg-dark'}`}
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            style={{ borderRadius: '8px' }}
          >
            <div className="d-flex">
              <div className="toast-body">{toastMsg}</div>
              <button
                type="button"
                className="btn-close btn-close-white me-2 m-auto"
                onClick={() => setShowToastAlert(false)}
              ></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
