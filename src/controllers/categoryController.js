import Category from "../models/Category.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";
import redis from "../config/redis.js";

const CATEGORIES_CACHE_KEY = "categories:all";
const CATEGORY_CACHE_PREFIX = "category:";

export const addCategory = async (req, res) => {
    try {
        const { name } = req.body;
        console.log(name);

        const streamUpload = () =>
            new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: "Category",
                    },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result);
                    }
                );

                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });

        const result = await streamUpload();

        const category = await Category.create({
            name,
            image: result.secure_url,
            imageId: result.public_id,
        });

        await redis.del(CATEGORIES_CACHE_KEY);

        return res.status(201).json({
            success: true,
            message: "Category added successfully.",
            category,
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to add category.",
            error: error.message,
        });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.body;
        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found.",
            });
        }

        if (category.imageId) {
            await cloudinary.uploader.destroy(category.imageId);
        }

        await Category.findByIdAndDelete(id);

        await redis.del(CATEGORIES_CACHE_KEY);
        await redis.del(`${CATEGORY_CACHE_PREFIX}${id}`);

        return res.status(200).json({
            success: true,
            message: "Category deleted successfully.",
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete category.",
            error: error.message,
        });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;

        let updatedData = { ...req.body };

        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found.",
            });
        }

        const streamUpload = () =>
            new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: "Category",
                    },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result);
                    }
                );

                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });

        if (req.file) {
            if (category.imageId) {
                await cloudinary.uploader.destroy(category.imageId);
            }

            const result = await streamUpload();

            updatedData.image = result.secure_url;
            updatedData.imageId = result.public_id;
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            updatedData,
            {
                returnDocument: "after",
            }
        );

        await redis.del(CATEGORIES_CACHE_KEY);
        await redis.del(`${CATEGORY_CACHE_PREFIX}${id}`);

        return res.status(200).json({
            success: true,
            message: "Category updated successfully.",
            category: updatedCategory,
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to update category.",
            error: error.message,
        });
    }
};

export const getCategories = async (req, res) => {
    try {
        const cached = await redis.get(CATEGORIES_CACHE_KEY);

        if (cached) {
            return res.status(200).json({
                success: true,
                categories: JSON.parse(cached),
            });
        }

        const categories = await Category.find();

        await redis.set(CATEGORIES_CACHE_KEY, JSON.stringify(categories), "EX", 600);

        return res.status(200).json({
            success: true,
            categories,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to get categories.",
            error: error.message,
        });
    }
};

export const getCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const cacheKey = `${CATEGORY_CACHE_PREFIX}${id}`;
        const cached = await redis.get(cacheKey);

        if (cached) {
            return res.status(200).json({
                success: true,
                category: JSON.parse(cached),
            });
        }

        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found.",
            });
        }

        await redis.set(cacheKey, JSON.stringify(category), "EX", 600);

        return res.status(200).json({
            success: true,
            category,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to get category.",
            error: error.message,
        });
    }
};