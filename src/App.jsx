import React, { useState, useCallback } from "react";

// Cloud save mirror (no-op if no Firebase config — see src/cloud/firebase.js)
import { cloudEnabled } from "./cloud/firebase.js";

// Constants
import { weekToLabel } from "./constants/events.js";

// Engine
import { getSeed } from "./engine/player.js";
import { resolveSwissFix, bracketElim } from "./engine/tournament.js";

// Hooks (business logic, split out of this file — see src/hooks/)
import { useSaveSystem } from "./hooks/useSaveSystem.js";
import { useRosterOps } from "./hooks/useRosterOps.js";
import { useTournamentFlow } from "./hooks/useTournamentFlow.js";
import { useWeekCycle } from "./hooks/useWeekCycle.js";
import { useFacilities } from "./hooks/useFacilities.js";
import { useSeasonCycle } from "./hooks/useSeasonCycle.js";
import { useTactics } from "./hooks/useTactics.js";

// UI
import { C, sans, GRAD } from "./ui/theme.js";
import { Gstyle } from "./ui/Gstyle.jsx";
import { Header, Tabs } from "./ui/Header.jsx";
import { LoadingScreen } from "./ui/LoadingScreen.jsx";
import { SavesScreen } from "./ui/SavesScreen.jsx";
import { DraftScreen } from "./ui/DraftScreen.jsx";
import { CalendarView } from "./ui/CalendarView.jsx";
import { EventHLTV } from "./ui/EventHLTV.jsx";
import { RosterView2, StatsView } from "./ui/RosterView.jsx";
import { TransferMarket } from "./ui/TransferMarket.jsx";
import { SeasonHistory } from "./ui/SeasonHistory.jsx";
import { MapProfView } from "./ui/MapProfView.jsx";
import { FacilitiesView } from "./ui/FacilitiesView.jsx";
import { FinanceView } from "./ui/FinanceView.jsx";
import { RankingsView } from "./ui/RankingsView.jsx";
import { RivalryView } from "./ui/RivalryView.jsx";
import { VetoOverlay } from "./ui/VetoOverlay.jsx";
import { MatchModal } from "./ui/MatchModal.jsx";
import { MatchReveal } from "./ui/MatchReveal.jsx";
import { EventDebrief } from "./ui/EventDebrief.jsx";
import { DynamicsView } from "./ui/DynamicsView.jsx";
import { TacticsView } from "./ui/TacticsView.jsx";
import { BoardReview } from "./ui/BoardReview.jsx";
import { BankruptcyScreen } from "./ui/BankruptcyScreen.jsx";

