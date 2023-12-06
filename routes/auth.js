
import express from "express";
import validation from "../validation.js";
import User from "../models/user-model.js";
import BookList from "../models/booklist-model.js";
import Book from "../models/book-model.js";
import Review from "../models/review-model.js";
import jwt from "jsonwebtoken";

const registerValidation = validation.registerValidation;
const localLoginValidation = validation.localLoginValidation;

const router = express.Router();

router.use((req, res, next) => {
  console.log("A request is coming on: ", Date.now());
  next();
});

router.get("/testAPI", (req, res) => {
  res.send("testAPI is working");
});

/**
 * @swagger
 * tags:
 *   - name: Public
 *     description: Operations related to books
 *   - name: Auth
 *     description: Operations related to authentication
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Auth
 *       - Public
 *     summary: Register a new user
 *     description: Register a new user
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                 savedUser:
 *                   type: object
 *       400:
 *         description: Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.post("/register", async (req, res) => {
  console.log("registering");
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //check if the email already exists
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) return res.status(400).send("Email already exists");

  //register the user
  const newUser = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    isActive: req.body.isActive,
  });

  try {
    const savedUser = await newUser.save();
    res.status(200).send({
      msg: "User registered successfully",
      savedUser,
    });
  } catch (err) {
    console.log(err);
    res.status(400).send("Error: User not saved");
  }
});

/**
 * @swagger
 * /api/auth/localLogin:
 *   post:
 *     tags:
 *       - Auth
 *       - Public
 *     summary: Login a user
 *     description: Login a user
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *       400:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.post("/localLogin", async (req, res) => {
  console.log("Login!!");
  //check the validation of data
  const { error } = localLoginValidation(req.body);
  if (error) return res.status(400).send("Invalid email or password");

  User.findOne({ email: req.body.email })
    .exec()
    .then((user) => {
      if (!user) {
        return res.status(401).send("User not found.");
      }

      user
        .comparePassword(req.body.password, (err, isMatch) => {
          if (err) return res.status(400).send(err);

          if (isMatch) {
            const tokenObject = { _id: user._id, email: user.email };
            const token = jwt.sign(tokenObject, process.env.PASSPORT_SECRET);
            res.send({ success: true, token: "JWT " + token, user: user });
          } else {
            console.log(err);
            res.status(401).send("Wrong password");
          }
        })
        .catch((err) => {
          console.log(err);
          res.status(400).send(err);
        });
    });
});

/**
 * @swagger
 * /api/auth/users/{id}:
 *   put:
 *     tags: [Auth]
 *     summary: Update a user password by id
 *     description: Update a user password by id
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   type: object
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

router.put("/users/:id", async (req, res) => {
  console.log("updating user: ", req.params.id);
  User.findById(req.params.id)
    .then((user) => {
      if (!user) {
        return res.status(404).send("User not found.");
      }

      user.password = req.body.password;

      user
        .save()
        .then((user) => {
          res.send({ success: true, user: user });
        })
        .catch((err) => {
          res.status(400).send(err);
        });
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

/**
 * @swagger
 * /api/auth/users/{email}:
 *   get:
 *     tags:
 *       - Auth
 *       - Public
 *     summary: Get a user by email
 *     description: Get a user by email
 *     responses:
 *       200:
 *         description: User found successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *       404:
 *         description: Users not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get("/users/:email", async (req, res) => {
  console.log("user: ", req.params.email);
  User.find({ email: req.params.email })
    .populate("bookLists", [
      "_id",
      "name",
      "description",
      "visibility",
      "last_edited",
    ])
    .then((users) => {
      if (!users) {
        return res.status(404).send("Users not found.");
      }

      res.send({ success: true, users: users });
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

/**
 * @swagger
 * /api/auth/booklist10:
 *   get:
 *     tags:
 *       - BookLists
 *       - Public
 *     summary: Get 10 public booklists ordered by last_edited
 *     description: Get 10 public booklists
 *     responses:
 *       200:
 *         description: Successfully retrieved 10 public booklists
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
router.get("/booklist10", async (req, res) => {
  BookList.find({ visibility: "public" })
    .sort({ last_edited: -1 })
    .populate("user", ["_id", "email", "name"])
    .populate("books", [
      "_id",
      "title",
      "subTitle",
      "authors",
      "description",
      "categories",
      "publisher",
      "publishedDate",
      "pageCount",
      "language",
      "salePrice",
      "imgSrc",
      "selfLink",
    ])
    .populate("reviews", ["_id", "title", "author"])
    .then((bookLists) => {
      //only return 10 booklists
      bookLists = bookLists.slice(0, 10);
      res.json(bookLists);
    })
    .catch((err) => {
      res.status(404).json("Error: " + err);
    });
});

/**
 * @swagger
 * /api/auth/public/books/{id}:
 *   get:
 *     tags: [Public, Books]
 *     summary: Get a book by ID
 *     description: Get a book by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the book to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the book
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get("/public/books/:id", async (req, res) => {
  Book.findById(req.params.id)
    .then((book) => {
      res.status(200).json(book);
    })
    .catch((err) => {
      res.status(404).json("Error: " + err);
    });
});

/**
 * @swagger
 * /api/auth/public/review/{booklistId}:
 *   get:
 *     tags: [Public, Reviews]
 *     summary: Get all reviews for a booklist
 *     description: Get all reviews for a booklist
 *     parameters:
 *       - in: path
 *         name: booklistId
 *         required: true
 *         description: ID of the booklist to retrieve reviews for
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved reviews for the booklist
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 *       404:
 *         description: Booklist not found or no reviews available
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get("/public/review/:booklistId", async (req, res) => {
  try {
    const booklist = await BookList.findOne({ _id: req.params.booklistId });
    if (!booklist) {
      return res.status(404).json("Booklist not found");
    }
    
    const reviews = await Review.find({
      booklist: req.params.booklistId,
      visibility: "public",
    })
      .populate("user", ["_id", "name", "email"])
      .sort({ date: -1 });


    res.status(200).json(reviews);
  } catch (err) {
    res.status(400).json("Error: " + err.message);
  }
});

/**
 * @swagger
 * /api/auth/public/bookList/{bookListId}:
 *   get:
 *     tags: [BookLists]
 *     summary: Get a booklist by ID
 *     description: Get a booklist by ID
 *     parameters:
 *       - in: path
 *         name: bookListId
 *         required: true
 *         description: ID of the booklist to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the booklist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookList'
 *       404:
 *         description: Booklist not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

router.get("/public/bookList/:bookListId", async (req, res) => {
  BookList.findOne({ _id: req.params.bookListId })
      .populate("user", ["_id", "email", "name"])
      .populate("books", ["_id", "title","subTitle", "authors", "description", "categories", "publisher", "publishedDate", "pageCount", "language", "salePrice", "imgSrc", "selfLink"])
      .populate("reviews", ["_id", "title", "author"])
      .then((bookList) => {
          res.json(bookList);
      })
      .catch((err) => {
          res.status(404).json("Error: " + err);
      });
});

export default router;
