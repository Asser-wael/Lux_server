import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import UserModel from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import generateRefreshToken from "../utils/generateRefreshToken.js";



export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (password.length < 6) {
      return res.status(400).json({ message: "Password too short", type: "error" });
    }

    const exist = await UserModel.findOne({ email })

    if (exist) {
      return res.json({ message: "User exists!", type: "error" })
    }

    await UserModel.create({
      name,
      email,
      password,
      isVerified: true, //////////////////////////////
      role: "user",
      // verifyOtp,
      // verifyOtpExpire: Date.now() + 10 * 60 * 1000
    });
    res.status(201).json({ message: "Registered", type: "success" });

  } catch (error) {

    console.log(error)

  }
}
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User doesn't exist!", type: "error" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials", type: "error" });
    }

    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    console.log(process.env.NODE_ENV);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true, 
      secure: true,  
      sameSite: "none", 
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });

    // #ماترجعش الباسورد الهاش مع اليوزر
    const userSafe = user.toObject();
    delete userSafe.password;

    res.json({
      accessToken,
      user: userSafe,
      message: "Welcome back!",
      type: "success",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", type: "error" });
  }
};
export const getUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await UserModel.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};
export const refresh = async (req, res) => {
  try {
    console.log("Refresh Cookie:", req.cookies.refreshToken);
    console.log("Headers:", req.headers);
    console.log("Cookies:", req.cookies);

    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({
        message: "No refresh token",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH
    );

    const user = await UserModel.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    const accessToken = generateToken(user._id);

    res.json({
      accessToken,
    });

  } catch (error) {
    console.log(error);

    res.status(403).json({
      message: error.message,
    });
  }
};
