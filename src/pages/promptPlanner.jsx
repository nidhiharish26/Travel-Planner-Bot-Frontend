import React, { useState } from "react";
import axios from "axios";
import { Toaster, toast } from "sonner";

function PromptPlanner() {
  const [promptInput, setPromptInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rawResponse, setRawResponse] = useState(""); // Optional: in case parsing fails

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);
    setRawResponse("");

    console.log("Submitting prompt:", promptInput);

    const hasPlace = /(in|to)\s+\w+/i.test(promptInput);
    const hasDays = /\b(\d+)\s*(day|days)\b/i.test(promptInput);
    if (!hasPlace || !hasDays) {
      if (!hasPlace && !hasDays) {
        toast.error("Please include both destination and number of days");
      } else if (!hasPlace) {
        toast.error("Please include a destination");
      } else {
        toast.error("Please mention the number of days");
      }
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}`, {
        prompt: promptInput,
        mode: "prompt", // Always use prompt mode for this component
      });

      let reply = response.data.reply;
      let parsed;

      try {
        parsed = typeof reply === "string" ? JSON.parse(reply) : reply;
      } catch (e) {
        console.warn("Failed to parse JSON, falling back to raw text.");
        setRawResponse(reply);
        parsed = null;
      }

      console.log("Parsed result:", parsed);
      setResult(parsed);
    } catch (error) {
      console.error("API call failed:", error);
      toast.error("Failed to fetch travel plan");
    } finally {
      setLoading(false);
    }
  };

  const renderFormattedItinerary = (itinerary) => {
    if (!itinerary || typeof itinerary !== "object") {
      return <pre>{JSON.stringify(itinerary, null, 2)}</pre>;
    }

    return Object.entries(itinerary).map(([dayKey, activities], index) => (
      <div
        key={dayKey}
        className="mb-6 p-5 rounded-xl shadow-md bg-gradient-to-br from-yellow-100 to-yellow-200 border-l-4 border-yellow-400"
      >
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          {dayKey.replace("day_", "Day ")}
        </h3>
        <ul className="list-disc pl-5 text-yellow-900">
          {Array.isArray(activities)
            ? activities.map((activity, idx) => (
                <li key={idx} className="mb-1">
                  {typeof activity === "string"
                    ? activity
                    : activity?.name
                    ? activity.name +
                      (activity.location ? ` - ${activity.location}` : "") +
                      (activity.description ? `: ${activity.description}` : "")
                    : JSON.stringify(activity)}
                </li>
              ))
            : typeof activities === "object"
            ? Object.entries(activities).map(([key, val], i) => (
                <li key={i}>
                  <strong>{key}:</strong>{" "}
                  {typeof val === "string" ? val : JSON.stringify(val, null, 2)}
                </li>
              ))
            : null}
        </ul>
      </div>
    ));
  };

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      <Toaster richColors />

      <div className="bg-white/60 rounded-xl shadow-md p-6">
        <div className="text-center mb-4">
          <h3 className="text-2xl font-bold text-yellow-800 mb-2">
            Prompt Mode
          </h3>
          <p className="text-yellow-700">
            Type your travel prompt (e.g. "Plan a 3-day trip to Goa")
          </p>
        </div>

        <textarea
          rows="4"
          value={promptInput}
          onChange={(e) => setPromptInput(e.target.value)}
          placeholder="Type here.."
          className="w-full p-3 text-base border border-yellow-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />

        <div className="text-center">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-4 px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-white rounded-md font-semibold transition disabled:opacity-60"
          >
            {loading ? "Loading..." : "Get Plan"}
          </button>
        </div>
      </div>

      {result?.trip?.itinerary && (
        <div className="mt-8 bg-yellow-50 p-4 rounded-lg shadow">
          <h4 className="text-xl font-semibold text-yellow-800 mb-2">
            Generated Travel Plan
          </h4>
          {renderFormattedItinerary(result.trip.itinerary)}
        </div>
      )}

      {rawResponse && !result && (
        <div className="mt-8 bg-red-100 p-4 rounded-lg text-red-700 shadow">
          <h4 className="text-xl font-semibold mb-2">Unstructured Response</h4>
          <pre className="whitespace-pre-wrap">{rawResponse}</pre>
        </div>
      )}

      {result?.error && (
        <div className="mt-6 text-red-600 bg-red-100 p-4 rounded-md shadow">
          {result.error}
        </div>
      )}
    </div>
  );
}

export default PromptPlanner;
