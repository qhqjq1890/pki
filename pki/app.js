import express from "express";
import crypto from "crypto";
import dotenv from "dotenv";
import mongoose from "mongoose";
import UserRouter from "./routes/users.js";
import bodyParser from "body-parser";
import fs from "fs";
import cors from "cors";

const app = express();
const port = 3000;
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

dotenv.config();
mongoose.connect(process.env.MONGO_URI);
mongoose.connection.on("connected", () => {
  console.log("Successfully connected to MongoDB");
});

const publicKeyPath = "publicKey.pem";
const privateKeyPath = "privateKey.pem";
if (!fs.existsSync(publicKeyPath) || !fs.existsSync(privateKeyPath)) {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });
  fs.writeFileSync("publicKey.pem", publicKey);
  console.log("공개 키가 publicKey.pem에 저장되었습니다.");

  // 파일에 개인 키 저장
  fs.writeFileSync("privateKey.pem", privateKey);
  console.log("개인 키가 privateKey.pem에 저장되었습니다.");
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/user", UserRouter);

app.listen(port, () => {
  console.log(`서버가 실행됩니다. http://localhost:${port}`);
});
