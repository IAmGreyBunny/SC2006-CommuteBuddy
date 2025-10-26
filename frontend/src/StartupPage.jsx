import { useNavigate } from 'react-router-dom';
import './StartupPage.css';
const logoPath = '/icon.png'; 

function StartupPage() {
  const navigate = useNavigate();

  return (
    <div className="startup-container">
      <div className="startup-content">
        <div className="logo">
          <div className="logo-icon">
            <img src={logoPath} alt="CommuteBuddy logo" className="app-logo" />
          </div>
          <h1>CommuteBuddy</h1>
        </div>
        <p className="tagline">Smarter, stress-free commutes at your fingertips</p>
        <button
          className="get-started-btn"
          onClick={() => navigate('/login')}
        >
          Get Started
        </button>
      </div>
    </div>
  );
}

export default StartupPage;
