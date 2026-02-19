/**
 * Login.tsx
 * Login page used to verify username and password as well as
 * obtain user permissions (Admin, Student)
 */

import { type SyntheticEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Container, Card, Image } from 'react-bootstrap';
import Logo from '../assets/Logo.svg';
import { authenticateUser } from '../service/user_service'
import axios from 'axios';
import { API_BASE_URL } from '../types';

function Login({ setToken }: { setToken: (token: string) => void }) {
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    console.log("start")
    console.log(axios.defaults.headers.common)
    axios.get(`${API_BASE_URL}/authorized`).then(
      function() {
        console.log("sure")
        navigate("/home")
      }, function() {
        console.log("failed")
      }
    )
  }, []);

  async function handleLogin(event: SyntheticEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form: HTMLFormElement = event.currentTarget;
    const token = await authenticateUser(form.username.value, form.password.value);
    if (token) {
      setToken(token);
      navigate('/home');
    } else {
      setErrorMessage('Invalid username or password.');
    }
  }

  return (
    <Container
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: '70vh' }}
    >
      <Card
        className="p-4 shadow-lg text-center mt-5 border-2"
        style={{ maxWidth: '420px', width: '100%' }}
      >
        <Image src={Logo} alt="Logo" height={72} className="mb-3 mx-auto" />
        <Form onSubmit={handleLogin} className="w-100">
          <h4 className="mb-3" style={{ color: 'var(--brand-deep)' }}>
            Login
          </h4>
          <Form.Group className="mb-3">
            <Form.Control name="username" type="text" placeholder="Username" />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Control name="password" type="password" placeholder="Password" />
          </Form.Group>
          <Button variant="primary" type="submit" className="w-100">
            Login
          </Button>

          {errorMessage && <p className="text-danger text-center mt-3">{errorMessage}</p>}
        </Form>
      </Card>
    </Container>
  );
}

export default Login;
