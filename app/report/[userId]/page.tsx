"use client";

import React, { useState, useEffect, Suspense, use } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { useSearchParams } from "next/navigation";

const MapClient = dynamic(() => import("@/components/MapClient"), {
  ssr: false,
});

export default function ReportPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  // ⬇️ Unwrap the Promise using React's experimental hook
  const { userId } = use(params);

  const searchParams = useSearchParams();

  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");

  const latFromQuery = latParam ? parseFloat(latParam) : null;
  const lngFromQuery = lngParam ? parseFloat(lngParam) : null;

  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(
    latFromQuery && lngFromQuery
      ? { lat: latFromQuery, lng: lngFromQuery }
      : null
  );

  const [description, setDescription] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // OSM Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleOSMSearch = async () => {
    if (!searchQuery) return;
    try {
      const fullQuery = `${searchQuery}, India`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          fullQuery
        )}`
      );
      const data = await response.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        setSelectedLocation({ lat: parseFloat(lat), lng: parseFloat(lon) });
        setSearchError("");
      } else {
        setSearchError("Location not found.");
      }
    } catch (err) {
      console.error(err);
      setSearchError("Search failed. Please try again.");
    }
  };

  const handleSubmit = async () => {
    if (!description || !selectedLocation) {
      setSubmitMessage("Please fill all fields and select location.");
      return;
    }

    const body = {
      userid: userId,
      description,
      latt: selectedLocation.lat,
      long: selectedLocation.lng,
    };

    try {
      setSubmitting(true);
      const URL = "https://vedanta-testmodel.hf.space/app/buffer_review";
      const headers = {
        "Content-Type": "application/json",
      };

      await fetch(URL, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      setSubmitMessage("Report submitted successfully.");
      setDescription("");
    } catch (error) {
      console.error(error);
      setSubmitMessage("Failed to submit report.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetHomeLocation = () => {
    if (latFromQuery && lngFromQuery) {
      setSelectedLocation({ lat: latFromQuery, lng: lngFromQuery });
    }
  };

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-white text-gray-900 p-4 md:p-6 max-w-xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 text-emerald-700">
        Report a Location
      </h1>

      <p className="text-sm text-gray-600 mb-4">
        Reporting as: <span className="font-semibold">{userId}</span>
      </p>

      {latFromQuery && lngFromQuery ? (
        <div className="flex flex-col gap-2 mb-4">
          <p className="text-blue-600 font-medium">
            From URL Query: {latFromQuery.toFixed(5)}, {lngFromQuery.toFixed(5)}
          </p>
          <button
            onClick={handleSetHomeLocation}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-4 rounded"
          >
            Set as Home Location
          </button>
        </div>
      ) : (
        <p className="text-red-500 font-medium mb-4">
          No latitude/longitude in query params.
        </p>
      )}

      {/* Search bar above the map */}
      <div className="space-y-2 mb-4">
        <label className="block font-semibold">Search Location (OSM)</label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search location"
            className="text-black p-2 rounded border w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded"
            onClick={handleOSMSearch}
          >
            Search
          </button>
        </div>
        {searchError && (
          <p className="text-red-500 font-medium">{searchError}</p>
        )}
      </div>

      <Suspense fallback={<div>Loading Map...</div>}>
        <MapClient
          onLocationSelect={setSelectedLocation}
          currentLocation={selectedLocation}
        />
      </Suspense>

      {selectedLocation && (
        <p className="text-gray-700 font-medium mt-2">
          Selected: {selectedLocation.lat.toFixed(5)},{" "}
          {selectedLocation.lng.toFixed(5)}
        </p>
      )}

      <div className="mt-6 space-y-4">
        <div>
          <label className="block mb-1 font-semibold">Description</label>
          <textarea
            className="w-full p-2 border rounded text-black"
            placeholder="Describe the issue here..."
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <button
          className={`bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 px-4 rounded w-full ${
            submitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Submit Report"}
        </button>

        {submitMessage && (
          <p className="text-sm font-medium text-center text-gray-700">
            {submitMessage}
          </p>
        )}
      </div>
    </div>
  );
}
