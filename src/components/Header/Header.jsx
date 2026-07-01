import './Header.css';

export default function Header({ onToggleExpand, isExpanded, isDarkMode, onToggleTheme }) {
  return (
    <header className="header" id="app-header">
      <div className="header-inner">
        <h1 className="header-logo">
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); window.location.reload(); }} 
            className="header-logo-link"
          >
            <span className="header-logo-icon">🤔</span>
            <span className="header-logo-text">
              Would You <span className="accent">Meme</span> Rather
            </span>
          </a>
        </h1>
        
        <div className="header-actions">
          <button 
            className="theme-toggle-button" 
            onClick={onToggleTheme}
            aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          
          <button className="expand-button" onClick={onToggleExpand}>
            {isExpanded ? 'Collapse Images' : 'Expand Images'}
          </button>
        </div>
      </div>
    </header>
  );
}
