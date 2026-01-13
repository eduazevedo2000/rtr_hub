import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Timer } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type QualifyingResult = Database["public"]["Tables"]["qualifying_results"]["Row"];

interface QualifyingTableProps {
  raceId?: string;
}

export function QualifyingTable({ raceId }: QualifyingTableProps) {
  const [results, setResults] = useState<QualifyingResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      let query = supabase
        .from("qualifying_results")
        .select("*")
        .order("position", { ascending: true });

      if (raceId) {
        query = query.eq("race_id", raceId);
      }

      const { data, error } = await query;
      if (!error && data) {
        setResults(data);
      }
      setLoading(false);
    };

    fetchResults();
  }, [raceId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="card-racing p-6 text-center">
        <Timer className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Sem resultados de qualificação</p>
      </div>
    );
  }

  return (
    <div className="card-racing overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="font-racing text-sm uppercase tracking-wider">Qualificação</h3>
      </div>
      <div className="divide-y divide-border">
        {results.map((result) => (
          <div
            key={result.id}
            className="flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors"
          >
            <span
              className={`position-badge ${
                result.position === 1
                  ? "p1"
                  : result.position === 2
                  ? "p2"
                  : result.position === 3
                  ? "p3"
                  : "bg-secondary"
              }`}
            >
              P{result.position}
            </span>
            <div className="flex-1">
              <p className="font-medium">{result.driver}</p>
            </div>
            <p className="font-racing text-sm text-muted-foreground">
              {result.category}
            </p>
            <p className="font-racing text-sm text-muted-foreground">
              {result.lap_time || "—"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
