import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN,REFRESH_TOKEN } from "../constants";

function Form({route,method})
{
    // Set all the default to empty, we need this to remember the variable between renders
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Set the name variable which is used as a label throughout the form
    const name = method === "login" ? "Login":"Register";

    // This part handles the logic behind form submission
    const handleSubmit = async (e) => {
        setLoading(true);                                               
        e.preventDefault();                                             // This lines prevents refreshes and other default behavior

        try{
            const res = await api.post(route,{username,password});      // Sends to backend API

            // If it reaches this point, res is successful, so login works, sets the access tokens 
            if(method==="login"){
                localStorage.setItem(ACCESS_TOKEN,res.data.access);
                localStorage.setItem(REFRESH_TOKEN,res.data.refresh);
                navigate("/");
            }
            else
            {
                navigate("/login")
            }

        }catch(error){
            alert(error)
        } finally {
            setLoading(false);
        }
    }

    // Add everything together into a form
    return <form onSubmit={handleSubmit}>
        <h1>{name}</h1>
        <input type = "text" value={username} onChange={(e)=>setUsername(e.target.value)} placeholder="username"/>
        <input type = "text" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="password"/>
        <button type="submit"> {name} </button>
    </form>
}

export default Form