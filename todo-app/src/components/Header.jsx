import React from 'react';

function Header({ darkMode, setDarkMode }) {
  return (
    <header className="header">
      <div className="header-content">
        <h1>📝 قائمة مهامي</h1>
        <button
          className="theme-toggle"
          onClick={() => setDarkMode(!darkMode)}
          title={darkMode ? 'الوضع الفاتح' : 'الوضع الليلي'}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  );
}

export default Header;
