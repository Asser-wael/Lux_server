import Notification from "../models/Notification.js";
import User from "../models/User.js";
import UserNotification from "../models/UserNotification.js";
import { getIO } from "../sockets/index.js";

export const createNotification = async ({
    title,
    message,
    type = "info",
}) => {
    try {
        const notification = await Notification.create({
            title,
            message,
            type,
        });

        const io = getIO();

        io.to("adminroom").emit(
            "newNotification",
            notification
        );

        return notification;
    } catch (error) {
        console.error(
            "Failed to create notification:",
            error.message
        );

        throw error;
    }
};


export const createNotificationUser = async ({
    user: userId,
    title,
    message,
    type = "info",
}) => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new Error("User not found");
        }

        const notification = await UserNotification.create({
            title,
            message,
            type,
        });

        user.notifications.push(notification._id);

        await user.save();

        return notification;
    } catch (error) {
        console.error(
            "Failed to create user notification:",
            error.message
        );

        throw error;
    }
};