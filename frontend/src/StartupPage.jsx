import './StartupPage.css'
function StartupPage({ onGetStarted }) {
  return (
    <div className="startup-container">
      <div className="startup-content">
        <div className="logo">
          <div className="logo-icon">
            <svg viewBox="0 0 200 120" width="150" height="90">
              {/* Standing Person - Arms Away from Body */}
              <circle cx="50" cy="28" r="11" fill="white"/>
              {/* Blue Eyes */}
              <circle cx="46" cy="27" r="2" fill="#0EA5E9"/>
              <circle cx="54" cy="27" r="2" fill="#0EA5E9"/>
              <rect x="40" y="40" width="20" height="38" fill="white" rx="6"/>
              <rect x="26" y="45" width="12" height="30" fill="white" rx="5"/>
              <rect x="62" y="45" width="12" height="30" fill="white" rx="5"/>
              <rect x="42" y="78" width="8" height="32" fill="white" rx="4"/>
              <rect x="53" y="78" width="8" height="32" fill="white" rx="4"/>
              
              {/* Car */}
              <rect x="95" y="60" width="80" height="40" fill="white" rx="8"/>
              <rect x="105" y="45" width="50" height="22" fill="white" rx="5"/>
              <circle cx="115" cy="100" r="10" fill="#0EA5E9"/>
              <circle cx="155" cy="100" r="10" fill="#0EA5E9"/>
              <rect x="120" y="70" width="14" height="14" fill="#0EA5E9"/>
              <rect x="145" y="70" width="14" height="14" fill="#0EA5E9"/>
            </svg>
          </div>
          <h1>CommuteBuddy</h1>
        </div>
        
        <p className="tagline">Smarter, stress-free commutes at your fingertips</p>
        
        <button className="get-started-btn" onClick={onGetStarted}>
          Get Started
        </button>
      </div>
    </div>
  );
}
export default StartupPage;
