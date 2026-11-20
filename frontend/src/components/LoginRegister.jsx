import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, User, Lock, Mail, ArrowRight, AlertCircle, BadgeCheck, Briefcase, Building } from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';
import { apiFetch } from '../utils/api';

export default function LoginRegister({ onAuthSuccess }) {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  
  // State updated to match backend Pydantic schemas
  const [employeeId, setEmployeeId] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('officer');
  const [department, setDepartment] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const turnstileRef = useRef(null);
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  const resetTurnstile = () => {
    setTurnstileToken('');
    turnstileRef.current?.reset();
  };

  const handleDemoLogin = () => {
    // Pull demo credentials from environment variables, fallback to defaults if missing
    const demoId = import.meta.env.VITE_DEMO_ADMIN_ID || 'ADMIN-001';
    const demoPassword = import.meta.env.VITE_DEMO_ADMIN_PASSWORD || 'admin123';

    setEmployeeId(demoId);
    setPassword(demoPassword);
    setIsLogin(true);
    setError('');
    
    // Auto-submit after a brief delay so evaluators see the fields populate
    setTimeout(() => {
      const submitBtn = document.getElementById('login-form-submit');
      if (submitBtn) submitBtn.click();
    }, 400);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (siteKey && !turnstileToken) {
      setError(t('auth.botError', 'Please complete the security check.'));
      return;
    }

    setLoading(true);

    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    
    // Construct payload exactly as FastAPI schemas expect
    const payload = isLogin
      ? { 
          employee_id: employeeId, 
          password: password,
          turnstile_token: turnstileToken,
        }
      : { 
          employee_id: employeeId, 
          full_name: fullName,
          email: email, 
          password: password,
          role: role,
          department: department || null,
          turnstile_token: turnstileToken,
        };

    try {
      const response = await apiFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response) {
        throw new Error(t('auth.authFailed', 'Authentication failed. Please check your credentials.'));
      }

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 422) {
          throw new Error(t('auth.validationError', 'Validation Error: Please check your input fields.'));
        }
        throw new Error(data.detail || t('auth.authFailed', 'Authentication failed.'));
      }

      if (isLogin) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('username', data.user.full_name); 
        localStorage.setItem('userRole', data.user.role);
        onAuthSuccess(data.user.full_name, data.user.role);
      } else {
        resetTurnstile();
        setIsLogin(true);
        setError('');
        alert(t('auth.accountCreated', 'Account created successfully! Please sign in.'));
      }
    } catch (err) {
      resetTurnstile();
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        
        {/* Left Branding Side */}
        <div className="auth-left">
          <div>
            <div className="auth-logo">G</div>
            <span className="auth-subtitle">{t('auth.govAccess', 'Government Access')}</span>
            <h2 className="auth-title">{t('auth.welcomeTitle', 'Welcome to the Resolution Portal')}</h2>
            <p className="auth-desc">
              {t('auth.welcomeDesc', 'Sign in to access secure government services, AI-guided decisions, and document workflows for public administration.')}
            </p>
          </div>
          <div className="auth-secure">
            <ShieldCheck size={16} color="#059669" />
            {t('auth.encrypted', '256-bit Encrypted Government Channel')}
          </div>
        </div>

        {/* Right Form Side */}
        <div className="auth-right">
          <div style={{ marginBottom: '1.5rem' }}>
            <span className="auth-subtitle">{t('auth.secureAuth', 'Secure Auth')}</span>
            <h3 className="auth-title" style={{ fontSize: '1.5rem' }}>
              {isLogin ? t('auth.signInContinue', 'Sign in to continue') : t('auth.createAccount', 'Create an account')}
            </h3>
          </div>

          {error && (
            <div className="auth-error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            
            {/* Employee ID (Required for both) */}
            <div className="form-group">
              <label>{t('auth.employeeId', 'Employee ID')}</label>
              <div className="input-icon-wrapper">
                <BadgeCheck size={16} />
                <input
                  type="text"
                  required
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder={t('auth.empIdPlaceholder', 'e.g. EMP-12345')}
                  className="auth-input"
                  minLength={3}
                  maxLength={20}
                />
              </div>
            </div>

            {/* Additional Fields for Registration Only */}
            {!isLogin && (
              <>
                <div className="form-group">
                  <label>{t('auth.fullName', 'Full Name')}</label>
                  <div className="input-icon-wrapper">
                    <User size={16} />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={t('auth.namePlaceholder', 'Jane Doe')}
                      className="auth-input"
                      minLength={2}
                      maxLength={100}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>{t('auth.officialEmail', 'Official Email')}</label>
                  <div className="input-icon-wrapper">
                    <Mail size={16} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('auth.emailPlaceholder', 'name@gov.in')}
                      className="auth-input"
                    />
                  </div>
                </div>

                {/* Role Dropdown */}
                <div className="form-group">
                  <label>{t('auth.role', 'Role')}</label>
                  <div className="input-icon-wrapper">
                    <Briefcase size={16} />
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="auth-input"
                      style={{ cursor: 'pointer' }}
                    >
                      <option value="officer">{t('auth.roleOfficer', 'Officer')}</option>
                      <option value="reviewer">{t('auth.roleReviewer', 'Reviewer')}</option>
                      <option value="translator">{t('auth.roleTranslator', 'Translator')}</option>
                    </select>
                  </div>
                </div>

                {/* Department */}
                <div className="form-group">
                  <label>{t('auth.department', 'Department')}</label>
                  <div className="input-icon-wrapper">
                    <Building size={16} />
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder={t('auth.departmentPlaceholder', 'e.g. School Education & Sports')}
                      className="auth-input"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Password (Required for both) */}
            <div className="form-group">
              <label>{t('auth.password', 'Password')}</label>
              <div className="input-icon-wrapper">
                <Lock size={16} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="auth-input"
                  minLength={8}
                />
              </div>
            </div>

            {siteKey && (
              <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                <Turnstile
                  ref={turnstileRef}
                  siteKey={siteKey}
                  onSuccess={(token) => {
                    setTurnstileToken(token);
                    setError('');
                  }}
                  onExpire={() => setTurnstileToken('')}
                  onError={() => setTurnstileToken('')}
                />
              </div>
            )}

            <button 
              id="login-form-submit" 
              type="submit" 
              disabled={loading} 
              className="btn-primary"
            >
              {loading ? t('auth.processing', 'Processing...') : (
                <>
                  {isLogin ? t('auth.signInBtn', 'Sign In') : t('auth.registerBtn', 'Register Account')}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
            
            {/* Quick Demo Access Button */}
            {isLogin && (
              <button 
                type="button" 
                onClick={handleDemoLogin} 
                className="btn-secondary"
                disabled={loading}
                style={{ 
                  width: '100%', 
                  marginTop: '0.75rem', 
                  backgroundColor: '#f1f5f9', 
                  color: '#334155', 
                  border: '1px solid #cbd5e1',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Login as Demo Admin
              </button>
            )}
          </form>

          <div className="auth-footer">
            {isLogin ? t('auth.noAccount', "Don't have an account?") : t('auth.hasAccount', 'Already registered?')}
            <button
              type="button"
              onClick={() => {
                resetTurnstile();
                setIsLogin(!isLogin);
                setError('');
              }}
              className="auth-link"
            >
              {isLogin ? t('auth.createOne', 'Create one now') : t('auth.signInBtn', 'Sign In')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}