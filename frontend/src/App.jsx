// import { useState } from 'react';
// import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
// import Register from './pages/Register';
// import Login from './pages/Login';
// import StartupPage from './pages/StartupPage';
// import Home from './pages/Home';
// import MyTrips from './pages/myTrips';
// import Settings from './pages/Settings';
// import NearbyCarparks from './pages/NearbyCarparks';
// import CrowdDensity from './pages/CrowdDensity';
// import LiveTracker from './pages/LiveTracker';
// import CarparkSourceForm from './pages/CarparkSourceForm';
// import ForgotPassword from './pages/ForgotPassword';
// import ProtectedRoute from './components/ProtectedRoute'
// import './App.css';

// localStorage.clear();
// sessionStorage.clear();

// //not found page
// const NotFound = () => (
//   <div style={{ textAlign: 'center', marginTop: '2rem' }}>
//     <h1>404 - Page Not Found</h1>
//     <p>The page you are looking for does not exist.</p>
//   </div>
// );

// function App() {
//   const [userData, setUserData] = useState({ fullName: 'James Lee' });

//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<StartupPage />} />
//         <Route
//           path="/login"
//           element={
//             <Login />
//           }
//         />
//         <Route
//           path="/register"
//           element={<Register />}
//         />
//         <Route
//           path="/ForgotPassword"
//           element={<ForgotPassword />}
//         />
//         <Route
//           path="/home"
//           element={
//             <ProtectedRoute>
//               <Home userName={userData.fullName} />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/my-trips"
//           element={
//             <ProtectedRoute>
//               <MyTrips />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/settings"
//           element={
//             <ProtectedRoute>
//               <Settings />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/NearbyCarparks"
//           element={
//             <NearbyCarparks />
//           }
//         />
//         <Route
//           path="/CarparkSourceForm"
//           element={
//             <ProtectedRoute>
//               <CarparkSourceForm />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/LiveTracker"
//           element={
//             <ProtectedRoute>
//               <LiveTracker />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/CrowdDensity"
//           element={
//             <ProtectedRoute>
//               <CrowdDensity />
//             </ProtectedRoute>
//           }
//         />

//         {/* Catch-all */}
//         <Route path="*" element={<NotFound />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App

import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import StartupPage from './pages/StartupPage';
import Home from './pages/Home';
import MyTrips from './pages/myTrips';
import Settings from './pages/Settings';
import NearbyCarparks from './pages/NearbyCarparks';
import CrowdDensity from './pages/CrowdDensity';
import LiveTracker from './pages/LiveTracker';
import CarparkSourceForm from './pages/CarparkSourceForm';
import ForgotPassword from './pages/ForgotPassword';
// NOTE: ProtectedRoute is still imported but not used for the temporarily unprotected routes
import ProtectedRoute from './components/ProtectedRoute' 
import './App.css';

localStorage.clear();
sessionStorage.clear();

//not found page
const NotFound = () => (
  <div style={{ textAlign: 'center', marginTop: '2rem' }}>
    <h1>404 - Page Not Found</h1>
    <p>The page you are looking for does not exist.</p>
  </div>
);

function App() {
  const [userData, setUserData] = useState({ fullName: 'James Lee' });

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StartupPage />} />
        <Route
          path="/login"
          element={
            <Login />
          }
        />
        <Route
          path="/register"
          element={<Register />}
        />
        <Route
          path="/ForgotPassword"
          element={<ForgotPassword />}
        />
        <Route
          path="/home"
          element={
            // REMOVED <ProtectedRoute>
            <Home userName={userData.fullName} />
            // END REMOVED
          }
        />
        <Route
          path="/my-trips"
          element={
            // REMOVED <ProtectedRoute>
            <MyTrips />
            // END REMOVED
          }
        />
        <Route
          path="/settings"
          element={
            // REMOVED <ProtectedRoute>
            <Settings />
            // END REMOVED
          }
        />
        <Route
          path="/NearbyCarparks"
          element={
            <NearbyCarparks />
          }
        />
        <Route
          path="/CarparkSourceForm"
          element={
            // REMOVED <ProtectedRoute>
            <CarparkSourceForm />
            // END REMOVED
          }
        />
        <Route
          path="/LiveTracker"
          element={
            // REMOVED <ProtectedRoute>
            <LiveTracker />
            // END REMOVED
          }
        />
        <Route
          path="/CrowdDensity"
          element={
            // REMOVED <ProtectedRoute>
            <CrowdDensity />
            // END REMOVED
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App

