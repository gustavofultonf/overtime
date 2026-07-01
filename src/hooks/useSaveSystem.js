// Save/load, cloud sync, and slot management.
import { cloudEnabled, pullCloudSaves, pushCloudSaves } from "../cloud/firebase.js";
import { weekToLabel } from "../constants/events.js";
import { getRankedTeams } from "../engine/player.js";
import { rosterOf } from "../engine/state.js";
import { CAREER_EVENT_HISTORY_CAP } from "../engine/activity.js";

const SAVE_KEY = "overtime-saves";

// snapshotEventStats() caps career.eventHistory going forward for anyone who plays
// again, but a save that predates that cap (or a player who just hasn't played
// recently) can still be sitting on hundreds of entries per player across the whole
// league right now. Trim everyone unconditionally before every save so an
// already-bloated save shrinks back down on the very next autosave instead of
// waiting for each individual player to play another event.
function trimCareerHistories(simState) {
  if (!simState?.career) return;
  for (const c of Object.values(simState.career)) {
    if (c.eventHistory?.length > CAREER_EVENT_HISTORY_CAP) {
      c.eventHistory.splice(0, c.eventHistory.length - CAREER_EVENT_HISTORY_CAP);
    }
  }
}

// Slot-by-slot: newer `savedAt` wins. An empty local slot is filled from cloud (e.g.
// first load on a new device); an empty cloud slot doesn't erase a local save.
function mergeSaves(local, cloud) {
  if (!cloud) return local;
  return local.map((l, i) => {
    const c = cloud[i];
    if (!c) return l;
    if (!l) return c;
    return c.savedAt > l.savedAt ? c : l;
  });
}

// Self-heals the double-wrapped matches[] shape a legacy snapshotTournament()
// could produce ([[f1,f2,...]] instead of [f1,f2,...]) — harmless for
// JSON.stringify/localStorage, but Firestore's setDoc() rejects nested arrays
// outright, and EventDetail.jsx's matches.map() was silently rendering garbage
// for it too. Shared by both the in-progress tournament save path and the
// completed-event history sanitizer below — a tournament loaded from an old
// save carrying the bad shape would otherwise keep re-saving it verbatim on
// every autosave, since only history (not the live in-progress event) used
// to get cleaned up.
function sanitizeSwissRecords(records) {
  if (!records) return records;
  const fixed = {};
  let changed = false;
  for (const [team, r] of Object.entries(records)) {
    const flatMatches = Array.isArray(r.matches) ? r.matches.flat() : r.matches;
    if (flatMatches !== r.matches) changed = true;
    fixed[team] = { ...r, matches: flatMatches };
  }
  return changed ? fixed : records;
}

// Strip non-serializable refs (rng functions, duplicate simState pointer) so an
// in-progress tournament can round-trip through JSON without losing match progress.
function tournamentForSave(tt) {
  if (!tt) return null;
  const { simState: _s, rng: _r, swiss, ...rest } = tt;
  let swissOut = null;
  if (swiss) {
    const { simState: _s2, rng: _r2, records, ...swissRest } = swiss;
    swissOut = { ...swissRest, records: sanitizeSwissRecords(records) };
  }
  return { ...rest, swiss: swissOut };
}
function tournamentFromSave(saved, simState) {
  if (!saved) return null;
  const tt = { ...saved, simState, rng: Math.random };
  if (tt.swiss) tt.swiss = { ...tt.swiss, simState, rng: Math.random };
  return tt;
}

// Self-heals any completed-event history entry still carrying the bad
// double-wrapped matches[] shape — see sanitizeSwissRecords above. Also drops the
// swiss `rounds` field if a history entry still has one: it used to get saved
// alongside `records`, but every fixture in it is already duplicated in
// `records[team].matches`, and nothing reads `rounds` back out of saved history
// (EventDetail/SeasonHistory only ever use `records`) — see snapshotTournament().
// Measured at ~35% of a season's stored history size, so worth clearing out of
// saves made before that fix instead of waiting for it to age out naturally.
function sanitizeHistory(history) {
  return (history || []).map((h) => {
    const records = h.tournament?.swiss?.records;
    const hasRounds = h.tournament?.swiss?.rounds !== undefined;
    if (!records && !hasRounds) return h;
    const fixed = records ? sanitizeSwissRecords(records) : records;
    if (fixed === records && !hasRounds) return h;
    const { rounds: _rounds, ...swissRest } = h.tournament.swiss;
    return { ...h, tournament: { ...h.tournament, swiss: { ...swissRest, records: fixed } } };
  });
}

