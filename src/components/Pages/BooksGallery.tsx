import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Pagination } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from 'react-router-dom';
import { faEye } from '@fortawesome/free-solid-svg-icons';

import { authenticatedRequest } from '../../services/apiService';

const BooksGallery = () => {
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [books, setBooks] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalBooks, setTotalBooks] = useState(0);
    const [booksPerPage] = useState(10); // Define how many books per page you want
    const navigate = useNavigate();
    useEffect(() => {
        fetchBooks();
    }, [currentPage]);

    const fetchBooks = async () => {
        try {
            console.log('Fetching books with params:', {
                title: title.trim(),
                author: author.trim(),
                page: currentPage,
            });

            const response = await authenticatedRequest('GET', '/lib/books/search/', undefined, {
                title: title.trim(),
                author: author.trim(),
                page: currentPage,
            });

            console.log('API response:', response.data);

            // Ensure response data structure is handled correctly
            const fetchedBooks = response.data.results || [];
            const totalBooksCount = response.data.count || 0;

            setBooks(fetchedBooks);
            setTotalBooks(totalBooksCount);
        } catch (error) {
            console.error('Error fetching books:', error);
            setBooks([]); // Reset books on error
            setTotalBooks(0); // Reset totalBooks on error
        }
    };

    const handleNavigateToBook = (bookId: number) => {
        navigate(`/main/view-book/${bookId}`); // Navigate to the view-book page with the given ID
    };


    const handleFilter = () => {
        setCurrentPage(1);
        fetchBooks();
    };

    const totalPages = Math.ceil(totalBooks / booksPerPage);
    const placeholderImage = 'https://upload.wikimedia.org/wikipedia/commons/d/dc/No_Preview_image_2.png';

    return (
        <Container>
            <Row className="my-4">
                <Col md={4}>
                    <Form.Group controlId="title">
                        <Form.Control
                            type="text"
                            placeholder="Search by title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </Form.Group>
                </Col>
                <Col md={4}>
                    <Form.Group controlId="author">
                        <Form.Control
                            type="text"
                            placeholder="Search by author"
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                        />
                    </Form.Group>
                </Col>
                <Col md={4} className="d-flex align-items-end">
                    <Button variant="primary" onClick={handleFilter}>
                        Filter
                    </Button>
                </Col>
            </Row>

            <Row>
                {Array.isArray(books) && books.length > 0 ? (
                    books.map((book: any) => (
                        <Col key={book.id} md={3} className="mb-4">
                            <Card style={{ height: '400px' }}>
                                <Card.Img
                                    variant="top"
                                    src={book.cover_image || placeholderImage}
                                    style={{ height: '200px', objectFit: 'cover' }} // Adjust height of image if needed
                                />
                                <Card.Body>
                                    <Row>
                                        <Col>
                                            <Card.Title>{book.title}</Card.Title>
                                            <Card.Text>Author: {book.author}</Card.Text>
                                            <Card.Text>ISBN: {book.isbn}</Card.Text></Col>
                                    </Row>
                                    <br/>
                                    <Row style={{ textAlign: 'center' }}>
                                        <Col style={{ textAlign: 'center' }}>
                                            <Button style={{ border: "unset" }}
                                                variant="outline-primary"
                                                className=""
                                                onClick={() => handleNavigateToBook(book.id)}
                                            >&nbsp;&nbsp;<FontAwesomeIcon icon={faEye} className="me-2" /> </Button>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))
                ) : (
                    <Col>
                        <p>No books found</p>
                    </Col>
                )}
            </Row>

            <Row>
                <Col className="d-flex justify-content-center mt-4">
                    <Pagination>
                        <Pagination.First onClick={() => setCurrentPage(1)} />
                        <Pagination.Prev
                            onClick={() => setCurrentPage((prevPage) => Math.max(1, prevPage - 1))}
                        />
                        {[...Array(totalPages).keys()].map((page) => (
                            <Pagination.Item
                                key={page + 1}
                                active={page + 1 === currentPage}
                                onClick={() => setCurrentPage(page + 1)}
                            >
                                {page + 1}
                            </Pagination.Item>
                        ))}
                        <Pagination.Next
                            onClick={() => setCurrentPage((prevPage) => Math.min(totalPages, prevPage + 1))}
                        />
                        <Pagination.Last onClick={() => setCurrentPage(totalPages)} />
                    </Pagination>
                </Col>
            </Row>
        </Container>
    );
};

export default BooksGallery;
