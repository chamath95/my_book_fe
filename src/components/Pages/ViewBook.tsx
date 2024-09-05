import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Card, Spinner, Alert, Form, Button, Col, Row, ListGroup, Breadcrumb } from 'react-bootstrap';
import { authenticatedRequest } from '../../services/apiService'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons'; 
import StarRatings from 'react-star-ratings';
import { useNavigate } from 'react-router-dom';

const placeholderImage = 'https://upload.wikimedia.org/wikipedia/commons/d/dc/No_Preview_image_2.png';

// Define the Book and Comment types
interface Book {
    id: number;
    title: string;
    author: string;
    publication_date: string;
    isbn: string;
    cover_image?: string;
}

interface Comment {
    id: number;
    book: number;
    content: string;
    created_at: string;
    user: string;
}

const ViewBook: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [book, setBook] = useState<Book | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [rating, setRating] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [newComment, setNewComment] = useState<string>('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBookAndComments = async () => {
            if (id) {
                setLoading(true);
                try {
                    // Fetch book details
                    const bookResponse = await authenticatedRequest('GET', `/lib/books/${id}/`);
                    setBook(bookResponse.data);

                    // Fetch comments
                    const commentsResponse = await authenticatedRequest('GET', `/reviews/comments/${id}/`);
                    setComments(commentsResponse.data.results);

                    // Fetch average rating
                    const ratingResponse = await authenticatedRequest('GET', `/reviews/average-rating/${id}/`);
                    setRating(ratingResponse.data.average_rating || 0); // Ensure you are accessing the correct property
                } catch (error: any) {
                    setError('Failed to load book details or comments. Please try again later.');
                } finally {
                    setLoading(false);
                }
            } else {
                setError('Book ID is missing.');
                setLoading(false);
            }
        };

        fetchBookAndComments();
    }, [id]);

    const handleAddComment = async () => {
        if (id) {
            try {
                await authenticatedRequest('POST', '/reviews/comments/', {
                    book: parseInt(id),
                    content: newComment,
                });
                setNewComment('');
                // Refresh comments
                const commentsResponse = await authenticatedRequest('GET', `/reviews/comments/${id}/`);
                setComments(commentsResponse.data.results);
            } catch (error: any) {
                setError('Failed to add comment. Please try again later.');
            }
        } else {
            setError('Book ID is missing.');
        }
    };

    const handleRatingChange = async (nextValue: number) => {
        if (id) {
            try {
                await authenticatedRequest('POST', '/reviews/ratings/', {
                    book: parseInt(id),
                    rating: nextValue,
                });
                setRating(nextValue);
            } catch (error: any) {
                setError('Failed to add rating. Please try again later.');
            }
        } else {
            setError('Book ID is missing.');
        }
    };

    const handleNavigateToBook = (url: string) => {
        navigate(url);
      };

    if (loading) {
        return <div className="text-center mt-5"><Spinner animation="border" /></div>;
    }

    return (
        <Container className="mt-4">
            <Breadcrumb>
                <Breadcrumb.Item  onClick={() => handleNavigateToBook('/main/dashboard')}>Home</Breadcrumb.Item>
                <Breadcrumb.Item  onClick={() => handleNavigateToBook('/main/myBooks')}>Books</Breadcrumb.Item>
                <Breadcrumb.Item active>{book?.title}</Breadcrumb.Item>
            </Breadcrumb>
            {error && <Alert variant="danger">{error}</Alert>}
            <Row>
                <Col md={6}>
                    <Card style={{ border: 'unset' }}>
                        <Card.Header as="h5" style={{ textAlign: "left", fontSize: "xxx-large" }}>{book?.title}</Card.Header>
                        <Card.Body>
                            <Card.Img
                                variant="top"
                                src={book?.cover_image || placeholderImage}
                                style={{ objectFit: 'cover' }}
                            />
                            <Card.Text className="mt-3">
                                <strong>Author:</strong> {book?.author}<br />
                                <strong>Publication Date:</strong> {book?.publication_date}<br />
                                <strong>ISBN:</strong> {book?.isbn}
                            </Card.Text>
                            <div className="mt-3">
                                <strong>Rating: </strong>
                                <StarRatings
                                    rating={rating}
                                    starRatedColor="gold"
                                    numberOfStars={5}
                                    name='rating'
                                    starDimension="24px"
                                    starSpacing="5px"
                                    changeRating={handleRatingChange} // Handle rating change
                                />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card style={{ border: 'unset' }}>
                        <Card.Header as="h5" style={{ border: 'unset' }}>Comments</Card.Header>
                        <Card.Body>
                            <Form>
                                <Form.Group className="mb-3" controlId="formComment">
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        style={{ borderRadius: '20px', borderColor: '#ccc' }} // Rounded corners and light border
                                    />
                                </Form.Group>
                                <Button
                                    variant="primary"
                                    onClick={handleAddComment}
                                    style={{ borderRadius: '20px' }} // Rounded button corners
                                >
                                    Add Comment
                                </Button>
                            </Form>
                            <div className="mt-3">
                                {comments.length === 0 ? (
                                    <div>No comments yet.</div>
                                ) : (
                                    <ListGroup>
                                        {comments.map(comment => (
                                            <ListGroup.Item
                                                key={comment.id}
                                                style={{ borderRadius: '15px', marginBottom: '10px', display: 'flex', alignItems: 'center' }} // Flex display for profile icon and comment text
                                            >
                                                <FontAwesomeIcon
                                                    icon={faUserCircle} // Font Awesome user icon
                                                    style={{ fontSize: '40px', color: '#007bff', marginRight: '10px' }} // Profile icon style
                                                />
                                                <div style={{ textAlign: 'left' }}>
                                                    <div style={{ fontWeight: 'bold' }}>{comment.user}</div>
                                                    <div style={{ fontSize: '0.9em', color: '#555' }}>
                                                        {new Date(comment.created_at).toLocaleString()}
                                                    </div>
                                                    <div style={{ marginTop: '5px' }}>{comment.content}</div>
                                                </div>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ViewBook;
