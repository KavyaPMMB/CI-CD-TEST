import mongoose from "mongoose";

const todoSchema = new mongoose.Schema(
  {
    user: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 500 },
    completed: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

todoSchema.index({ user: 1, order: 1 });

export default mongoose.model("Todo", todoSchema);
