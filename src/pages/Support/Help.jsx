// Help.jsx
import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

// const ENDPOINT = "http://localhost:5000"; // offline
const ENDPOINT = "https://twayba-backend-oln6.onrender.com"; // Online


const issueCategories = [
  "Delivery Issue",
  "Product Issue",
  "Return/Refund",
  "Payment/Billing",
  "Account/Order",
  "Report an Issue",
  "Other",
];

const getUserFromStorage = () => {
  try {
    return JSON.parse(localStorage.getItem("user")) || {};
  } catch {
    return {};
  }
};

let socket;

const Help = () => {
  const user = getUserFromStorage();
  const [connected, setConnected] = useState(false);
  const [waiting, setWaiting] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [name, setName] = useState(user.name || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [email, setEmail] = useState(user.email || "");
  const [category, setCategory] = useState(issueCategories[0]);
  const [subject, setSubject] = useState("");
  const [desc, setDesc] = useState("");
  const [started, setStarted] = useState(false);
  const [adminName, setAdminName] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket = io(ENDPOINT);

    socket.on("connect", () => setConnected(true));
    socket.on("waiting", () => setWaiting(true));
    socket.on("chat-started", (data) => {
      setWaiting(false);
      setAdminName(data?.adminName || "Support");
    });
    socket.on("message", (msg) => setMessages((prev) => [...prev, msg]));

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleStart = () => {
    if ((!name && !phone && !email) || !category || !subject) return;
    socket.emit("join-chat", {
      name,
      phone,
      email,
      category,
      subject,
      desc,
    });
    setStarted(true);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input) return;
    socket.emit("message", { text: input, from: name || phone || email || "User" });
    setMessages((prev) => [...prev, { from: "You", text: input }]);
    setInput("");
  };

  // If not started, show pre-chat form
  if (!started) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-left">
          <h2 className="text-2xl font-bold mb-2 text-[#1A1F31] text-center">
            Live Help Chat
          </h2>
          <p className="mb-6 text-gray-600 text-center">
            Before connecting, please tell us a bit about your issue so we can help you faster.
          </p>
          <form
            onSubmit={e => {
              e.preventDefault();
              handleStart();
            }}
            className="space-y-4"
          >
            {/* If name/phone/email is NOT set, show input, else show info */}
            {!user.name && !user.phone && !user.email ? (
              <div>
                <label className="block mb-1 text-[#1A1F31] font-medium">Your Name or Number</label>
                <input
                  className="border border-gray-300 px-3 py-2 w-full rounded"
                  placeholder="Enter your name or number"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
            ) : (
              <div>
                <span className="text-[#1A1F31] font-medium">You are:</span>
                <div className="mb-1 text-base text-gray-900">
                  {user.name && <span>{user.name}</span>}
                  {user.phone && <span> ({user.phone})</span>}
                  {user.email && <span> {user.email}</span>}
                </div>
              </div>
            )}
            <div>
              <label className="block mb-1 text-[#1A1F31] font-medium">Issue Category</label>
              <select
                className="border border-gray-300 px-3 py-2 w-full rounded"
                value={category}
                onChange={e => setCategory(e.target.value)}
                required
              >
                {issueCategories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 text-[#1A1F31] font-medium">Subject</label>
              <input
                className="border border-gray-300 px-3 py-2 w-full rounded"
                placeholder="E.g. Late delivery, Product damaged..."
                value={subject}
                onChange={e => setSubject(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-[#1A1F31] font-medium">Description (optional)</label>
              <textarea
                className="border border-gray-300 px-3 py-2 w-full rounded min-h-[70px]"
                placeholder="Briefly describe your issue"
                value={desc}
                onChange={e => setDesc(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold text-lg"
            >
              Start Chat
            </button>
          </form>
        </div>
      </div>
    );
  }

  // After started: Chat UI
  return (
    <div className="min-h-screen bg-[#1A1F31] flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md flex flex-col">
        {waiting ? (
          <div className="flex flex-col items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A1F31] mb-4"></div>
            <h2 className="text-xl font-bold text-[#1A1F31] mb-2">
              Waiting for an available support agent...
            </h2>
            <p className="text-gray-600 text-center">
              Please wait. You’ll be connected as soon as an agent accepts your request.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-3 text-sm text-gray-600 text-center">
              You are now chatting with{" "}
              <span className="font-bold text-[#1A1F31]">{adminName}</span>
            </div>
            <div
              className="flex-1 overflow-y-auto mb-2"
              style={{ minHeight: "200px" }}
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`mb-1 ${
                    msg.from === "You" ? "text-right" : "text-left"
                  }`}
                >
                  <span className="font-semibold">{msg.from}: </span>
                  <span>{msg.text}</span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                className="flex-1 border border-gray-300 px-3 py-2 rounded"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type a message..."
              />
              <button
                type="submit"
                className="bg-[#1A1F31] text-white px-4 py-2 rounded hover:bg-[#232846]"
              >
                Send
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Help;
