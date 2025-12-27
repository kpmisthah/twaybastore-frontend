import React, { useRef, useEffect, useState } from "react";

const monkeyGifs = [
  "https://gifdb.com/images/high/typewriter-bored-monkey-typing-ub4dyvgat9831iry.gif",
];

// Sound file must be in public/ folder, referenced as below:
const MONKEY_SOUND = "/videoplayback.mp3";

function StarsBG() {
  const stars = Array.from({ length: 55 });
  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      {stars.map((_, i) => (
        <div
          key={i}
          className="absolute bg-white rounded-full opacity-60"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${1 + Math.random() * 2}px`,
            height: `${1 + Math.random() * 2}px`,
            filter: "blur(0.5px)",
            animation: `twinkle 2s infinite ${Math.random()}s alternate`,
          }}
        />
      ))}
      <style>{`
        @keyframes twinkle {
          from { opacity: 0.5; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

const NotFound = () => {
  const randomGif = monkeyGifs[Math.floor(Math.random() * monkeyGifs.length)];
  const audioRef = useRef(null);
  const [audioStarted, setAudioStarted] = useState(false);

  // Try autoplay once page loads, if not possible, show play button
  useEffect(() => {
    if (audioRef.current) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setAudioStarted(true))
          .catch(() => setAudioStarted(false)); // Blocked by browser, show play button
      }
    }
  }, []);

  // Manual play for user gesture
  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setAudioStarted(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#05031a] via-[#0e1049] to-[#001020] px-4 relative overflow-hidden">
      <audio ref={audioRef} src={MONKEY_SOUND} autoPlay loop />
      <StarsBG />
      <img
        src={randomGif}
        alt="Laughing Monkey"
        className="z-10 w-56 h-56 object-cover rounded-2xl shadow-xl mb-8 mt-2"
        draggable={false}
      />
      <h1 className="z-10 text-4xl sm:text-5xl font-bold text-white mb-3 text-center drop-shadow-xl tracking-tight">
        No offers here kid
      </h1>
      <p className="z-10 text-lg text-blue-200 mb-8 text-center max-w-lg">
        You are lost in space. This monkey is your only company.
      </p>
      {!audioStarted && (
        <button
          onClick={handlePlay}
          className="z-10 mb-4 bg-gray-800/80 border border-blue-300 text-blue-200 px-5 py-2 rounded-xl font-semibold hover:bg-gray-700 transition shadow"
        >
          🔊 Play Space Sound
        </button>
      )}
      <button
        onClick={() => (window.location.href = "/")}
        className="z-10 bg-gradient-to-r from-blue-500 via-cyan-500 cursor-pointer text-white px-8 py-3 rounded-2xl font-semibold text-xl hover:scale-105 transition shadow-xl"
      >
        🛸 Teleport to Earth
      </button>
      {/* Space planet SVG for extra flavor */}
      <svg className="absolute bottom-0 left-0 w-44 opacity-30" viewBox="0 0 200 80" fill="none">
        <ellipse cx="100" cy="60" rx="80" ry="20" fill="#43e0ff" />
        <ellipse cx="150" cy="65" rx="30" ry="7" fill="#c7e7ff" />
      </svg>
    </div>
  );
};

export default NotFound;
