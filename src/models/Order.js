import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "products",
      required: true,
    },
    name: String,
    color: String,
    size: String,
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    image: String,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [orderItemSchema],

    shippingAddress: {
      fullName: String,
      phone: String,
      city: String,
      address: String,
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "wallet"],
      default: "cash",
    },

    walletPayment: {
      senderName: String,
      senderPhone: String,
      transactionId: String,
      transferImage: String,
      verified: {
        type: Boolean,
        default: false,
      },
    },

    totalPrice: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);