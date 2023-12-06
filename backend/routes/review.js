import express from "express";
import validation from "../validation.js";
import Review from "../models/review-model.js";
import BookList from "../models/booklist-model.js";

const reviewValidation = validation.reviewValidation;

const router = express.Router();

router.use((req, res, next) => {
  console.log("A request is coming to review: ", Date.now());
  next();
});

router.get("/testAPI", (req, res) => {
  res.send("testAPI is working");
});

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Operations related to reviews
 */

/**
 * @swagger
 * /api/reviews/new:
 *   post:
 *     tags: [Reviews]
 *     summary: Post a new review
 *     description: Post a new review
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewReview'
 *     responses:
 *       200:
 *         description: Review added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
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
router.post("/new", async (req, res) => {
  const { error } = reviewValidation(req.body);
  if (error) return res.status(400).json(error.details[0].message);

  try {
    // Create a new Review
    const newReview = new Review({
      review: req.body.review,
      user: req.body.user,
      booklist: req.body.booklist,
    });

    // Save the Review
    const savedReview = await newReview.save();

    // Update the corresponding booklist's reviews field
    const booklist = await BookList.findOne({ _id: req.body.booklist });
    if (!booklist) {
      return res.status(404).json("Booklist not found");
    }

    booklist.reviews.push(savedReview._id);
    await booklist.save();

    res.json(savedReview);
  } catch (err) {
    res.status(400).json("Error: " + err.message);
  }
});

/**
 * @swagger
 * /api/update/{id}:
 *   post:
 *     tags: [Reviews]
 *     summary: Update a review
 *     description: Update a review
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateReview'
 *     responses:
 *       200:
 *         description: Review updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
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
router.put("/update", async (req, res) => {
  console.log("Coming into update review");

  try{
    const reviewId = req.body.reviewId;
    const review = await Review.findOne({ _id: reviewId });
    if (!review) {
      return res.status(404).json("Review not found");
    }
    review.visibility = "hidden";
    await review.save();
    res.status(200).json(review);
  } catch (err) {
    res.status(400).json("Error: " + err.message);
  }
});

export default router;
