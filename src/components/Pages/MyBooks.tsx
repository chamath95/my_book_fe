import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Spinner, Pagination } from 'react-bootstrap';
import { authenticatedRequest } from '../../services/apiService'; // Adjust the path as necessary
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

interface Book {
  id: number;
  title: string;
  author: string;
  publication_date: string;
  isbn: string;
  cover_image: string | null;
}

const placeholderImage = 'https://upload.wikimedia.org/wikipedia/commons/d/dc/No_Preview_image_2.png';

const MyBooks: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showAddBookModal, setShowAddBookModal] = useState<boolean>(false);
  const [showUpdateBookModal, setShowUpdateBookModal] = useState<boolean>(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // State for add/update errors
  const [addBookError, setAddBookError] = useState<string | null>(null);
  const [updateBookError, setUpdateBookError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const response = await authenticatedRequest('GET', `/lib/books/?page=${currentPage}`);
        setBooks(response.data.results);
        setTotalPages(Math.ceil(response.data.count / 10)); // Assuming 10 items per page
      } catch (error: any) {
        setError('Failed to load books. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [currentPage]);

  const handleDelete = async (id: number) => {
    try {
      await authenticatedRequest('DELETE', `/lib/books/${id}/`);
      setBooks(books.filter((book) => book.id !== id));
      setShowModal(false);
    } catch (error: any) {
      setError('Failed to delete the book. Please try again later.');
    }
  };

  const handleDeleteClick = (id: number) => {
    setSelectedBook(books.find(book => book.id === id) || null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedBook(null);
    setAddBookError(null);
    setUpdateBookError(null);
  };

  const handleAddBook = async (values: any) => {
    setIsSubmitting(true);
    setAddBookError(null);

    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('author', values.author);
    formData.append('publication_date', values.publication_date);
    formData.append('isbn', values.isbn);
    if (values.cover_image) {
      formData.append('cover_image', values.cover_image);
    }

    try {
      let response = await authenticatedRequest('POST', '/lib/books/', formData);
      setBooks((prevBooks) => [
        ...prevBooks,
        response.data as Book,
      ]);
      setShowAddBookModal(false);
      formikAddBook.resetForm();
    } catch (error: any) {
      setAddBookError('Failed to add the book. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateBook = async (values: any) => {
    if (!selectedBook) return;

    setIsSubmitting(true);
    setUpdateBookError(null);

    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('author', values.author);
    formData.append('publication_date', values.publication_date);
    formData.append('isbn', values.isbn);
    if (values.cover_image) {
      formData.append('cover_image', values.cover_image);
    }

    try {
      await authenticatedRequest('PUT', `/lib/books/${selectedBook.id}/`, formData);
      setBooks(books.map((book) => (book.id === selectedBook.id ? {
        ...book,
        ...values,
        cover_image: values.cover_image ? URL.createObjectURL(values.cover_image) : book.cover_image,
      } : book)));
      setShowUpdateBookModal(false);
      setSelectedBook(null);
      formikUpdateBook.resetForm();
    } catch (error: any) {
      setUpdateBookError('Failed to update the book. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formikAddBook = useFormik({
    initialValues: {
      title: '',
      author: '',
      publication_date: '',
      isbn: '',
      cover_image: null as File | null,
    },
    validationSchema: Yup.object().shape({
      title: Yup.string().required('Title is required'),
      author: Yup.string().required('Author is required'),
      publication_date: Yup.date().nullable(),
      isbn: Yup.string()
        .required('ISBN is required')
        .length(13, 'ISBN must be exactly 13 digits')
        .matches(/^\d+$/, 'ISBN must be a number'),
      cover_image: Yup.mixed().nullable(),
    }),
    onSubmit: handleAddBook,
  });

  const handleNavigateToBook = (bookId: number) => {
    navigate(`/main/view-book/${bookId}`);
  };

  const formikUpdateBook = useFormik({
    enableReinitialize: true,
    initialValues: selectedBook ? {
      title: selectedBook.title,
      author: selectedBook.author,
      publication_date: selectedBook.publication_date == null ? "" : selectedBook.publication_date,
      isbn: selectedBook.isbn,
      cover_image: null as File | null,
    } : {
      title: '',
      author: '',
      publication_date: '',
      isbn: '',
      cover_image: null as File | null,
    },
    validationSchema: Yup.object().shape({
      title: Yup.string().required('Title is required'),
      author: Yup.string().required('Author is required'),
      publication_date: Yup.date().nullable(),
      isbn: Yup.string()
        .required('ISBN is required')
        .length(13, 'ISBN must be exactly 13 digits')
        .matches(/^\d+$/, 'ISBN must be a number'),
      cover_image: Yup.mixed().nullable(),
    }),
    onSubmit: handleUpdateBook,
  });

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return (
    <Container fluid className="my-4">
      <Row>
        <Col style={{ textAlign: "right" }}>
          <Button
            variant="primary"
            className="mb-4"
            onClick={() => setShowAddBookModal(true)}
          >
            Add Book
          </Button>
        </Col>
      </Row>

      {error && <div className="text-center text-danger mb-4">{error}</div>}
      {books.length === 0 ? (
        <div className="text-center">No data available</div>
      ) : (
        <>

          <Row>
            {books.map((book) => (
              <Col key={book.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
                <Card style={{ borderRadius: '15px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                  <Card.Img
                    variant="top"
                    src={book.cover_image ? book.cover_image : placeholderImage}
                    style={{ objectFit: 'cover', height: '200px' }}
                  />
                  <Card.Body>
                    <Row>
                      <Col>
                        <Card.Title style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{book.title}</Card.Title>
                        <Card.Subtitle className="mb-2 text-muted" style={{ fontSize: '1.2rem' }}>{book.author}</Card.Subtitle>
                        <Card.Text style={{ fontSize: '1rem', color: '#555' }}>ISBN: {book.isbn}</Card.Text>
                      </Col>
                    </Row>
                    <br/>
                    <Row>
                      <Col>
                        <Button style={{ border: "unset" }}
                          variant="outline-primary"
                          className="d-flex align-items-center"
                          onClick={() => handleNavigateToBook(book.id)}
                        >&nbsp;&nbsp;<FontAwesomeIcon icon={faEye} className="me-2" /> </Button>
                      </Col>
                      <Col>
                      <Button style={{ border: "unset" }}
                        variant="outline-danger"
                        className="d-flex align-items-center"
                        onClick={() => handleDeleteClick(book.id)}
                      >
                        &nbsp;&nbsp;<FontAwesomeIcon icon={faTrash} className="me-2" />
                      </Button>
                      </Col>
                      <Col>
                      <Button style={{ border: "unset" }}
                        variant="outline-success"
                        className="d-flex align-items-center"
                        onClick={() => {
                          setSelectedBook(book);
                          setShowUpdateBookModal(true);
                        }}
                      >&nbsp;&nbsp;<FontAwesomeIcon icon={faEdit} className="me-2" /></Button>
                      </Col>
                    </Row>

                    <div className="d-flex gap-2">
                      
                      
                      
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Pagination Controls */}
          <div className="d-flex justify-content-center">
            <Pagination>
              <Pagination.Prev
                onClick={() => setCurrentPage(prevPage => Math.max(prevPage - 1, 1))}
                disabled={currentPage === 1}
              />
              {[...Array(totalPages)].map((_, index) => (
                <Pagination.Item
                  key={index + 1}
                  active={currentPage === index + 1}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next
                onClick={() => setCurrentPage(prevPage => Math.min(prevPage + 1, totalPages))}
                disabled={currentPage === totalPages}
              />
            </Pagination>
          </div>
        </>
      )}

      {/* Add Book Modal */}
      <Modal show={showAddBookModal} onHide={() => setShowAddBookModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Book</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={formikAddBook.handleSubmit}>
            <Form.Group controlId="title">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formikAddBook.values.title}
                onChange={formikAddBook.handleChange}
                isInvalid={!!formikAddBook.errors.title && formikAddBook.touched.title}
              />
              <Form.Control.Feedback type="invalid">{formikAddBook.errors.title}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="author" className="mt-3">
              <Form.Label>Author</Form.Label>
              <Form.Control
                type="text"
                name="author"
                value={formikAddBook.values.author}
                onChange={formikAddBook.handleChange}
                isInvalid={!!formikAddBook.errors.author && formikAddBook.touched.author}
              />
              <Form.Control.Feedback type="invalid">{formikAddBook.errors.author}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="publication_date" className="mt-3">
              <Form.Label>Publication Date</Form.Label>
              <Form.Control
                type="date"
                name="publication_date"
                value={formikAddBook.values.publication_date}
                onChange={formikAddBook.handleChange}
              />
            </Form.Group>
            <Form.Group controlId="isbn" className="mt-3">
              <Form.Label>ISBN</Form.Label>
              <Form.Control
                type="text"
                name="isbn"
                value={formikAddBook.values.isbn}
                onChange={formikAddBook.handleChange}
                isInvalid={!!formikAddBook.errors.isbn && formikAddBook.touched.isbn}
              />
              <Form.Control.Feedback type="invalid">{formikAddBook.errors.isbn}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="cover_image" className="mt-3">
              <Form.Label>Cover Image</Form.Label>
              <Form.Control
                type="file"
                name="cover_image"
                accept="image/*"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  if (event.target.files && event.target.files[0]) {
                    formikAddBook.setFieldValue('cover_image', event.target.files[0]);
                  }
                }}
              />
              {formikAddBook.values.cover_image && (
                <div className="mt-2">
                  <img
                    src={formikAddBook.values.cover_image instanceof File ? URL.createObjectURL(formikAddBook.values.cover_image) : formikAddBook.values.cover_image}
                    alt="Cover preview"
                    style={{ maxWidth: '100px', maxHeight: '100px' }}
                  />
                </div>
              )}
            </Form.Group>
            {addBookError && <div className="text-danger mt-2">{addBookError}</div>}
            <Button
              type="submit"
              variant="primary"
              className="mt-3"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Spinner animation="border" size="sm" /> : 'Add Book'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Update Book Modal */}
      <Modal show={showUpdateBookModal} onHide={() => setShowUpdateBookModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Book</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBook && (
            <Form onSubmit={formikUpdateBook.handleSubmit}>
              <Form.Group controlId="title">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={formikUpdateBook.values.title}
                  onChange={formikUpdateBook.handleChange}
                  isInvalid={!!formikUpdateBook.errors.title && formikUpdateBook.touched.title}
                />
                <Form.Control.Feedback type="invalid">{formikUpdateBook.errors.title}</Form.Control.Feedback>
              </Form.Group>
              <Form.Group controlId="author" className="mt-3">
                <Form.Label>Author</Form.Label>
                <Form.Control
                  type="text"
                  name="author"
                  value={formikUpdateBook.values.author}
                  onChange={formikUpdateBook.handleChange}
                  isInvalid={!!formikUpdateBook.errors.author && formikUpdateBook.touched.author}
                />
                <Form.Control.Feedback type="invalid">{formikUpdateBook.errors.author}</Form.Control.Feedback>
              </Form.Group>
              <Form.Group controlId="publication_date" className="mt-3">
                <Form.Label>Publication Date</Form.Label>
                <Form.Control
                  type="date"
                  name="publication_date"
                  value={formikUpdateBook.values.publication_date}
                  onChange={formikUpdateBook.handleChange}
                />
              </Form.Group>
              <Form.Group controlId="isbn" className="mt-3">
                <Form.Label>ISBN</Form.Label>
                <Form.Control
                  type="text"
                  name="isbn"
                  value={formikUpdateBook.values.isbn}
                  onChange={formikUpdateBook.handleChange}
                  isInvalid={!!formikUpdateBook.errors.isbn && formikUpdateBook.touched.isbn}
                />
                <Form.Control.Feedback type="invalid">{formikUpdateBook.errors.isbn}</Form.Control.Feedback>
              </Form.Group>
              <Form.Group controlId="cover_image" className="mt-3">
                <Form.Label>Cover Image</Form.Label>
                <Form.Control
                  type="file"
                  name="cover_image"
                  accept="image/*"
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    if (event.target.files && event.target.files[0]) {
                      formikUpdateBook.setFieldValue('cover_image', event.target.files[0]);
                    }
                  }}
                />
                {formikUpdateBook.values.cover_image ? (
                  <div className="mt-2">
                    <img
                      src={formikUpdateBook.values.cover_image instanceof File ? URL.createObjectURL(formikUpdateBook.values.cover_image) : formikUpdateBook.values.cover_image}
                      alt="Cover preview"
                      style={{ maxWidth: '100px', maxHeight: '100px' }}
                    />
                  </div>
                ) : selectedBook.cover_image && (
                  <div className="mt-2">
                    <img
                      src={selectedBook.cover_image || placeholderImage}
                      alt="Existing cover"
                      style={{ maxWidth: '100px', maxHeight: '100px' }}
                    />
                  </div>
                )}
              </Form.Group>
              {updateBookError && <div className="text-danger mt-2">{updateBookError}</div>}
              <Button
                type="submit"
                variant="primary"
                className="mt-3"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Spinner animation="border" size="sm" /> : 'Update Book'}
              </Button>
            </Form>
          )}
        </Modal.Body>
      </Modal>

      {/* Confirmation Modal for Delete */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the book titled "{selectedBook?.title}"?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => selectedBook?.id && handleDelete(selectedBook.id)}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MyBooks;
