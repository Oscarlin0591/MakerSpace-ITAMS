/**
 * Login.tsx
 * Login page used to verify username and password as well as
 * obtain user permissions (Admin, Student)
 */

import { type SyntheticEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Container, Card, Image } from 'react-bootstrap';
import Logo from '../assets/Logo.svg';

function Login({ setIsLoggedIn }: { setIsLoggedIn: () => void }) {
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  function handleLogin(event: SyntheticEvent<HTMLFormElement>): void {
    event.preventDefault();
    const form: HTMLFormElement = event.currentTarget;
    if (validUsernameAndPassword(form.username.value, form.password.value)) {
      setIsLoggedIn();
      navigate('/home');
    } else {
      setErrorMessage('Invalid username or password.');
    }
  }

  // Placeholder, will be revamped when implementing the backend
  function validUsernameAndPassword(username: string, password: string): boolean {
    for (const user of users) {
      if (user.username == username && user.password == password) {
        return true;
      }
    }
    return false;
  }

  const users: { username: string; password: string }[] = [
    { username: 'user', password: 'password' },
  ];

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
