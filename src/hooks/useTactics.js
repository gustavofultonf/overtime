// Tactical style and active map pool selection.
import { setActivePool } from "../engine/state.js";

export function useTactics({ season, setSeason, myTeam, redraw }) {
  function onSetActivePool(maps) {
    setActivePool(season.simState, myTeam, maps);
    setSeason({ ...season });
    redraw();
  }

  function setTactic(tactic) {
    if (!season.simState.tactics) season.simState.tactics = {};
    season.simState.tactics[myTeam] = tactic;
    season.weekLog.push({
      week: season.week,
      activity: "news",
      event: `[T] Tactical style changed to ${tactic}.`,
    });
    setSeason({ ...season });
    redraw();
  }

  return { onSetActivePool, setTactic };
}
