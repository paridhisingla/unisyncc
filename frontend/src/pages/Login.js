import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Users, GraduationCap, UserCheck } from 'lucide-react';
import { authAPI } from '../services/api';

const Login = ({ setUser }) => {
  const [selectedRole, setSelectedRole] = useState('Admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const roles = [
    { key: 'Admin', label: 'Admin', icon: UserCheck, description: 'System Administrator' },
    { key: 'Teacher', label: 'Teacher', icon: GraduationCap, description: 'Faculty Member' },
    { key: 'Student', label: 'Student', icon: Users, description: 'Student' }
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login({ email, password });
      const { token, user } = response.data;
      
      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set user in app state
      setUser(user);
      
      // Navigate to role-specific dashboard
      navigate(`/${user.role.toLowerCase()}`);
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setError('');
    // Auto-fill demo credentials
    if (role === 'Admin') {
      setEmail('admin@campus.edu');
      setPassword('admin123');
    } else if (role === 'Teacher') {
      setEmail('teacher@campus.edu');
      setPassword('teacher123');
    } else if (role === 'Student') {
      setEmail('student@campus.edu');
      setPassword('student123');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card glass">
        <div className="login-header">
          <h1>Campus Management System</h1>
          <p>Select your role and login to continue</p>
        </div>

        <div className="role-selector">
          {roles.map((role) => (
            <button
              key={role.key}
              className={`role-card ${selectedRole === role.key ? 'active' : ''}`}
              onClick={() => handleRoleSelect(role.key)}
            >
              <role.icon size={24} />
              <div className="role-info">
                <h3>{role.label}</h3>
                <p>{role.description}</p>
              </div>
            </button>
          ))}
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <div className="input-container">
              <User size={20} className="input-icon" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-container">
              <Lock size={20} className="input-icon" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Logging in...' : `Login as ${roles.find(r => r.key === selectedRole)?.label}`}
          </button>
        </form>

        <div className="demo-credentials">
          <h4>Demo Credentials:</h4>
          <div className="credentials-list">
            <p><strong>Admin:</strong> admin@campus.edu / admin123</p>
            <p><strong>Teacher:</strong> teacher@campus.edu / teacher123</p>
            <p><strong>Student:</strong> student@campus.edu / student123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
