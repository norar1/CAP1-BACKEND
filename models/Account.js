import mongoose from "mongoose";

const AccountSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  }
});

const Accounnt = mongoose.model("Account", AccountSchema)

export default Accounnt;