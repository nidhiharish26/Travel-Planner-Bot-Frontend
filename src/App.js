import React, { useState } from "react";
import "./App.css";
import TravelPlanner from "./pages/travelPlanner";
import PromptPlanner from "./pages/promptPlanner";
import { Toaster } from "sonner";

function App() {
  const [mode, setMode] = useState("structured"); // 'prompt' or 'structured'

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-400 text-gray-900 px-4 py-10">
      <Toaster richColors />

      <div className="max-w-3xl mx-auto bg-white/60 rounded-xl shadow-lg p-8">
        <h1
          className="text-5xl font-bold mb-6 text-center"
          style={{
            fontFamily: "'Pacifico', cursive",
            color: "#8B4513", // SaddleBrown
          }}
        >
          Travel Planner Bot
        </h1>

        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setMode("structured")}
            className={`px-4 py-2 rounded-lg transition duration-200 font-medium ${
              mode === "structured"
                ? "bg-green-500 text-white"
                : "bg-yellow-100 text-yellow-800 border border-yellow-400"
            }`}
          >
            Structured Mode
          </button>

          <button
            onClick={() => setMode("prompt")}
            className={`px-4 py-2 rounded-lg transition duration-200 font-medium ${
              mode === "prompt"
                ? "bg-green-500 text-white"
                : "bg-yellow-100 text-yellow-800 border border-yellow-400"
            }`}
          >
            Prompt Mode
          </button>
        </div>

        {mode === "structured" ? <TravelPlanner /> : <PromptPlanner />}
      </div>
    </div>
  );
}

export default App;
