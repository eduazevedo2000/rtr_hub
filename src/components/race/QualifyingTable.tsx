import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Timer } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type QualifyingResultRow = Database["public"]["Tables"]["qualifying_results"]["Row"];
type DriverRow = Database["public"]["Tables"]["drivers"]["Row"];

type QualifyingResult = QualifyingResultRow & {
  driver?: DriverRow;
};

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

      const { data: resultsData, error: resultsError } = await query;
      
      if (resultsError || !resultsData) {
        setLoading(false);
        return;
      }

      // Buscar os drivers separadamente
      const driverIds = [...new Set(resultsData.map(r => (r as any).driver_id))].filter(Boolean);
      
      if (driverIds.length > 0) {
        const { data: driversData } = await supabase
          .from("drivers")
          .select("*")
          .in("id", driverIds);

        // Fazer o join no código
        const resultsWithDrivers = resultsData.map(result => {
          const driver = driversData?.find(d => d.id === (result as any).driver_id);
          return {
            ...result,
            driver: driver || undefined,
          } as QualifyingResult;
        });

        setResults(resultsWithDrivers);
      } else {
        setResults(resultsData as QualifyingResult[]);
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
    <div className="card-racing overflow-hidden border-l-4 border-l-primary/40 bg-primary/[0.04]">
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
                result.position === "1"
                  ? "p1"
                  : result.position === "2"
                  ? "p2"
                  : result.position === "3"
                  ? "p3"
                  : "bg-secondary"
              }`}
            >
              {result.position !== 'DNF' ? `P${result.position}` : result.position}
            </span>
            <div className="flex-1">
              <p className="font-racing text-sm text-muted-foreground">{result.driver?.name || "—"}</p>
            </div>
            <p className="font-racing text-sm text-muted-foreground">
              {result.driver?.category || "—"}
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
