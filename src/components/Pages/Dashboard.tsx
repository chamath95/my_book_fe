import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { authenticatedRequest } from '../../services/apiService';
import { useNavigate } from 'react-router-dom';
import { FaBook, FaUser } from 'react-icons/fa';

const Dashboard: React.FC = () => {
  const [totalBooksCount, setTotalBooksCount] = useState<number | null>(0);
  const [userBooksCount, setUserBooksCount] = useState<number | null>(0);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const totalResponse = await authenticatedRequest('GET', '/lib/books/total-count/');
        if (totalResponse.status == 200) {
          setTotalBooksCount(totalResponse.data?.total_books_count);
        }

        const userResponse = await authenticatedRequest('GET', '/lib/books/user-count/');
        if (userResponse.status == 200) {
          setUserBooksCount(userResponse.data?.user_books_count);
        }
      } catch (error) {
        console.error('Error fetching book counts:', error);
      }
    };

    fetchCounts();
  }, []);

  const handleNavigateToBook = (url: string) => {
    navigate(url);
  };


  return (
    <Container fluid className="p-0">
      <Row noGutters>
        <Col xs={12} className="p-4">
          <div className="jumbotron">
            <h1 className="display-4">Welcome to My Book, Your Personal Books Management System!</h1>
            <p className="lead">Easily manage and organize your personal library. Our platform helps you keep track of all your books, add new ones, and review your collection.</p>
            <hr className="my-4" />
            <p>Use the features below to view your library, add new books, and manage your collection effortlessly.</p>
            <p className="lead">
              <a className="btn btn-primary btn-lg"  onClick={() => handleNavigateToBook('/main/myBooks')} role="button">Explore Features</a>
            </p>
          </div>

        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <Card className="mb-4 shadow-sm">
            <Card.Body style={{ textAlign: 'center' }}>
              
              <div style={{ textAlign: 'center' }}>
                <FaBook size={40} className="text-primary mr-3" />
                <Card.Title>Total Books</Card.Title>
                <Card.Text>
                  {totalBooksCount !== null ? totalBooksCount : 'Loading...'}
                </Card.Text>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="mb-4 shadow-sm">
            <Card.Body style={{ textAlign: 'center' }}>
             
              <div style={{ textAlign: 'center' }}>
              <FaUser size={40} className="text-success mr-3" />
                <Card.Title>My Books</Card.Title>
                <Card.Text>
                  {userBooksCount !== null ? userBooksCount : 'Loading...'}
                </Card.Text>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;


export interface TotalBooksCountResponse {
  total_books_count: number;
}

export interface UserBooksCountResponse {
  user_books_count: number;
}
