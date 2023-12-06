import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    booklist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BookList"
    },
    review: {
        type: String,
        required: true
    },
    visibility: {
        type: String,
        enum: ["public", "hidden"],
        default: "public"
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const Review = mongoose.model("Review", reviewSchema);
export default Review;