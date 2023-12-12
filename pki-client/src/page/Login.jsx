import React, { useState, useContext } from "react";
import "./Login.css"; // 스타일 파일 추가
import { useNavigate } from "react-router-dom";
import { AppContext } from "../App";

const Login = () => {
  const [userName, setUsername] = useState("");
  const { userPrivateKey, setUserPrivateKey } = useContext(AppContext);

  function parsePrivateKey(privateKeyString) {
    const cleanedKey = privateKeyString.replace(/(\r\n|\n|\r)/gm, "");
    const startIndex =
      cleanedKey.indexOf("-----BEGIN PRIVATE KEY-----") +
      "-----BEGIN PRIVATE KEY-----".length;
    const endIndex = cleanedKey.indexOf("-----END PRIVATE KEY-----");
    const keyBody = cleanedKey.substring(startIndex, endIndex).trim();

    return keyBody;
  }

  const previewFile = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.readAsText(file);

    reader.onload = (e) => {
      const filecontent = e.target.result;
      const parsed = parsePrivateKey(filecontent);
      setUserPrivateKey(parsed);
    };
  };

  const navigate = useNavigate();
  const handleLogin = () => {
    navigate("/Chat", { state: userName });
  };

  const createKey = () => {
    fetch("http://localhost:3000/user/create_user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userName: userName,
      }),
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        let fileName = `${userName}.pem`;
        const file = new Blob([data.privateKey], { type: "text/plain" });
        const element = document.createElement("a");
        element.href = URL.createObjectURL(file);
        element.download = fileName;
        document.body.appendChild(element);
        element.click();
      });
  };

  return (
    <div className="login-container">
      <h1>로그인</h1>
      <label>
        사용자 이름:
        <input
          type="text"
          value={userName}
          onChange={(e) => setUsername(e.target.value)}
        />
      </label>
      <br />
      <button onClick={createKey}>키 발급하기</button>
      <button onClick={handleLogin}>로그인</button>
      <input type="file" onChange={previewFile} />
    </div>
  );
};

export default Login;
