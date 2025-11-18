import { useState } from "react";
import "./Login.css";
import quinnipacLogo from './assets/Logo.svg'

function Login() {
    const [errorMessage, setErrorMessage] = useState("");
    const handleLogin = (): void => {
        setErrorMessage("Invalid username or password.");
    }

    return (
        <div className="login">
            <div className="top">
                <img className="logo" src={quinnipacLogo}/>
                <p className="login-text">Login</p>
            </div>
            <div className="bottom">
                <input className="input-field" type="text" placeholder="Username" />
                <input className="input-field" type="password" placeholder="Password" />
                <button className="login-button" onClick={handleLogin}>Login</button>
                <p className="error-text">{errorMessage}</p>
            </div>
        </div>
    );
}

export default Login;