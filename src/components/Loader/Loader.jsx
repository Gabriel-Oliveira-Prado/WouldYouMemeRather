import './Loader.css';

export default function Loader() {
  return (
    <div className="loader-container" id="loader">
      <div className="loader-ring">
        <div className="loader-ring-inner"></div>
        <span className="loader-emoji">🤔</span>
      </div>
      <p className="loader-text">Loading memes...</p>
    </div>
  );
}
