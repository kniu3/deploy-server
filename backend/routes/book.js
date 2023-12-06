import express from "express";
import validation from "../validation.js";

import Book from "../models/book-model.js";
import BookList from "../models/booklist-model.js";

const bookValidation = validation.bookValidation;

const router = express.Router();

router.use((req, res, next) => {
    console.log("A request is coming to book: ", Date.now());
    next();
});

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: Operations related to books
 */

/**
 * @swagger
 * /api/books/all:
 *   get:
 *     tags: [Books]
 *     summary: Get all books
 *     description: Get all books
 *     responses:
 *       200:
 *         description: Successfully retrieved all books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 *       404:
 *         description: No books found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get("/all", async (req, res) => {
    Book.find()
        .then((books) => {
            res.json(books);
        })
        .catch((err) => {
            res.status(404).json("Error: " + err);
        });
});

/**
 * @swagger
 * /api/books/post-book-to-list:
 *   post:
 *     tags: [Books]
 *     summary: Post a book to a booklist
 *     description: Post a book to a booklist
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookListId:
 *                 type: string
 *               bookBody:
 *                 $ref: '#/components/schemas/Book'
 *     responses:
 *       200:
 *         description: Book added to the list successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Book is already in the list or validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Book List not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.post("/post-book-to-list", async (req, res) => {
    console.log("trying to post a book to a booklist")
    try {
        const { bookListId, bookBody } = req.body;

        // Check if the book already exists
        let book = await Book.findOne({ selfLink: bookBody.selfLink });

        // If the book doesn't exist, create a new one
        if (!book) {
            console.log("book not found, creating a new one");
            const { error } = bookValidation(bookBody);
            if (error) return res.status(400).json(error.details[0].message);
            book = new Book(bookBody);
            await book.save();
        }

        // Check if the book list exists
        const bookList = await BookList.findById(bookListId);

        if (!bookList) {
            return res.status(404).json({ message: "Book List not found" });
        }

        // Check if the book is already in the book list
        if (bookList.books.includes(book._id)) {
            return res.status(400).json({ message: "Book is already in the list" });
        }

        // Add the book to the book list
        bookList.books.push(book._id);
        bookList.last_edited = Date.now();
        await bookList.save();

        res.status(200).json({ message: "Book added to the list successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});
/**
 * @swagger
 * /api/books/delete-book-from-list:
 *   delete:
 *     tags: [Books]
 *     summary: Delete a book from a booklist
 *     description: Delete a book from a booklist
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookListId:
 *                 type: string
 *               bookId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Book removed from the list successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Book is not in the list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Book or Book List not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.delete("/delete-book-from-list", async (req, res) => {
    try {
        const { bookListId, bookId } = req.body;

        // Check if the book already exists
        const book = await Book.findOne({ _id: bookId });

        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        // Check if the book list exists
        const bookList = await BookList.findById(bookListId);

        if (!bookList) {
            return res.status(404).json({ message: "Book List not found" });
        }

        // Check if the book is in the book list
        if (!bookList.books.includes(book._id)) {
            return res.status(400).json({ message: "Book is not in the list" });
        }

        // Remove the book from the book list
        bookList.books.pull(book._id);
        bookList.last_edited = Date.now();
        await bookList.save();

        res
            .status(200)
            .json({ message: "Book removed from the list successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
