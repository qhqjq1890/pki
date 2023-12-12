import React, { useState, useRef, useEffect, useContext } from "react";
import { AppContext } from "../App";
import { useLocation } from "react-router-dom";
import sha256 from "crypto-js/sha256";
import "./Chat.css";
import { socket } from "../socket";
import { JSEncrypt } from "jsencrypt";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [userList, setUserList] = useState([]);
  const scrollRef = useRef();
  const { state } = useLocation();
  const { userPrivateKey, setUserPrivateKey } = useContext(AppContext);

  //서버의 공개키, 유저의 공개키, 서버의 서명을 통해 사용자를 검증합니다.
  const verify = (
    userName,
    serverPublicKey,
    userPublicKey,
    serverSignature
  ) => {
    var verify = new JSEncrypt();
    verify.setPublicKey(serverPublicKey);
    var verified = verify.verify(userPublicKey, serverSignature, sha256);
    if (verified) {
      console.log(`${userName}님은 PKI서버로 부터 검증받은 사용자 입니다.`);
    }
  };

  //메시지를 서버로부터 받아옵니다. 이후 받아온 메시지를 비밀키를 통해 복호화 해줍니다.
  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    setMessages([...messages, { text: newMessage, sender: "user" }]);
    const encrypt = new JSEncrypt();
    const user = userList.filter((user) => user.userdata.userName != state);
    encrypt.setPublicKey(user[0].userdata.userPublicKey);
    var encrypted = encrypt.encrypt(newMessage);
    console.log(encrypted);

    socket.emit("sendMessage", { text: encrypted, sender: state });
    console.log(newMessage, state);
    setNewMessage("");
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  //다른 사용자가 소켓에 접속시 userList State(Array)를 변경해줍니다.
  //서버로 부터 받는 데이터는 다음과 같은 Json형식으로 되어있습니다.
  //res[socketid, userdata:{serverPublicKey, serverSign, userName, userPublicKey}]
  useEffect(() => {
    const other_user = userList.filter(
      (data) => data.userdata.userName != state
    );
    console.log(other_user);

    if (other_user.length > 0) {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: `${
            other_user[other_user.length - 1].userdata.userName
          }님이 접속 하셨습니다.\n공개키 : ${
            other_user[other_user.length - 1].userdata.userPublicKey
          }`,
          sender: "server",
        },
      ]);

      verify(
        other_user[0].userdata.userName,
        other_user[0].userdata.serverPublicKey,
        other_user[0].userdata.userPublicKey,
        other_user[0].userdata.serverSign
      );
    }
  }, [userList]);

  //Socket.io를 위한 통신 코드입니다.
  //userList에 저장된 값을 통해 receive_message를 서버로 부터 전달받을 경우
  //전달받은 상대방의 메시지를 복호화합니다.
  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    socket.on("connect", onConnect);
    function onDisconnect() {
      setIsConnected(false);
    }
    socket.emit("login", { userName: state });
    socket.on("userList", (res) => {
      setUserList(res);
    });
    socket.on("receive_message", (res) => {
      const decrypt = new JSEncrypt();
      decrypt.setPrivateKey(userPrivateKey);
      console.log(userPrivateKey);
      const uncrypted = decrypt.decrypt(res.text);
      console.log(uncrypted);
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: uncrypted, sender: "other" },
      ]);
    });

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("login");
    };
  }, [socket]);

  return (
    <div className="chat-container">
      <div>{state}</div>
      <div className="chat-messages" ref={scrollRef}>
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender}`}>
            {message.text}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          placeholder="메시지를 입력하세요"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button onClick={handleSendMessage}>전송</button>
      </div>
    </div>
  );
};

export default Chat;
