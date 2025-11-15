import "./Login.css";
import quinnipacLogo from './assets/Logo.svg'

function Login() {

    return (
        <div className="login">
            <div className="top">
                <img className="logo" src={quinnipacLogo}/>
                <p className="login-text">Login</p>
            </div>
            <div className="bottom">
                <input className="input-field" type="text" placeholder="Username" />
                <input className="input-field" type="password" placeholder="Password" />
                <button className="login-button">Login</button>
            </div>
        </div>
    );
}

export default Login;