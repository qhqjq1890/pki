import "./App.css";
import { useState, useEffect } from "react";
import sha256 from "crypto-js/sha256";
import JSEncrypt from "jsencrypt";
import { socket } from "./socket";

function App() {
  const [userPublicKey, setUserPublicKey] = useState("");
  const [serverPublicKey, setServerPublicKey] = useState("");
  const [serverSignature, setServerSignature] = useState("");
  const [isConnected, setIsConnected] = useState(socket.connected);
  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    socket.on("connect", onConnect);

    return () => {
      socket.off("connect", onConnect);
    };
  });

  const onClick = async () => {
    fetch("http://localhost:3000/user/publicKey", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userName: "qhqjq1890",
      }),
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        console.log(data);
        setUserPublicKey(data.userPublicKey);
        setServerPublicKey(data.serverPublicKey);
        setServerSignature(data.serverSign);
      });
  };

  const verify = () => {
    var verify = new JSEncrypt();
    verify.setPublicKey(serverPublicKey);
    var verified = verify.verify(userPublicKey, serverSignature, sha256);
    console.log(verified);
  };
  return (
    <>
      <button onClick={onClick}>gg</button>
      <button onClick={verify}>verify</button>
    </>
  );
}

export default App;
