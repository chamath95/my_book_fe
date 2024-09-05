import React, { useState } from 'react';
import { Button, Form, Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { post } from '../services/apiService'; // Adjust the path as necessary

// Validation schema using Yup
const SignupSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  username: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required'),
  password2: Yup.string()
    .oneOf([Yup.ref('password'), ''], 'Passwords must match')
    .required('Repeat password is required'),
});

const Signup: React.FC = () => {
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Formik setup
  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      username: '',
      password: '',
      password2: '',
    },
    validationSchema: SignupSchema,
    onSubmit: async (values) => {
      setLoading(true); // Show loading spinner

      try {
        // Transform the payload to match the API format
        const payload = {
          username: values.username,
          password: values.password,
          password2: values.password2,
          email: values.email,
          first_name: values.firstName,
          last_name: values.lastName,
        };

        const response = await post('/auth/register/', payload);
        console.log('Signup response:', response.data);
        
        // Show success message and reset form
        setSuccessMessage('Signup successful! Please login!.');
        formik.resetForm();
        setGlobalError(null);
      } catch (error: any) {
        if (error.response) {
          const errorData = error.response.data;
          
          // Map the API error response to Formik errors
          formik.setErrors({
            firstName: errorData.data.first_name ? errorData.data.first_name.join(', ') : '',
            lastName: errorData.data.last_name ? errorData.data.last_name.join(', ') : '',
            email: errorData.data.email ? errorData.data.email.join(', ') : '',
            username: errorData.data.username ? errorData.data.username.join(', ') : '',
            password: errorData.data.password ? errorData.data.password.join(', ') : '',
            password2: errorData.data.password2 ? errorData.data.password2.join(', ') : '',
          });

          setGlobalError(errorData.detail || 'Signup failed');
          setSuccessMessage(null);
        } else {
          setGlobalError('Network error. Please try again later.');
          setSuccessMessage(null);
        }
      } finally {
        setLoading(false); // Hide loading spinner
      }
    },
  });

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
              <h2 className="text-center mb-4">Sign Up</h2>
              <Form onSubmit={formik.handleSubmit}>
                <Form.Group controlId="formFirstName">
                  <Form.Control
                    type="text"
                    name="firstName"
                    placeholder="Enter first name"
                    value={formik.values.firstName}
                    onChange={formik.handleChange}
                    isInvalid={!!formik.errors.firstName && formik.touched.firstName}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formik.errors.firstName}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group controlId="formLastName" className="mt-3">
                  <Form.Control
                    type="text"
                    name="lastName"
                    placeholder="Enter last name"
                    value={formik.values.lastName}
                    onChange={formik.handleChange}
                    isInvalid={!!formik.errors.lastName && formik.touched.lastName}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formik.errors.lastName}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group controlId="formEmail" className="mt-3">
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Enter email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    isInvalid={!!formik.errors.email && formik.touched.email}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formik.errors.email}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group controlId="formUsername" className="mt-3">
                  <Form.Control
                    type="text"
                    name="username"
                    placeholder="Enter username"
                    value={formik.values.username}
                    onChange={formik.handleChange}
                    isInvalid={!!formik.errors.username && formik.touched.username}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formik.errors.username}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group controlId="formPassword" className="mt-3">
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    isInvalid={!!formik.errors.password && formik.touched.password}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formik.errors.password}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group controlId="formPassword2" className="mt-3">
                  <Form.Control
                    type="password"
                    name="password2"
                    placeholder="Repeat password"
                    value={formik.values.password2}
                    onChange={formik.handleChange}
                    isInvalid={!!formik.errors.password2 && formik.touched.password2}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formik.errors.password2}
                  </Form.Control.Feedback>
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 mt-4"
                  disabled={loading} // Disable button while loading
                >
                  {loading ? (
                    <span>
                      <Spinner animation="border" size="sm" /> Signing up...
                    </span>
                  ) : (
                    'Sign Up'
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
                  Already have an account? <a href="/login">Login</a>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Signup;
