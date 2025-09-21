import react from "react";
import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import ProtectedRoutes from "./components/ProtectedRoute";

// Logs the User out by clearing all tokens
function Logout()
{
  localStorage.clear();
  return <Navigate to="/login" />
}

// Clear tokens after registration
function RegisterAndLogout(){
  localStorage.clear();
  return <Register />
}

// This part list out all the routes 
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path = "/"
          element = {
            <ProtectedRoutes>
              <Home/>
            </ProtectedRoutes>
          }
        />
        <Route path="/login" element={<Login/>}/>
        <Route path="/logout" element={<Logout/>}/>
        <Route path="/register" element={<RegisterAndLogout/>}/>
        <Route path="*" element={<NotFound/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
