import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ForgotPassword = () => {
  const { forgotPassword, resetPassword, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isLoggedIn) {
      navigate('/', { replace: true });
    }
  }, [isLoggedIn, navigate]);

  const [step, setStep] = useState(1); // 1: send OTP, 2: reset password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

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

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    try {
      triggerToast('Sending OTP verification code to your email...');
      const res = await forgotPassword(cleanEmail);
      if (res.success) {
        triggerToast('Verification code sent successfully!');
        setStep(2);
      }
    } catch (err) {
      console.error(err);
      triggerToast(err.message || 'Failed to send OTP code.', true);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    const cleanOtp = otp.trim();
    try {
      triggerToast('Resetting your password...');
      const res = await resetPassword(cleanEmail, cleanOtp, newPassword);
      if (res.success) {
        triggerToast('Password reset successful! You can now log in.');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      triggerToast(err.message || 'Password reset failed.', true);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card animated">
        
        <div className="auth-brand">
          <i className="bi bi-lightbulb-fill"></i>
          <span>Fundoo Notes</span>
        </div>

        <h4 className="text-center mb-2 font-title fw-bold">
          {step === 1 ? 'Password Recovery' : 'Reset Password'}
        </h4>
        <p className="text-muted text-center mb-4 small">
          {step === 1
            ? 'Enter your email to receive a 6-digit verification code.'
            : `A 6-digit OTP code was sent to ${email}. Enter it below with your new password.`}
        </p>

        {/* Step 1: Request OTP Form */}
        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <div className="form-floating mb-3">
              <input
                type="email"
                className="form-control"
                id="forgot-email"
                placeholder="name@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label htmlFor="forgot-email">Email address</label>
            </div>
            <button type="submit" className="btn btn-keep w-100 mb-3">
              Send Verification Code
            </button>
          </form>
        )}

        {/* Step 2: Reset Password Form */}
        {step === 2 && (
          <form onSubmit={handleResetPassword}>
            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control text-center fs-4 fw-bold"
                id="reset-otp"
                placeholder="123456"
                required
                minLength="6"
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                style={{ letterSpacing: '5px' }}
              />
              <label htmlFor="reset-otp">6-Digit OTP</label>
            </div>

            <div className="form-floating mb-3">
              <input
                type="password"
                className="form-control"
                id="reset-new-password"
                placeholder="New Password"
                required
                minLength="6"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <label htmlFor="reset-new-password">New Password (min 6 chars)</label>
            </div>

            <button type="submit" className="btn btn-keep w-100 mb-3">
              Reset Password
            </button>
          </form>
        )}

        <div className="text-center mt-2">
          <Link to="/login" className="auth-link">Back to Login</Link>
        </div>

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
