import {type SyntheticEvent, useState} from "react";
import "./Login.css";
import quinnipacLogo from './assets/Logo.svg'
import { useNavigate } from "react-router-dom";
import {Button, Form} from "react-bootstrap";

function Login({setIsLoggedIn}: { setIsLoggedIn: () => void }) {
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    function handleLogin(event: SyntheticEvent<HTMLFormElement>): void {
        event.preventDefault()
        const form: HTMLFormElement = event.currentTarget;
        if (validUsernameAndPassword(form.username.value, form.password.value)) {
            setIsLoggedIn();
            navigate('/home');
        }
        else {
            setErrorMessage("Invalid username or password.");
        }

    }

    // Placeholder, will be revamped when implementing the backend
    function validUsernameAndPassword(username: string, password: string): boolean {
        for (let user of users) {
            if (user.username == username && user.password == password) {
                return true
            }
        }
        return false
    }

    const users: {username: string, password: string}[] = [{username: "user@qu.edu", password: "password"}]

    return (
        <div className="login">
            <div className="top">
                <img className="logo" src={quinnipacLogo}/>
                <p className="login-text">Login</p>
            </div>
            <Form className="bottom" onSubmit={handleLogin}>
                <Form.Control name="username" className="input-field" type="text" placeholder="Username" />
                <Form.Control name="password" className="input-field" type="password" placeholder="Password" />
                <Button type="submit" className="login-button">Login</Button>
                <p className="error-text">{errorMessage}</p>
            </Form>
        </div>
    );
}

export default Login;