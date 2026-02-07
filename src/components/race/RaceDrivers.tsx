import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Driver = Database["public"]["Tables"]["drivers"]["Row"];

interface RaceDriversProps {
  driverIds?: string[] | null;
}

export function RaceDrivers({ driverIds }: RaceDriversProps) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDrivers = async () => {
      if (!driverIds || driverIds.length === 0) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("drivers")
        .select("*")
        .in("id", driverIds)
        .order("name", { ascending: true });

      if (!error && data) {
        setDrivers(data);
      }
      setLoading(false);
    };

    fetchDrivers();
  }, [driverIds]);

  if (loading) {
    return (
      <div className="card-racing p-6">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!driverIds || driverIds.length === 0 || drivers.length === 0) {
    return (
      <div className="card-racing p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="font-racing text-base uppercase tracking-wider">Pilotos</h3>
        </div>
        <p className="text-sm text-muted-foreground text-center py-4">
          Nenhum piloto definido para esta corrida
        </p>
      </div>
    );
  }

  return (
    <div className="card-racing p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-5 w-5 text-primary" />
        <h3 className="font-racing text-base md:text-lg uppercase tracking-wider">
          Pilotos ({drivers.length})
        </h3>
      </div>
      <div className="space-y-2 md:space-y-3">
        {drivers.map((driver, index) => (
          <motion.div
            key={driver.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-3 p-2 md:p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
          >
            {driver.image_url ? (
              <img
                src={driver.image_url}
                alt={driver.name}
                className="h-10 w-10 md:h-12 md:w-12 rounded-full object-cover border-2 border-primary/20"
              />
            ) : (
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                <Users className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-racing font-bold text-sm md:text-base truncate">
                {driver.name}
              </p>
              {driver.known_as && (
                <p className="text-xs text-muted-foreground truncate">
                  "{driver.known_as}"
                </p>
              )}
              {driver.category && (
                <p className="text-xs font-racing uppercase tracking-wider text-primary/80">
                  {driver.category}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
