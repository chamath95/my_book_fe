import React, { useState } from 'react';
import { Button, Form, Container, Card, Row, Col, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/images/logo.png';
import { post } from '../services/apiService'; 
import { setAuthToken } from '../services/authService'; 

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const username = (event.currentTarget.username as HTMLInputElement).value;
    const password = (event.currentTarget.password as HTMLInputElement).value;

    setLoading(true); // Show loading spinner

    try {
      const response = await post('/auth/login/', { username, password });
      console.log('Login response:', response.data);

      // Save the access token
      const { access } = response.data;
      setAuthToken(access);

      // Show success message and navigate to main page
      setSuccessMessage('Login successful!');
      setGlobalError(null);
      setTimeout(() => navigate('/main'), 2000); // Redirect after a brief delay
    } catch (error: any) {
      if (error.response) {
        const errorData = error.response.data;
        setGlobalError(errorData.data.detail || 'Login failed');
        setSuccessMessage(null);
      } else {
        setGlobalError('Network error. Please try again later.');
        setSuccessMessage(null);
      }
    } finally {
      setLoading(false); // Hide loading spinner
    }
  };

  return (
    <Container
      fluid
      className="d-flex vh-100"
      style={{
        background: 'linear-gradient(to right, #8ab0ff, #c0d6ff)',
      }}
    >
      <Row className="justify-content-center align-self-center w-100">
        <Col xs={12} sm={8} md={6} lg={4} className="mx-auto">
          <Card className="p-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: 'none' }}>
            <Card.Body>
              <div className="text-center mb-4">
                <img
                  src={Logo}
                  alt="Logo"
                  style={{ height: '100px' }}
                />
              </div>
              <h2 className="text-center mb-4">Login</h2>
              <Form onSubmit={handleLogin}>
                <Form.Group controlId="formBasicUsername">
                  <Form.Control
                    type="text"
                    name="username"
                    placeholder="Username"
                    required
                  />
                </Form.Group>

                <Form.Group controlId="formBasicPassword" className="mt-3">
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Password"
                    required
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 mt-4"
                  disabled={loading} // Disable button while loading
                >
                  {loading ? (
                    <span>
                      <Spinner animation="border" size="sm" /> Loading...
                    </span>
                  ) : (
                    'Login'
                  )}
                </Button>
              </Form>
              {globalError && (
                <div className="text-center mt-3 text-danger">
                  {globalError}
                </div>
              )}
              {successMessage && (
                <div className="text-center mt-3 text-success">
                  {successMessage}
                </div>
              )}
              <div className="text-center mt-3">
                <p>
                  Don't have an account? <a href="/signup">Sign up</a>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
