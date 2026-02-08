import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Driver = Database["public"]["Tables"]["drivers"]["Row"];

interface RaceDriversProps {
  driverIds?: string[] | null;
}

export function RaceDrivers({ driverIds }: RaceDriversProps) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

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
    <motion.div layout className="card-racing p-4 md:p-6">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between gap-2 mb-4"
      >
        <span className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <span className="font-racing text-base md:text-lg uppercase tracking-wider">
            Pilotos ({drivers.length})
          </span>
        </span>
        <span className="text-muted-foreground">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </span>
      </button>

      <AnimatePresence mode="wait">
        {expanded ? (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid gap-3 sm:grid-cols-2"
          >
            {drivers.map((driver, index) => (
              <motion.div
                key={driver.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
                onClick={() => setSelectedDriver(driver)}
              >
                {driver.image_url ? (
                  <img
                    src={driver.image_url}
                    alt={driver.name}
                    className="h-14 w-14 rounded-full object-cover border-2 border-primary/20"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-racing font-bold text-base truncate">
                    {driver.name}
                  </p>
                  {driver.known_as && (
                    <p className="text-sm text-muted-foreground truncate">
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
          </motion.div>
        ) : (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-2 md:space-y-3"
          >
            {drivers.map((driver, index) => (
              <motion.div
                key={driver.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 p-2 md:p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
                onClick={() => setSelectedDriver(driver)}
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
          </motion.div>
        )}
      </AnimatePresence>
      <Dialog open={!!selectedDriver} onOpenChange={() => setSelectedDriver(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-racing">Piloto</DialogTitle>
          </DialogHeader>
          {selectedDriver && (
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <div className="h-40 w-40 md:h-56 md:w-56 rounded-full overflow-hidden border-2 border-primary/20 bg-secondary/50 flex items-center justify-center">
                {selectedDriver.image_url ? (
                  <img
                    src={selectedDriver.image_url}
                    alt={selectedDriver.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Users className="h-16 w-16 text-primary" />
                )}
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-racing text-2xl font-bold">
                  {selectedDriver.name}
                </h3>
                {selectedDriver.known_as && (
                  <p className="text-muted-foreground mt-1">
                    "{selectedDriver.known_as}"
                  </p>
                )}
                {selectedDriver.category && (
                  <p className="mt-4 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-racing uppercase tracking-wider text-primary">
                    {selectedDriver.category}
                  </p>
                )}
                {selectedDriver.instagram && (
                  <div className="mt-4">
                    <a
                      href={
                        selectedDriver.instagram.startsWith("http")
                          ? selectedDriver.instagram
                          : `https://instagram.com/${selectedDriver.instagram.replace("@", "")}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-[#E4405F] hover:text-[#E4405F]/80 transition-colors"
                    >
                      <img
                        src="/images/instagram.png"
                        alt="Instagram"
                        className="h-4 w-4 shrink-0"
                      />
                      <span>@{selectedDriver.instagram.replace("@", "")}</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
