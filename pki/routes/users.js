import { Router } from "express";
import { User } from "../models/index.js";
import crypto from "crypto";
import fs from "fs";

const UserRouter = Router();

UserRouter.get("/", async (req, res) => {
  const user = await User.find();
  res.json({ user });
});

UserRouter.post("/create_user", async (req, res) => {
  const { publicKey, privateKey } = await crypto.generateKeyPairSync("rsa", {
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

  //이미 존재하는 userName일 경우 serverMessage를 통해 id already exist!를 전송
  //그렇지 않을 경우 userName과 publicKey를 전송
  const user = await User.exists({ userName: req.body.userName });
  console.log(user);
  if (!user) {
    User.create({
      userName: req.body.userName,
      publicKey: publicKey,
    }).then(
      res.send({
        userName: req.body.userName,
        publicKey: publicKey,
        privateKey: privateKey,
      })
    );
  } else {
    res.send({
      serverMessage: "id already exist!",
    });
  }
});

UserRouter.post("/publicKey", async (req, res) => {
  const userExist = await User.exists({ userName: req.body.userName });

  console.log(req.body);
  if (userExist) {
    const ServerprivateKey = fs.readFileSync("privateKey.pem", "utf-8");
    const ServerpublicKey = fs.readFileSync("publicKey.pem", "utf-8");

    const user = await User.find({ userName: req.body.userName });
    const publicKey = user[0].publicKey;

    const sign = crypto.createSign("SHA256");
    sign.update(publicKey);
    const signature = sign.sign(ServerprivateKey, "base64");
    res.send({
      userName: req.body.userName,
      serverPublicKey: ServerpublicKey,
      serverSign: signature,
      userPublicKey: publicKey,
    });
  } else {
    res.send({
      serverMessage: "user doesn't exist!",
    });
  }
});

export default UserRouter;
