import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Register = () => {
  const { register, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isLoggedIn) {
      navigate('/', { replace: true });
    }
  }, [isLoggedIn, navigate]);

  const [name, setName] = useState('');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await register(name, email, password);
      if (res.success) {
        triggerToast('Registration successful! Please login.');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      triggerToast(err.message || 'Registration failed.', true);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card animated">
        
        <div className="auth-brand">
          <i className="bi bi-lightbulb-fill"></i>
          <span>Fundoo Notes</span>
        </div>

        <h4 className="text-center mb-4 font-title fw-bold">Create Account</h4>
        
        <form onSubmit={handleSubmit}>
          <div className="form-floating mb-3">
            <input
              type="text"
              className="form-control"
              id="register-name"
              placeholder="John Doe"
              required
              minLength="2"
              maxLength="50"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <label htmlFor="register-name">Full Name</label>
          </div>

          <div className="form-floating mb-3">
            <input
              type="email"
              className="form-control"
              id="register-email"
              placeholder="name@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label htmlFor="register-email">Email address</label>
          </div>

          <div className="form-floating mb-3">
            <input
              type="password"
              className="form-control"
              id="register-password"
              placeholder="Password"
              required
              minLength="6"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label htmlFor="register-password">Password (min 6 chars)</label>
          </div>

          <button type="submit" className="btn btn-keep w-100 mb-3">
            Sign Up
          </button>

          <div className="text-center">
            <Link to="/login" className="auth-link">Already have an account? Login</Link>
          </div>
        </form>

      </div>

      {/* Alert toast */}
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