export default function App() {
  const [phase, setPhase] = useState("loading"); // loading | saves | draft | season
  const [myTeam, setMyTeam] = useState(null);
  const [season, setSeason] = useState(null);
  const [t, setT] = useState(null);
  const [tab, setTab] = useState("hub");
  const [openMatch, setOpenMatch] = useState(null);
  const [veto, setVeto] = useState(null);
  const [reveal, setReveal] = useState(null);
  const [saves, setSaves] = useState([null, null, null, null]); // [auto, slot1, slot2, slot3]
  const [cloudStatus, setCloudStatus] = useState(
    cloudEnabled ? "connecting" : "off",
  ); // off | connecting | synced | error
  const [, force] = useState(0);
  const redraw = useCallback(() => force((n) => n + 1), []);

  const saveSystem = useSaveSystem({
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
  });
  const rosterOps = useRosterOps({ season, setSeason, myTeam, redraw });
  const tournamentFlow = useTournamentFlow({
    season,
    setSeason,
    myTeam,
    t,
    setT,
    setTab,
    setVeto,
    redraw,
    autoSave: saveSystem.autoSave,
  });
  const weekCycle = useWeekCycle({
    season,
    setSeason,
    myTeam,
    t,
    setT,
    redraw,
    autoSave: saveSystem.autoSave,
    checkWeekTransition: tournamentFlow.checkWeekTransition,
    scoutTeam: rosterOps.scoutTeam,
  });
  const facilities = useFacilities({ season, setSeason, myTeam, redraw });
  const seasonCycle = useSeasonCycle({
    season,
    setSeason,
    myTeam,
    setMyTeam,
    setPhase,
    setTab,
    setT,
    saves,
    writeSaves: saveSystem.writeSaves,
    buildSaveData: saveSystem.buildSaveData,
    autoSave: saveSystem.autoSave,
  });
  const tactics = useTactics({ season, setSeason, myTeam, redraw });

  // Load saves on mount
  React.useEffect(() => {
    saveSystem.loadSaves().then((s) => {
      const hasSave = s.some((x) => x !== null);
      setPhase(hasSave ? "saves" : "draft");
    });
  }, []);

  if (phase === "loading") return <LoadingScreen />;

  if (phase === "saves")
    return (
      <SavesScreen
        saves={saves}
        cloudEnabled={cloudEnabled}
        cloudStatus={cloudStatus}
        onNewSeason={() => setPhase("draft")}
        onLoad={saveSystem.loadFromSave}
        onDelete={saveSystem.deleteSave}
      />
    );

  if (phase === "draft")
    return <DraftScreen onComplete={seasonCycle.onDraftComplete} />;

  // Calendar phase
  if (season?.phase === "calendar" && !t)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: GRAD,
          color: C.ink,
          fontFamily: sans,
        }}
      >
        <Gstyle />
        <Header
          season={season}
          myTeam={myTeam}
          onReset={saveSystem.resetAll}
          onSave={saveSystem.saveToSlot}
          stageLabel={`${weekToLabel(season.week, season.year)} ${season.year || 2026} · W${season.week}`}
        />
        <div className="shell">
        <Tabs tab={tab} setTab={setTab} calMode />
        <main
          style={{
            flex: 1,
            minWidth: 0,
            maxWidth: 1100,
            padding: "22px 26px 80px",
          }}
        >
          {tab === "calendar" && (
            <CalendarView
              season={season}
              myTeam={myTeam}
              onAdvance={weekCycle.advanceWeek}
              onSim={weekCycle.simToNextEvent}
              onAcceptSponsor={weekCycle.acceptSponsorship}
              onDeclineSponsor={weekCycle.declineSponsorship}
              onResolveEvent={weekCycle.resolveChoiceEvent}
              onResolveContract={tournamentFlow.resolveContract}
              onAcceptEntry={tournamentFlow.acceptEntry}
              onDeclineEntry={tournamentFlow.declineEntry}
            />
          )}
          {tab === "roster" && (
            <RosterView2
              state={season.simState}
              myTeam={myTeam}
              onNegotiate={rosterOps.negotiateContract}
              onChangeRole={rosterOps.changeRole}
              onAdjustPay={rosterOps.adjustPay}
            />
          )}
          {tab === "market" && (
            <TransferMarket
              season={season}
              myTeam={myTeam}
              onNegotiateFA={rosterOps.doNegotiateFA}
              onBuyoutOffer={rosterOps.doBuyoutOffer}
              onTradeOffer={rosterOps.doTradeOffer}
              onSellPlayer={rosterOps.doSellPlayer}
              onRelease={(p) => rosterOps.doTransfer("release", p)}
            />
          )}
          {tab === "maps" && (
            <MapProfView
              state={season.simState}
              myTeam={myTeam}
              onSetActivePool={tactics.onSetActivePool}
            />
          )}
          {tab === "facility" && (
            <FacilitiesView
              season={season}
              myTeam={myTeam}
              onUpgrade={facilities.upgradeFacility}
              onHireCoach={facilities.hireCoach}
              onFireCoach={facilities.fireCoach}
              onInitAcademy={facilities.initAcademy}
              onPromoteProspect={facilities.promoteProspect}
              onSellProspect={facilities.sellProspect}
            />
          )}
          {tab === "finance" && <FinanceView season={season} myTeam={myTeam} />}
          {tab === "rankings" && (
            <RankingsView
              state={season.simState}
              myTeam={myTeam}
              week={season.week}
              year={season.year || 2026}
            />
          )}
          {tab === "rivals" && (
            <RivalryView state={season.simState} myTeam={myTeam} />
          )}
          {tab === "dynamics" && (
            <DynamicsView season={season} myTeam={myTeam} />
          )}
          {tab === "tactics" && (
            <TacticsView
              season={season}
              myTeam={myTeam}
              onSetStyle={tactics.setTactic}
            />
          )}
          {tab === "season" && (
            <SeasonHistory season={season} myTeam={myTeam} />
          )}
        </main>
        </div>
        {season.pendingDebrief && (
          <EventDebrief
            debrief={season.pendingDebrief}
            onDismiss={tournamentFlow.dismissDebrief}
          />
        )}
      </div>
    );

  // Bankrupt — organization folded, only path forward is a new org
  if (season?.phase === "bankrupt")
    return (
      <BankruptcyScreen season={season} myTeam={myTeam} onNewOrg={saveSystem.resetAll} />
    );

  // Season done — board review
  if (season?.phase === "done")
    return (
      <div
        style={{
          minHeight: "100vh",
          background: GRAD,
          color: C.ink,
          fontFamily: sans,
        }}
      >
        <Gstyle />
        <Header
          season={season}
          myTeam={myTeam}
          onReset={saveSystem.resetAll}
          onSave={saveSystem.saveToSlot}
          stageLabel={`${season.year || 2026} SEASON COMPLETE`}
        />
        <main
          style={{ maxWidth: 900, margin: "0 auto", padding: "32px 18px 80px" }}
        >
          <BoardReview
            season={season}
            myTeam={myTeam}
            onBeginNewYear={seasonCycle.startNewYear}
            onMenu={saveSystem.resetAll}
          />
        </main>
      </div>
    );

  // Event phase
  if (!t) return null;
  const isMajor = t.isMajor;
  const nf = tournamentFlow.nextUserFx();
  const elimInSwiss = t.swiss?.eliminated?.includes(myTeam);
  const elimInPlayoffs = t.bracket ? bracketElim(t.bracket, myTeam) : false;
  const alive =
    t.stage === "done"
      ? t.champion === myTeam
      : !elimInSwiss && !elimInPlayoffs;
  const evLabel = season.currentEvent?.label || (isMajor ? "MAJOR" : "EVENT");
  const tierTag = season.currentEvent?.tier || "Major";
  const stageLabel =
    { swiss: "GROUP STAGE", playoffs: "PLAYOFFS", done: "COMPLETE" }[t.stage] ||
    "";
  const SEED = getSeed(myTeam, season?.simState);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: GRAD,
        color: C.ink,
        fontFamily: sans,
      }}
    >
      <Gstyle />
      <Header
        season={season}
        myTeam={myTeam}
        onReset={saveSystem.resetAll}
        onSave={saveSystem.saveToSlot}
        stageLabel={`${evLabel} · ${stageLabel}`}
      />
      <div className="shell">
      <Tabs tab={tab} setTab={setTab} miniMode={!isMajor} />
      <main
        style={{ flex: 1, minWidth: 0, maxWidth: 1200, padding: "16px 26px 80px" }}
      >
        {tab === "roster" ? (
          <RosterView2
            state={season.simState}
            myTeam={myTeam}
            onNegotiate={rosterOps.negotiateContract}
            onChangeRole={rosterOps.changeRole}
            onAdjustPay={rosterOps.adjustPay}
          />
        ) : tab === "stats" ? (
          <StatsView t={t} />
        ) : tab === "rivals" ? (
          <RivalryView state={season.simState} myTeam={myTeam} />
        ) : tab === "season" ? (
          <SeasonHistory season={season} myTeam={myTeam} />
        ) : (
          <EventHLTV
            t={t}
            myTeam={myTeam}
            nf={nf}
            onPlay={(fx, bo) => tournamentFlow.beginVeto(fx, bo)}
            alive={alive}
            onOpen={setOpenMatch}
            onEndEvent={tournamentFlow.endEvent}
            season={season}
            SEED={SEED}
            evLabel={evLabel}
            tierTag={tierTag}
            tab={tab}
            setTab={setTab}
          />
        )}
      </main>
      </div>
      {veto && (
        <VetoOverlay
          session={veto}
          myTeam={myTeam}
          t={t}
          onClose={() => setVeto(null)}
          onResolved={(res, fx) => {
            setVeto(null);
            setReveal({ res, fx });
          }}
        />
      )}
      {reveal && (
        <MatchReveal
          reveal={reveal}
          myTeam={myTeam}
          t={t}
          onDone={() => {
            const { res, fx } = reveal;
            fx.res = res;
            fx.done = true;
            // Swiss: update records
            if (t.stage === "swiss" && t.swiss) resolveSwissFix(t.swiss, fx);
            setReveal(null);
            tournamentFlow.afterResult();
          }}
        />
      )}
      {openMatch && (
        <MatchModal m={openMatch} onClose={() => setOpenMatch(null)} />
      )}
    </div>
  );
}