export function useSaveSystem({
  myTeam,
  setMyTeam,
  season,
  setSeason,
  t,
  setT,
  setTab,
  setPhase,
  saves,
  setSaves,
  setCloudStatus,
}) {
  async function loadSaves() {
    let local = [null, null, null, null];
    try {
      const result = await window.storage.get(SAVE_KEY);
      if (result && result.value) local = JSON.parse(result.value);
    } catch (e) {
      console.log("No local saves found");
    }
    if (!cloudEnabled) {
      setSaves(local);
      return local;
    }
    const cloud = await pullCloudSaves();
    const merged = mergeSaves(local, cloud);
    setSaves(merged);
    try {
      await window.storage.set(SAVE_KEY, JSON.stringify(merged));
    } catch (e) {
      console.error("Local save write failed:", e);
    }
    // Push back so a slot that only existed locally (or only in the cloud) ends up
    // mirrored on both sides after the merge.
    pushCloudSaves(merged).then((ok) => setCloudStatus(ok ? "synced" : "error"));
    return merged;
  }

  async function writeSaves(newSaves) {
    try {
      await window.storage.set(SAVE_KEY, JSON.stringify(newSaves));
      setSaves(newSaves);
    } catch (e) {
      console.error("Save failed:", e);
    }
    if (cloudEnabled) {
      setCloudStatus("connecting");
      pushCloudSaves(newSaves).then((ok) => setCloudStatus(ok ? "synced" : "error"));
    }
  }

  // overrideT lets callers pass a tournament object that was just created via setT()
  // this render — the `t` state variable itself won't reflect it until next render.
  function buildSaveData(overrideT) {
    if (!season || !myTeam) return null;
    trimCareerHistories(season.simState);
    return {
      myTeam,
      season: { ...season, simState: undefined, history: sanitizeHistory(season.history) }, // simState saved separately
      simState: season.simState,
      tournament: tournamentForSave(overrideT !== undefined ? overrideT : t), // in-progress event, if any
      savedAt: new Date().toISOString(),
      summary: {
        week: season.week,
        date: weekToLabel(season.week, season.year),
        year: season.year || 2026,
        budget: season.budget,
        roster: rosterOf(season.simState, myTeam).map((p) => p.name),
        rank: (() => {
          const r = getRankedTeams(season.simState, myTeam);
          return r.findIndex((x) => x.team === myTeam) + 1;
        })(),
        events: season.history.length,
      },
    };
  }

  async function autoSave(overrideT) {
    const data = buildSaveData(overrideT);
    if (!data) return;
    const cur = [...saves];
    cur[0] = data;
    await writeSaves(cur);
  }

  async function saveToSlot(slot) {
    const data = buildSaveData();
    if (!data) return;
    const cur = [...saves];
    cur[slot] = data;
    await writeSaves(cur);
  }

  function loadFromSave(save) {
    if (!save) return;
    const s = {
      ...save.season,
      simState: save.simState,
      history: sanitizeHistory(save.season.history),
    };
    const restoredT = save.tournament
      ? tournamentFromSave(save.tournament, s.simState)
      : null;
    // Older saves (pre-tournament-persistence) or a save with no in-progress event
    // fall back to the calendar instead of rendering a phantom event screen.
    if (!restoredT && s.phase === "event") s.phase = "calendar";
    setMyTeam(save.myTeam);
    setSeason(s);
    setT(restoredT);
    setPhase("season");
    setTab(restoredT ? "hub" : "calendar");
  }

  async function deleteSave(slot) {
    const cur = [...saves];
    cur[slot] = null;
    await writeSaves(cur);
  }

  function resetAll() {
    setPhase("saves");
    setMyTeam(null);
    setSeason(null);
    setT(null);
    setTab("hub");
    loadSaves();
  }

  return {
    loadSaves,
    writeSaves,
    buildSaveData,
    autoSave,
    saveToSlot,
    loadFromSave,
    deleteSave,
    resetAll,
  };
}
