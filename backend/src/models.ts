import { Schema, model, Types } from "mongoose";
export const User = model("User", new Schema({
  name: String, 
  email: { type: String, unique: true, required: true },
  passwordHash: String, 
  role: { type: String, 
    enum: ["user", "admin"],
     default: "user" },
},
 { timestamps: true }));

export const Template = model("Template", 
  new Schema({
  title: String, 
  occasionType: String, 
  thumbnailUrl: String,
  layoutConfig: Schema.Types.Mixed, 
  isActive: { type: Boolean, default: true },
}));
export const Poster = model("Poster", 
  new Schema({
  userId: { type: Types.ObjectId, 
    ref: "User", index: true },
  templateId: { type: Types.ObjectId, ref: "Template" },
  formData: Schema.Types.Mixed, uploadedPhotoUrls: [String], generatedImageUrl: String,
  status: { type: String, enum: ["draft", "generating", "completed", "failed"], default: "draft" },
  retries: { type: Number, default: 0 }, error: String,
}, { timestamps: true }));
export const GenerationLog = model("GenerationLog", new Schema({
  posterId: Types.ObjectId, geminiPromptUsed: String, latencyMs: Number, success: Boolean,
}, { timestamps: true }));
