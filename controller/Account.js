import Account from "../models/Account.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const CreateAcc = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const existingAccount = await Account.findOne({ email });
    if (existingAccount) {
      return res.status(400).json({ message: "Email already in use" });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const newAccount = new Account({
      email,
      password: hashedPassword
    });
    
    const savedAccount = await newAccount.save();
    
    res.status(201).json({
      message: "Account created successfully",
      account: { id: savedAccount._id, email: savedAccount.email }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const GetAcc = async (req, res) => {
  try {
    const accounts = await Account.find().select("-password");
    res.status(200).json(accounts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const UdpateAcc = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const updateData = {};
    if (email) updateData.email = email;
    
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }
    
    const updatedAccount = await Account.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    ).select("-password");
    
    if (!updatedAccount) {
      return res.status(404).json({ message: "Account not found" });
    }
    
    res.status(200).json({
      message: "Account updated successfully",
      account: updatedAccount
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const DeleteAcc = async (req, res) => {
  try {
    const deletedAccount = await Account.findByIdAndDelete(req.params.id);
    
    if (!deletedAccount) {
      return res.status(404).json({ message: "Account not found" });
    }
    
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const LoginAcc = async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const account = await Account.findOne({ email });
      if (!account) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
      
      const isPasswordValid = await bcrypt.compare(password, account.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
      
      const token = jwt.sign(
        { id: account._id, email: account.email },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );
      
      res.status(200).json({
        message: "Login successful",
        token,
        account: { id: account._id, email: account.email }
      });
    } catch (error) {
      console.error("Login error:", error); 
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };