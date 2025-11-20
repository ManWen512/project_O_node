import mongoose from "mongoose";

const AiContentSchema = new mongoose.Schema({
  prompt: { type: String, required: true },
  output: { type: String, required: true },
  type: { type: String, enum: ["chat", "post"], default: "chat" }, // chat or social post
  embedding: { 
    type: [Number], 
    required: true,
    validate: {
      validator: function(v) {
        return v.length === 384; // Match your embedding dimensions
      },
      message: 'Embedding must have exactly 384 dimensions'
    }
  },
   user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("AiContent", AiContentSchema);
