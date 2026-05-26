import React from 'react';
import { BookOpen, LogOut, UserRound } from 'lucide-react';
import { AuthService } from '../services/AuthService';
import { ConfigurationService } from '../services/ConfigurationService';

export default function NavigationMenu({ user, page, setPage, onLogout }) {
  const logout = () => {
    AuthService.logout();
    onLogout();
  };

  return (
    <header className="nav">
      <button className="brand" onClick={() => setPage(user ? `${user.role}-dashboard` : 'home')}>
        <BookOpen size={26} />
        <span>{ConfigurationService.appName}</span>
      </button>

      <nav className="nav-links" aria-label="Main navigation">
        {!user && (
          <>
            <button className={page === 'home' ? 'active' : ''} onClick={() => setPage('home')}>Home</button>
            <button className={page === 'login' ? 'active' : ''} onClick={() => setPage('login')}>Login</button>
            <button className={page === 'register' ? 'active' : ''} onClick={() => setPage('register')}>Register</button>
          </>
        )}

        {user?.role === 'teacher' && (
          <>
            <button className={page === 'teacher-dashboard' ? 'active' : ''} onClick={() => setPage('teacher-dashboard')}>Teacher Dashboard</button>
            <button className={page === 'create-exam' ? 'active' : ''} onClick={() => setPage('create-exam')}>Create Exam</button>
            <button className={page === 'teacher-exams' ? 'active' : ''} onClick={() => setPage('teacher-exams')}>My Exams</button>
            <button className={page === 'teacher-submissions' ? 'active' : ''} onClick={() => setPage('teacher-submissions')}>Submissions</button>
          </>
        )}

        {user?.role === 'student' && (
          <>
            <button className={page === 'student-dashboard' ? 'active' : ''} onClick={() => setPage('student-dashboard')}>Student Dashboard</button>
            <button className={page === 'student-results' ? 'active' : ''} onClick={() => setPage('student-results')}>Results</button>
          </>
        )}
      </nav>

      {user && (
        <div className="user-box">
          <UserRound size={18} />
          <span>{user.fullName}</span>
          <button className="logout" onClick={logout}><LogOut size={16} /> Logout</button>
        </div>
      )}
    </header>
  );
}
