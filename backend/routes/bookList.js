import express from "express";
import validation from "../validation.js";
import BookList from "../models/booklist-model.js";
import User from "../models/user-model.js";

const bookListValidation = validation.bookListValidation;

const router = express.Router();

router.use((req, res, next) => {
    console.log("A request is coming to bookList: ", Date.now());
    next();
});

/**
 * @swagger
 * tags:
 *   name: BookLists
 *   description: Operations related to BookLists
 */

/**
 * @swagger
 * /api/booklists/all:
 *   get:
 *     tags: [BookLists]
 *     summary: Get all public booklists ordered by last_edited
 *     description: Get all public booklists
 *     responses:
 *       200:
 *         description: Successfully retrieved all public booklists
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BookList'
 *       404:
 *         description: No public booklists found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get("/all", async (req, res) => {
    BookList.find({ visibility: "public" })
        .sort({ last_edited: -1 })
        .populate("user", ["_id", "email", "name"])
        .populate("books", ["_id", "title","subTitle", "authors", "description", "categories", "publisher", "publishedDate", "pageCount", "language", "salePrice", "imgSrc", "selfLink"])
        .populate("reviews", ["_id", "title", "author"])
        .then((bookLists) => {
            res.json(bookLists);
        })
        .catch((err) => {
            res.status(404).json("Error: " + err);
        });
});

/**
 * @swagger
 * /api/booklists/new:
 *   post:
 *     tags: [BookLists]
 *     summary: Post a new booklist belongs to a user
 *     description: Post a new booklist
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewBookList'
 *     responses:
 *       200:
 *         description: Booklist added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookList'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

router.post("/new", async (req, res) => {
    const { error } = bookListValidation(req.body);
    if (error) return res.status(400).json(error.details[0].message);

    try {
        // Create a new BookList
        const newBookList = new BookList({
            name: req.body.name,
            description: req.body.description,
            visibility: req.body.visibility,
            user: req.body.user,
        });

        // Save the BookList
        const savedBookList = await newBookList.save();

        // Update the corresponding user's bookLists field
        const user = await User.findOne({ _id: req.body.user });
        if (!user) {
            return res.status(404).json("User not found");
        }

        user.bookLists.push(savedBookList._id);
        await user.save();

        res.json(savedBookList);
    } catch (err) {
        res.status(400).json("Error: " + err.message);
    }
});
/**
 * @swagger
 * /api/booklists/{userId}:
 *   get:
 *     tags: [BookLists]
 *     summary: Get all booklists belongs to a user
 *     description: Get all booklists for a user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID of the user to retrieve booklists for
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved booklists
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BookList'
 *       404:
 *         description: No booklists found for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

router.get("/:userId", async (req, res) => {
    //find <:userId>'s all bookLists
    BookList.find({ user: req.params.userId })
        .sort({ last_edited: -1 })
        .populate("user", ["_id", "email", "name"])
        .populate("books", ["_id", "title","subTitle", "authors", "description", "categories", "publisher", "publishedDate", "pageCount", "language", "salePrice", "imgSrc", "selfLink"])
        .populate("reviews", ["_id", "title", "author"])
        .then((bookLists) => {
            res.json(bookLists);
        })
        .catch((err) => {
            res.status(404).json("Error: " + err);
        });
});



/**
 * @swagger
 * /api/booklists/{bookListId}:
 *   delete:
 *     tags: [BookLists]
 *     summary: Delete a booklist
 *     description: Delete a booklist
 *     parameters:
 *       - in: path
 *         name: bookListId
 *         required: true
 *         description: ID of the booklist to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booklist deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookList'
 *       404:
 *         description: Booklist or User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

router.delete("/:bookListId", async (req, res) => {
    try {
        // Find the bookList
        const bookList = await BookList.findOne({ _id: req.params.bookListId });
        if (!bookList) {
            return res.status(404).json("Book list not found");
        }

        // Delete the bookList
        await bookList.deleteOne();

        // Update the corresponding user's bookLists field
        const user = await User.findOne({ _id: bookList.user });
        if (!user) {
            return res.status(404).json("User not found");
        }

        user.bookLists = user.bookLists.filter(
            (bookListId) => bookListId.toString() !== req.params.bookListId
        );
        await user.save();

        res.json(bookList);
    } catch (err) {
        res.status(400).json("Error: " + err.message);
    }
});

/**
 * @swagger
 * /api/booklists/{bookListId}:
 *   patch:
 *     tags: [BookLists]
 *     summary: Partially update a booklist
 *     description: Partially update a booklist
 *     parameters:
 *       - in: path
 *         name: bookListId
 *         required: true
 *         description: ID of the booklist to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               visibility:
 *                 type: string
 *     responses:
 *       200:
 *         description: Booklist updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookList'
 *       400:
 *         description: Booklist not found or validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
 *         description: Booklist not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

router.patch("/:bookListId", async (req, res) => {
    try {
        // Find the bookList
        const bookList = await BookList.findOne({ _id: req.params.bookListId });
        if (!bookList) {
            return res.status(404).json("Book list not found");
        }

        // Update the bookList
        if (req.body.name) {
            bookList.name = req.body.name;
        }
        if (req.body.description) {
            bookList.description = req.body.description;
        }
        if (req.body.visibility) {
            bookList.visibility = req.body.visibility;
        }
        bookList.last_edited = Date.now();

        // Save the bookList
        const savedBookList = await bookList.save();

        res.json(savedBookList);
    } catch (err) {
        res.status(400).json("Error: " + err.message);
    }
});

export default router;
