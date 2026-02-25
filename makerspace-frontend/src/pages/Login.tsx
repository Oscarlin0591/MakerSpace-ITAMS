/**
 * Login.tsx
 * Login page used to verify username and password as well as
 * obtain user permissions (Admin, Student)
 */

import { type SyntheticEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Container, Card, Image } from 'react-bootstrap';
import Logo from '../assets/Logo.svg';
import { authenticateUser } from '../service/user_service';
import { useUser } from '../contexts/user';

function Login({ setToken }: { setToken: (token: string, isAdmin: boolean) => void }) {
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated } = useUser();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  async function handleLogin(event: SyntheticEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setErrorMessage('');
    const form: HTMLFormElement = event.currentTarget;

    try {
      const result = await authenticateUser(form.username.value, form.password.value);
      if (result && result.token) {
        setToken(result.token, result.isAdmin);
        navigate('/home');
      }
    } catch (err) {
      if ((err as { response?: { status: number } }).response?.status === 401) {
        setErrorMessage('Invalid username or password.');
      }
      setErrorMessage('Login failed. Please try again');
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
            <Form.Control name="username" type="text" placeholder="Username" required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Control name="password" type="password" placeholder="Password" required />
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
