import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Driver = Database["public"]["Tables"]["drivers"]["Row"];

let driversCache: Driver[] | null = null;
let driversPromise: Promise<Driver[]> | null = null;

const fetchDriversCached = async () => {
  if (driversCache) return driversCache;

  if (!driversPromise) {
    driversPromise = supabase
      .from("drivers")
      .select("*")
      .order("name", { ascending: true })
      .then(({ data, error }) => {
        if (error) throw error;
        driversCache = data ?? [];
        return driversCache;
      })
      .finally(() => {
        driversPromise = null;
      });
  }

  return driversPromise;
};

export function invalidateDriversCache() {
  driversCache = null;
  driversPromise = null;
}

export function useDriversCache() {
  const [drivers, setDrivers] = useState<Driver[]>(driversCache ?? []);
  const [loading, setLoading] = useState(!driversCache);

  useEffect(() => {
    let mounted = true;
    fetchDriversCached()
      .then((data) => {
        if (mounted) setDrivers(data);
      })
      .catch(() => {
        if (mounted) setDrivers([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { drivers, loading };
}
