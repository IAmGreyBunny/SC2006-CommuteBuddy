// // This component is meant to be a wrapper for pages that require authentication
// import {Navigate} from "react-router-dom";
// import {jwtDecode} from "jwt-decode";
// import api from "../api";
// import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";
// import { useState, useEffect } from "react"; 

// function ProtectedRoute({children})
// {
//     const [isAuthorized, setIsAuthorized] = useState(null);

//     // Checks if authorisation status
//     useEffect(() => {
//         auth().catch(()=>setIsAuthorized(false))
//     }, [])

//     // Function to refresh token
//     const refreshToken = async() => {
//         const refreshToken = localStorage.getItem(REFRESH_TOKEN);
//         try{
//             const res = await api.post("/api/token/refresh/",{
//                 refresh : refreshToken
//             });

//             // Refresh successful, set access token to new access token, set isAuthorized to True
//             if(res.status === 200)
//             {
//                 localStorage.setItem(ACCESS_TOKEN,res.data.access);
//                 setIsAuthorized(true);
//             }else{
//                 setIsAuthorized(false);
//             }
//         }catch(error){
//             console.log(error);
//             setIsAuthorized(false);
//         }
//     }

//     // This function checks if the user is logged in by checking if they have ACCESS_TOKEN
//     const auth = async() => {
//         const token = localStorage.getItem(ACCESS_TOKEN);
        
//         // No token provided, No authentication
//         if(!token)
//         {
//             setIsAuthorized(false);
//             return
//         }

//         // If token is expired, refresh token
//         // set isAuthorized to true if token refresh is successful
//         const decoded = jwtDecode(token);
//         const tokenExpiration = decoded.exp;
//         const now = Date.now()/1000;

//         if(tokenExpiration < now)
//         {
//             await refreshToken();
//         }
//         else
//         {
//             setIsAuthorized(true);
//         }
//     }

//     // isAuthorized not properly set yet
//     if(isAuthorized===null)
//     {
//         return <div>Loading...</div>
//     }

//     // if authorized return children component(i.e. page), otherwise redirect to login page
//     return isAuthorized ? children : <Navigate to="/login"/>;
// }

// export default ProtectedRoute


import {Navigate} from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import api from "../api";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";
import { useState, useEffect } from "react"; 

// --- TEMPORARY FIX: Bypasses token checking to allow core feature testing ---
function ProtectedRoute({children})
{
    // Check if the user bypassed the login screen for testing
    const isTestingBypassActive = !!localStorage.getItem('testing_bypass_active');

    if (isTestingBypassActive) {
         // In testing mode, immediately render the children
         return children;
    }

    // --- Original Logic for Production/Auth Check ---
    const [isAuthorized, setIsAuthorized] = useState(null);

    // Checks if authorisation status
    useEffect(() => {
        auth().catch(()=>setIsAuthorized(false))
    }, [])

    // Function to refresh token
    const refreshToken = async() => {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);
        try{
            const res = await api.post("/api/token/refresh/",{
                refresh : refreshToken
            });

            // Refresh successful, set access token to new access token, set isAuthorized to True
            if(res.status === 200)
            {
                localStorage.setItem(ACCESS_TOKEN,res.data.access);
                setIsAuthorized(true);
            }else{
                setIsAuthorized(false);
            }
        }catch(error){
            console.log(error);
            setIsAuthorized(false);
        }
    }

    // This function checks if the user is logged in by checking if they have ACCESS_TOKEN
    const auth = async() => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        
        // No token provided, No authentication
        if(!token)
        {
            setIsAuthorized(false);
            return
        }

        // If token is expired, refresh token
        // set isAuthorized to true if token refresh is successful
        const decoded = jwtDecode(token);
        const tokenExpiration = decoded.exp;
        const now = Date.now()/1000;

        if(tokenExpiration < now)
        {
            await refreshToken();
        }
        else
        {
            setIsAuthorized(true);
        }
    }

    // isAuthorized not properly set yet
    if(isAuthorized===null)
    {
        return <div>Loading...</div>
    }

    // if authorized return children component(i.e. page), otherwise redirect to login page
    // If not authorized AND not in testing bypass mode, navigate to login
    return isAuthorized ? children : <Navigate to="/login"/>;
}

export default ProtectedRoute