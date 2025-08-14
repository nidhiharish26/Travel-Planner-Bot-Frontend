import React, { useState } from "react";
import axios from "axios";
import { toast } from "sonner";

function App() {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState("");
  const [plan, setPlan] = useState(null);
  const [structuredData, setStructuredData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mode] = useState("structured"); // structured | prompt

  /*************  ✨ Windsurf Command 🌟  *************/
  const fetchTravelPlan = async (e) => {
    e.preventDefault();

    // Reset the plan display
    if (!destination || !days) {
      setPlan("Please enter both a destination and number of days.");
      setStructuredData(null);
      return;
    }

    if (days <= 0) {
      toast.error("Please enter a valid number of days.");
      return;
    }

    setLoading(true);
    setPlan(null);
    setStructuredData(null);

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/travel`, {
        destination,
        days,
        mode,
      });

      console.log("API Response:", response.data);

      if (mode === "structured") {
        const raw = response?.data?.reply ?? response?.data;
        console.log("Raw API Reply:", raw);

        let parsed;
        if (typeof raw === "string") {
          const cleaned = raw.replace(/```json|```/g, "").trim();
          try {
            parsed = JSON.parse(cleaned);
          } catch (err) {
            console.error("Error parsing structured response:", err.message);
            setPlan("Error parsing structured travel plan. Check console.");
            return;
          }
        } else if (typeof raw === "object" && raw !== null) {
          parsed = raw;
        } else {
          console.error("Invalid structured response format:", raw);
          setPlan("Structured response is not in expected format.");
          return;
        }

        const itinerary = parsed?.trip?.itinerary ?? parsed?.itinerary;

        if (itinerary && typeof itinerary === "object") {
          setStructuredData(itinerary);
        } else {
          console.error("Parsed response missing 'itinerary' field:", parsed);
          setPlan("Invalid format: 'itinerary' field missing.");
        }
      } else {
        setPlan(response.data);
      }
    } catch (error) {
      console.error("Error during fetch:", error);
      setPlan("Something went wrong. Check console.");
    } finally {
      setLoading(false);
    }
  };
  /*******  e65c5961-ca4f-4536-8df3-c9191e08fd9a  *******/

  const renderStructuredPlan = () => {
    return Object.entries(structuredData).map(([dayKey, dayData]) => (
      <div
        key={dayKey}
        className="mb-6 p-5 rounded-xl shadow-md bg-gradient-to-br from-yellow-100 to-yellow-200 border-l-4 border-yellow-400"
      >
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          {dayKey.replace("day_", "Day ")}
        </h3>
        <ul className="list-disc pl-5 text-yellow-900">
          {dayData.activities.map((activity, index) => (
            <li key={index}>
              {activity.time} - {activity.activity}
            </li>
          ))}
        </ul>
      </div>
    ));
  };

  return (
    <div className="bg-white/60 rounded-xl shadow-md p-6">
      <div className="text-center mb-4">
        <h3 className="text-2xl font-bold text-yellow-800">Structured Mode</h3>
      </div>
      <form
        onSubmit={fetchTravelPlan}
        className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto mt-6 space-y-4"
      >
        <input
          type="text"
          placeholder="Enter destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="w-full px-4 py-2 border border-yellow-400 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />
        <input
          type="number"
          placeholder="Enter number of days"
          value={days}
          onChange={(e) => setDays(e.target.value)}
          className="w-full px-4 py-2 border border-yellow-400 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />
        <div className="text-center">
          <button
            type="submit"
            className="mt-4 px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-white rounded-md font-semibold transition disabled:opacity-60"
          >
            Get Plan
          </button>
        </div>
      </form>

      {loading && (
        <div className="text-center mb-4">
          <p className="text-1xl font-semibold text-yellow-500">Loading...</p>
        </div>
      )}

      {/* Structured Output */}
      {structuredData && (
        <div className="mt-8 bg-yellow-50 p-4 rounded-lg shadow">
          <h4 className="text-xl font-semibold text-yellow-800 mb-4">
            Generated Travel Plan
          </h4>
          {renderStructuredPlan()}
        </div>
      )}

      {/* Prompt Output */}
      {plan && mode === "prompt" && (
        <div style={{ marginTop: "1rem" }}>
          <h2>Your Travel Plan</h2>
          <pre>{plan}</pre>
        </div>
      )}

      {/* Error Display */}
      {plan && mode === "structured" && (
        <div style={{ marginTop: "1rem", color: "red" }}>
          {/* <h2>Error</h2> */}
          <pre>{plan}</pre>
        </div>
      )}
    </div>
  );
}

export default App;


