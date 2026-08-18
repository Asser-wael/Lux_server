import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.js";
import redis from "../config/redis.js";
import Trust from "../models/Turst.js";

const CACHE_KEY = "trust:all";
const CACHE_TTL = 60 * 60; // ساعة واحدة

const uploadToCloudinary = (buffer, folder = "trust") =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });

// GET /api/trust
export const getTrust = async (req, res) => {
  try {
    const cached = await redis.get(CACHE_KEY);
    if (cached) {
      return res.status(200).json({
        success: true,
        trustItems: JSON.parse(cached),
        fromCache: true,
      });
    }

    const trustItems = await Trust.find().sort({ createdAt: -1 });

    await redis.set(CACHE_KEY, JSON.stringify(trustItems), "EX", CACHE_TTL);

    return res.status(200).json({
      success: true,
      trustItems,
      fromCache: false,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch trust items.",
      error: error.message,
    });
  }
};

// POST /api/trust
export const addTrust = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || !req.file) {
      return res.status(400).json({
        success: false,
        message: "Title and image are required.",
      });
    }

    const result = await uploadToCloudinary(req.file.buffer);

    const trust = await Trust.create({
      title,
      image: result.secure_url,
      imageId: result.public_id,
    });

    await redis.del(CACHE_KEY);

    return res.status(201).json({
      success: true,
      message: "Trust item added successfully.",
      trust,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to add trust item.",
      error: error.message,
    });
  }
};

// PUT /api/trust/:id
export const updateTrust = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    const trust = await Trust.findById(id);
    if (!trust) {
      return res.status(404).json({
        success: false,
        message: "Trust item not found.",
      });
    }

    if (req.file) {
      if (trust.imageId) {
        await cloudinary.uploader.destroy(trust.imageId);
      }
      const result = await uploadToCloudinary(req.file.buffer);
      trust.image = result.secure_url;
      trust.imageId = result.public_id;
    }

    if (title) trust.title = title;

    await trust.save();
    await redis.del(CACHE_KEY);

    return res.status(200).json({
      success: true,
      message: "Trust item updated successfully.",
      trust,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update trust item.",
      error: error.message,
    });
  }
};

// DELETE /api/trust/:id
export const deleteTrust = async (req, res) => {
  try {
    const { id } = req.params;

    const trust = await Trust.findById(id);
    if (!trust) {
      return res.status(404).json({
        success: false,
        message: "Trust item not found.",
      });
    }

    if (trust.imageId) {
      await cloudinary.uploader.destroy(trust.imageId);
    }

    await trust.deleteOne();
    await redis.del(CACHE_KEY);

    return res.status(200).json({
      success: true,
      message: "Trust item deleted successfully.",
      id,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete trust item.",
      error: error.message,
    });
  }
};