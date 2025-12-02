/**
 * Login.tsx
 * Login page used to verify username and password as well as
 * obtain user permissions (Admin, Student)
 */

import { type SyntheticEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Container, Row, Col } from 'react-bootstrap';

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
      style={{ minHeight: '60vh' }}
    >
      <Row className="w-100">
        <Col md={{ span: 4, offset: 4 }}>
          <h4 className="mb-3">Login</h4>
          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-2">
              <Form.Control name="username" type="text" placeholder="Username" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control name="password" type="password" placeholder="Password" />
            </Form.Group>
            <Button type="submit" className="w-100">
              Login
            </Button>
            {errorMessage && <p className="text-danger mt-2">{errorMessage}</p>}
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;
