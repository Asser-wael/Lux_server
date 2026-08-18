import mongoose from "mongoose";

const trustSchema = new mongoose.Schema(
  {
    image: { type: String, required: true },
    imageId: { type: String }, 
    title: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Trust", trustSchema);