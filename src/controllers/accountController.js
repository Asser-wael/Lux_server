import bcrypt from "bcrypt";
import UserModel from "../models/User.js";

export const getProfile = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found", type: "error" });
    }

    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", type: "error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email, avatar } = req.body;

    const user = await UserModel.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found", type: "error" });
    }

    if (email && email !== user.email) {
      const emailExists = await UserModel.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Email already in use", type: "error" });
      }
      user.email = email;
    }

    if (name) user.name = name;
    if (avatar) user.avatar = avatar;

    await user.save();

    const userSafe = user.toObject();
    delete userSafe.password;

    res.json({ user: userSafe, message: "Profile updated", type: "success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", type: "error" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "Password too short", type: "error" });
    }

    const user = await UserModel.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found", type: "error" });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect", type: "error" });
    }

    user.password = newPassword; // هيتعمله هاش تلقائي في الـ pre-save hook
    await user.save();

    res.json({ message: "Password changed successfully", type: "success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", type: "error" });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const user = await UserModel.findByIdAndDelete(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found", type: "error" });
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.json({ message: "Account deleted", type: "success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", type: "error" });
  }
};