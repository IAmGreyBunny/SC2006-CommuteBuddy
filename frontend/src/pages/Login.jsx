// import Form from "../components/Form";

// function Login(){
//     return <Form route="api/token/" method="login"/>
// }

// export default Login

function Login({ onSwitchToSignUp, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempted with:', email, password);

    onLoginSuccess();
    navigate('/home');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Welcome Back</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>
          <button type="submit">Login</button>
          <a href="#" className="forgot-password">Forgot Password?</a>
          <p style={{ textAlign: 'center', marginTop: '1rem' }}>
            Don't have an account?{' '}
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); onSwitchToSignUp(); }}
              style={{ color: '#0095FF', fontWeight: 'bold' }}
            >
              Sign Up
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
