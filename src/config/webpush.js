import "./env.js";
import webpush from "web-push";

const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY } = process.env;


if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  try {
    webpush.setVapidDetails(
      "mailto:lux@gmail.com",
      VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY
    );
  } catch (error) {
    console.error(
      "Invalid VAPID keys — push notifications are disabled:",
      error.message
    );
  }
} else {
  console.error(
    "VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY are not set — push notifications are disabled."
  );
}

export default webpush;