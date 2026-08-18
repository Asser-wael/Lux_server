import redis from "../config/redis.js";
import PopularModel from "../models/popular.js";

const POPULAR_CACHE_KEY = "popular:all";

export const getPopularProducts = async (req, res) => {
    try {
        const cached = await redis.get(POPULAR_CACHE_KEY);

        if (cached) {
            return res.status(200).json({
                success: true,
                products: JSON.parse(cached),
            });
        }

        const products = await PopularModel.find().populate("id");

        await redis.set(POPULAR_CACHE_KEY, JSON.stringify(products), "EX", 300);

        return res.status(200).json({
            success: true,
            products,
        });
        console.log(5);

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to get popular products.",
            error: error.message,
        });
    }
};

export const addPopularProduct = async (req, res) => {
    try {
        const { id } = req.body;
        console.log(1);


        const exists = await PopularModel.findOne({ id });
        console.log(2);

        if (exists) {
            return res.json({
                success: false,
                message: "Product already exists.",
            });
        }
        console.log(3);

        const popular = await PopularModel.create({ id });

        console.log(4);
        await redis.del(POPULAR_CACHE_KEY);
        console.log(5);

        return res.status(201).json({
            success: true,
            message: "Product added to popular successfully.",
            popular,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to add popular product.",
            error: error.message,
        });
    }
};

export const deletePopularProduct = async (req, res) => {
    try {
        const { id } = req.params;

        await PopularModel.deleteOne({ id });

        await redis.del(POPULAR_CACHE_KEY);

        return res.status(200).json({
            success: true,
            message: "Product removed from popular successfully.",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete popular product.",
            error: error.message,
        });
    }
};