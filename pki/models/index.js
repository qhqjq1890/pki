import mongoose from "mongoose";
import userSchema from "./schemas/user.js";

const User = mongoose.model("User", userSchema);

export { User };
