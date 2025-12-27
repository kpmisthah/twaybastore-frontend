import React, { useEffect, useState } from "react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const COOLDOWN_MINUTES = 15;

/* Tooltip Component */
const Tooltip = ({ message }) => (
  <span className="relative group ml-2 cursor-pointer">
    <span className="inline-block w-5 h-5 bg-gray-300 text-gray-800 text-xs font-bold rounded-full text-center leading-5">
      ?
    </span>
    <span className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-black text-white text-xs rounded-md px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
      {message}
    </span>
  </span>
);

export default function Contact() {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(null);
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const user = JSON.parse(raw);
        if (user?.email) setEmail(user.email);
      }
    } catch (_) {}
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (!subject.trim() || !message.trim()) {
      setStatus({ type: "error", msg: "Subject and message are required." });
      return;
    }

    setSending(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ subject, message, email }),
        credentials: "include",
      });

      const data = await res.json();

      if (res.status === 429) {
        setStatus({ type: "error", msg: data?.message || "Rate limit exceeded." });
        setCooldown(true);
        setTimeout(() => {
          setCooldown(false);
          setStatus(null);
        }, COOLDOWN_MINUTES * 60 * 1000);
        return;
      }

      if (!res.ok) {
        setStatus({ type: "error", msg: data?.message || "Something went wrong." });
        return;
      }

      setStatus({ type: "success", msg: data?.message || "Message sent successfully!" });
      setSubject("");
      setMessage("");
    } catch (_) {
      setStatus({ type: "error", msg: "Network error. Please try again later." });
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="bg-white min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Get in Touch
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Whether you have a question about an order, a product, or want to collaborate—our team is ready to help.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8 text-sm text-gray-700">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Customer Support</h3>
              <p className="mb-1">For product or order inquiries:</p>
              <a href="mailto:support@twayba.com" className="text-blue-600 underline">
                support@twayba.com
              </a>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Payment Queries</h3>
              <p className="mb-1">For billing or refund assistance:</p>
              <a href="mailto:payment@twayba.com" className="text-blue-600 underline">
                payment@twayba.com
              </a>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Careers</h3>
              <p className="mb-1">Interested in joining our team?</p>
              <a href="mailto:career@twayba.com" className="text-blue-600 underline">
                career@twayba.com
              </a>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Store Address</h3>
              <address className="not-italic leading-6">
                Twayba Ltd.<br />
                100231 Street City<br />
                CIN: 329329393232<br />
                Tel: <a href="tel:392932832u41" className="text-blue-600 underline">392932832u41</a>
              </address>
            </div>
          </div>

          {/* Contact Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-gray-50 rounded-xl p-8 space-y-6 border border-gray-200"
          >
            <h2 className="text-2xl font-semibold text-gray-900">Send Us a Message</h2>

            {status && (
              <div
                className={`text-sm font-medium rounded px-4 py-3 ${
                  status.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-700"
                }`}
              >
                {status.msg}
              </div>
            )}

            {cooldown && (
              <div className="text-sm text-red-600 font-medium flex items-center">
                Why this limit ?
                <Tooltip message="To prevent spam and abuse, we limit messages to a few per hour. This helps us prioritize genuine support requests." />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Email</label>
              <input
                type="email"
                value={email}
                disabled={cooldown || !!email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                disabled={cooldown}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={140}
                placeholder="e.g. Order #12345 - Refund Request"
                className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                value={message}
                disabled={cooldown}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                placeholder="Write your message here..."
                className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={sending || cooldown}
              className="w-full bg-blue-600 text-white font-medium text-sm rounded-md py-2 hover:bg-blue-700 transition disabled:opacity-50"
            >
              {sending ? "Sending..." : cooldown ? `Wait ${COOLDOWN_MINUTES} min` : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
