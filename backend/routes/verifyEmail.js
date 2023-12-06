import express from "express";
import nodemailer from "nodemailer";
import User from "../models/user-model.js";

const router = express.Router();

router.use((req, res, next) => {
  console.log("A request from send-email is coming on: ", Date.now());
  next();
});

router.get("/testAPI", (req, res) => {
  res.send("testAPI is working");
});


/**
 * @swagger
 * tags:
 *   name: Email
 *   description: Operations related to Email Verification
 */

/**
 * @swagger
 * /api/email/send:
 *   post:
 *     tags: [Email]
 *     summary: Send an email
 *     description: Send an email with the provided details.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmailRequest'
 *     responses:
 *       200:
 *         description: Email sent successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *       500:
 *         description: Error sending email
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 */
router.post("/send/", async (req, res) => {

  const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    auth: {
      user: "9065group3bookstore.noreply@gmail.com",
      pass: "oshbxvgblfcyiryn",
    },
  });
  const { to, subject, html } = req.body;

  const mailOptions = {
    from: "Onlin3Stor3<9065group3bookstore.noreply@gmail.com>",
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send("Verification email sent successfully.");
  } catch (error) {
    console.error("Error sending verification email:", error);
    res.status(500).send("Error sending verification email.".concat(error));
  }
});
/**
 * @swagger
 * /api/email/verify/{token}:
 *   get:
 *     tags: [Email]
 *     summary: Verify email with token
 *     description: Verify the email with the provided verification token.
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         description: Verification token received via email
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *       400:
 *         description: Invalid or expired verification token
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 */
router.get("/verify/:token", async (req, res) => {
  const userid = req.params.token;


  try {
    //change the user isActive to true
    await User.updateOne({ _id: userid }, { isActive: true });
    res.status(200).send("Email verified successfully. You can now log in.");
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(400).send("Invalid or expired verification token.");
  }
});

export default router;
