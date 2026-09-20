import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import UserModel from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import generateRefreshToken from "../utils/generateRefreshToken.js";

/* =========================================================
   REGISTER
========================================================= */

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
        type: "error",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password too short",
        type: "error",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const exist = await UserModel.findOne({
      email: normalizedEmail,
    });

    if (exist) {
      return res.status(409).json({
        message: "User exists!",
        type: "error",
      });
    }

    await UserModel.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      isVerified: true,
      role: "user",
    });

    return res.status(201).json({
      message: "Registered",
      type: "success",
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      message: "Server error",
      type: "error",
    });
  }
};

/* =========================================================
   LOGIN
========================================================= */

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
        type: "error",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // مهم جدًا:
    // password في User.js عنده select: false
    // لذلك لازم نعمل select("+password")
    const user = await UserModel
      .findOne({ email: normalizedEmail })
      .select("+password");

    if (!user) {
      return res.status(400).json({
        message: "User doesn't exist!",
        type: "error",
      });
    }

    // حماية إضافية لو password غير موجود في DB
    if (!user.password) {
      console.error(
        `LOGIN ERROR: User ${user._id} has no password`
      );

      return res.status(500).json({
        message: "User account has no valid password",
        type: "error",
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
        type: "error",
      });
    }

    // Access Token
    const accessToken = generateToken(user._id);

    // Refresh Token
    const refreshToken = generateRefreshToken(user._id);

    console.log("NODE_ENV:", process.env.NODE_ENV);

    // Refresh Token Cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // إزالة password قبل إرسال user للـ frontend
    const userSafe = user.toObject();
    delete userSafe.password;

    return res.json({
      accessToken,
      user: userSafe,
      message: "Welcome back!",
      type: "success",
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      message: "Server error",
      type: "error",
    });
  }
};

/* =========================================================
   GET USER
========================================================= */

export const getUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const user = await UserModel
      .findById(req.user.id)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.json(user);
  } catch (error) {
    console.error("GET USER ERROR:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

/* =========================================================
   REFRESH TOKEN
========================================================= */

export const refresh = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

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

    return res.json({
      accessToken,
    });
  } catch (error) {
    console.error("REFRESH ERROR:", error);

    return res.status(403).json({
      message: "Invalid or expired refresh token",
    });
  }
};
```

### و`User.js` عندك يفضل يبقى كده

```js
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "products",
      required: true,
    },

    color: String,

    size: String,

    quantity: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    notifications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserNotification",
      },
    ],

    cart: [cartItemSchema],

    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],

    isVerified: {
      type: Boolean,
      default: false,
    },

    otp: String,

    otpExpires: Date,

    avatar: String,
  },
  {
    timestamps: true,
  }
);

/* =========================================================
   HASH PASSWORD
========================================================= */

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(
    this.password,
    10
  );
});

/* =========================================================
   MATCH PASSWORD
========================================================= */

userSchema.methods.matchPassword = async function (
  enteredPassword
) {
  if (!enteredPassword || !this.password) {
    return false;
  }

  return bcrypt.compare(
    enteredPassword,
    this.password
  );
};

export default mongoose.model("User", userSchema);