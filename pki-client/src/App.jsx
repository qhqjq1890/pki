import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { createContext, useState } from "react";
import Chat from "./page/Chat";
import Login from "./page/Login";

export const AppContext = createContext();

function App() {
  const [userPrivateKey, setUserPrivateKey] = useState("");
  return (
    <AppContext.Provider value={{ userPrivateKey, setUserPrivateKey }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </BrowserRouter>
    </AppContext.Provider>
  );
}

export default App;
