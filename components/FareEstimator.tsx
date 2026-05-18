"use client";

import { useState } from "react";

interface Props {
  fromSuburb: string;
  toSuburb: string;
  onEstimate: (fare: number) => void;
}

export default function FareEstimator({
  fromSuburb,
  toSuburb,
  onEstimate,
}: Props) {
  const [result, setResult] = useState<{
    estimated_fare: number;
    distance_km: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEstimate = async () => {
    if (!fromSuburb.trim() || !toSuburb.trim()) {
      setError(
        "Please fill in both pickup suburb and destination suburb first",
      );
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(
        `/api/fare?from=${encodeURIComponent(fromSuburb)}&to=${encodeURIComponent(toSuburb)}`,
      );
      const data = await res.json();
      if (data.success) {
        setResult(data);
        onEstimate(data.estimated_fare);
      }
    } catch {
      setError("Could not fetch estimate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-700">Fare Estimate</p>
          {result ? (
            <p className="text-lg font-bold text-green-700">
              ${result.estimated_fare.toFixed(2)}{" "}
              <span className="text-sm font-normal text-gray-500">
                (~{result.distance_km} km)
              </span>
            </p>
          ) : (
            <p className="text-sm text-gray-500">
              Based on suburb-to-suburb flat rate
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleEstimate}
          disabled={loading}
          className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium rounded text-sm disabled:opacity-50"
        >
          {loading ? "Estimating..." : "Get Estimate"}
        </button>
      </div>
      {result && (
        <p className="text-xs text-gray-500 mt-1">
          Estimate only — actual fare may vary. Valid for {fromSuburb} →{" "}
          {toSuburb}.
        </p>
      )}
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}
