import mongoose from "mongoose";
import { Schema } from "mongoose";

const userSchema = new Schema({
  userName: { type: String, unique: true, required: true },
  publicKey: String,
});

export default userSchema;
