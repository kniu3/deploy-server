import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  //set not required for password, because we will allow firebase google to login as well
  password: { type: String },
  isActive: { type: Boolean, default: false },
  role: {
    type: String,
    enum: ["regular_user", "manager", "admin"],
    default: "regular_user",
  },
  firebaseUid: { type: String },
  date: {
    type: Date,
    default: Date.now,
  },
  bookLists: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "BookList",
  }],
});

userSchema.methods.isRegularUser = function () {
  return this.role === "regular_user";
};

userSchema.methods.isManager = function () {
  return this.role === "manager";
};

userSchema.methods.isAdmin = function () {
  return this.role === "admin";
};

//when save user, run the password hashing
userSchema.pre("save", async function (next) {
  if (this.isModified("password") || this.isNew) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(this.password, salt);
    this.password = hash;
    return next();
  } else {
    return next();
  }
});

//compare password when logging in 
userSchema.methods.comparePassword = async function (password, cb) {
  bcrypt.compare(password, this.password, (err, isMatch) => {
    if (err) {
      return cb(err, isMatch);
    }
    cb(null, isMatch);
  });
};

const User = mongoose.model("User", userSchema);

export default User;
