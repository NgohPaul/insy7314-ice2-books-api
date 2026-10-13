/**
 * routes/bookRoutes.js
 * Maps the /api/books endpoints to their controller functions.
 * The routes only decide WHICH function handles a request; the logic
 * lives in controllers/bookController.js and the input checks in
 * middleware/validateBookInput.js.
 */

const express = require('express');

const {
  getAllBooks,
  getBookById,
  createBook,
} = require('../controllers/bookController');
const validateBookInput = require('../middleware/validateBookInput');

const router = express.Router();

// GET /api/books - return every book in the in-memory store
router.get('/', getAllBooks);

// GET /api/books/:id - return one book by its id (for example b1)
router.get('/:id', getBookById);

// POST /api/books - validate the request body first, then add the book
router.post('/', validateBookInput, createBook);

module.exports = router;
