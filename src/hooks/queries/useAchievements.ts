import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys } from "./queryKeys";
import type { Database } from "@/integrations/supabase/types";

type Race = Database["public"]["Tables"]["races"]["Row"];
type AchievementPosition = Database["public"]["Tables"]["achievement_positions"]["Row"];

interface PalmaresData {
  races: Race[];
  racePositions: Record<string, AchievementPosition[]>;
}

export function usePalmares() {
  return useQuery({
    queryKey: queryKeys.achievements.all,
    queryFn: async (): Promise<PalmaresData> => {
      const { data: achievementsData, error: achievementsError } = await supabase
        .from("team_achievements")
        .select(`
          id,
          race_id,
          achievement_positions (
            id,
            category,
            position_finished
          )
        `);

      if (achievementsError) throw achievementsError;

      const raceIdsWithAchievements = achievementsData
        ?.map(a => a.race_id)
        .filter(Boolean) || [];

      const now = new Date().toISOString();

      let query = supabase
        .from("races")
        .select("*")
        .order("date", { ascending: false });

      if (raceIdsWithAchievements.length > 0) {
        query = query.or(`id.in.(${raceIdsWithAchievements.join(',')}),date.lt.${now}`);
      } else {
        query = query.lt("date", now);
      }

      const { data: racesData, error: racesError } = await query;
      if (racesError) throw racesError;

      const positionsMap: Record<string, AchievementPosition[]> = {};

      if (achievementsData) {
        for (const achievement of achievementsData) {
          if (!achievement.race_id || !achievement.achievement_positions) continue;

          const positions = Array.isArray(achievement.achievement_positions)
            ? achievement.achievement_positions
            : [achievement.achievement_positions];

          if (positions.length === 0) continue;

          const existingPositions = positionsMap[achievement.race_id] ?? [];
          positionsMap[achievement.race_id] = [
            ...existingPositions,
            ...(positions as AchievementPosition[]),
          ];
        }

        for (const raceId of Object.keys(positionsMap)) {
          const uniqueByCategoryAndPosition = new Map<string, AchievementPosition>();
          for (const position of positionsMap[raceId]) {
            uniqueByCategoryAndPosition.set(
              `${position.category}::${position.position_finished}`,
              position
            );
          }

          positionsMap[raceId] = Array.from(uniqueByCategoryAndPosition.values()).sort(
            (a, b) => a.category.localeCompare(b.category)
          );
        }
      }

      return {
        races: racesData || [],
        racePositions: positionsMap,
      };
    },
  });
}
