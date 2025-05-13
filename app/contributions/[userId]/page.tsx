"use client";

import React, { useEffect, useState, use } from "react";
import { createClient } from "@supabase/supabase-js";
import dayjs from "dayjs";

// ---- Supabase Client ----
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ---- CrimeDB Type ----
interface CrimeDB {
  description: string;
  created_at: string;
  rating: number;
  latt: number;
  long: number;
  category: string;
}

// ---- Gradient Color from Rating ----
const getRatingColor = (rating: number) => {
  const clamp = Math.max(1, Math.min(rating, 10));
  const hue = 50 - ((clamp - 1) / 9) * 50; // 50 (yellow) → 0 (red)
  return `hsl(${hue}, 100%, 50%)`;
};

export default function ContributionsPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = use(params);

  const [contributions, setContributions] = useState<CrimeDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchContributions = async () => {
      try {
        const { data, error } = await supabase
          .from("CrimeDB")
          .select("description, created_at, rating, latt, long, category")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) throw error;

        setContributions((data as CrimeDB[]) || []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error(errorMessage);
        setError("Failed to fetch contributions.");
      } finally {
        setLoading(false);
      }
    };

    fetchContributions();
  }, [userId]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 md:p-6 max-w-2xl mx-auto">
      {contributions.length === 0 ? (
        <p>No contributions found.</p>
      ) : (
        <div className="space-y-6">
          {contributions.map((item, index) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-5 bg-white dark:bg-gray-800 hover:shadow-md transition duration-200"
            >
              <div className="flex justify-between items-center mb-3">
                <p className="text-base text-gray-800 dark:text-gray-100">
                  {item.description}
                </p>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {dayjs(item.created_at).format("DD MMM YYYY")}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {item.category &&
                  item.category.split(",").map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-medium px-2 py-1 rounded-full text-white"
                      style={{ backgroundColor: getRatingColor(item.rating) }}
                    >
                      {tag.trim()}
                    </span>
                  ))}
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <p>
                  <strong>Rating:</strong> {item.rating}
                </p>
                <p>
                  <strong>Location:</strong> {item.latt.toFixed(5)},{" "}
                  {item.long.toFixed(5)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
