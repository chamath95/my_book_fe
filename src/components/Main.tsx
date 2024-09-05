import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import Dashboard from './Pages/Dashboard';
import MyBooks from './Pages/MyBooks';
import ViewBook from './Pages/ViewBook';
import BooksGallery from './Pages/BooksGallery';
import Logo from '../assets/images/logo.png';

const Main: React.FC = () => {
  const handleLogout = () => {
    // Implement your logout logic here
    console.log('Logout clicked');
    // Example: Clear authentication tokens, redirect to login page
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  };

  return (
    <div>
      <Navbar bg="primary" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="dashboard">
            <img
              src={Logo}
              alt="Library Logo"
              style={{ height: '40px', cursor: 'pointer' }}
            />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="gallery">Books Gallery</Nav.Link>
              <Nav.Link as={Link} to="myBooks">My Books</Nav.Link>
            </Nav>
            <Nav>
              <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="mt-3">
        <Routes>
          <Route path="/" element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="myBooks" element={<MyBooks />} />
          <Route path="view-book/:id" element={<ViewBook />} />
          <Route path="gallery" element={<BooksGallery />} />
        </Routes>
      </Container>

      <br/><br/>
    </div>
  );
};

export default Main;
