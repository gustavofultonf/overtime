import React, { useState } from 'react';
import { C, mono } from './theme.js';
import { playerOvr, marketValue, getRankedTeams } from '../engine/player.js';
import { rosterOf, freeAgents } from '../engine/state.js';
import { AI_TEAMS } from '../constants/data.js';
import { SL, Pill, Stat } from './primitives.jsx';

const ROLES = ["IGL","AWP","Entry","Lurk","Support"];
const roleColor = {IGL:C.live, AWP:"#e05050", Entry:C.acc, Lurk:C.gold, Support:C.win};

function faDesiredSalary(p, career) {
  const r = career?.avgRating || 0.95;
  const mult = r >= 1.15 ? 1.5 : r >= 1.1 ? 1.3 : r >= 1.0 ? 1.1 : r >= 0.9 ? 1.0 : 0.85;
  return Math.max(5, Math.round(p.salary * mult));
}

function MoodTag({ offered, desired }) {
  const [label, col] =
    offered >= desired          ? ["HAPPY",    C.win]  :
    offered >= desired * 0.85   ? ["NEUTRAL",  C.gold] :
                                  ["DEMANDING",C.red];
  return (
    <span style={{fontFamily:mono,fontSize:8,color:col,border:`1px solid ${col}44`,borderRadius:3,padding:"1px 6px"}}>
      {label}
    </span>
  );
}

function PlayerRow({ p, right, selected, onClick }) {
  const rc = roleColor[p.role] || C.dim;
  const ovr = playerOvr(p);
  return (
    <button onClick={onClick}
      style={{background:selected?(right?C.live+"22":C.acc+"22"):C.panel,
        border:`1px solid ${selected?(right?C.live:C.acc):C.line}`,
        borderRadius:7,padding:"8px 10px",textAlign:"left",width:"100%"}}>
      <div style={{fontWeight:700,fontSize:12,color:selected?(right?C.live:C.acc):C.ink}}>{p.name}</div>
      <div style={{display:"flex",gap:6,marginTop:2,alignItems:"center"}}>
        <Pill c={rc}>{p.role}</Pill>
        <span style={{fontFamily:mono,fontSize:9,color:C.faint}}>{ovr} OVR</span>
        <span style={{fontFamily:mono,fontSize:9,color:C.gold}}>${marketValue(p)}K</span>
      </div>
    </button>
  );
}

function ResultBanner({ result, onClose, onMatchCounter }) {
  if (!result) return null;
  const col = result.success ? C.win : result.counter ? C.gold : C.red;
  return (
    <div style={{background:`${col}11`,border:`1px solid ${col}44`,borderRadius:8,
      padding:"10px 14px",marginBottom:12,display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
      <span style={{fontFamily:mono,fontSize:12,color:col,flex:1}}>{result.msg}</span>
      {result.counter && onMatchCounter && (
        <button onClick={onMatchCounter}
          style={{background:C.gold,color:"#0a0c10",border:"none",borderRadius:5,
            padding:"4px 10px",fontFamily:mono,fontSize:9,fontWeight:700}}>
          MATCH COUNTER
        </button>
      )}
      <button onClick={onClose}
        style={{background:"transparent",border:"none",color:C.faint,fontSize:18,lineHeight:1}}>×</button>
    </div>
  );
}

// ── FREE AGENTS ──────────────────────────────────────────────────────────────

function FaTab({ simState, season, myTeam, onNegotiateFA }) {
  const [roleFilter, setRoleFilter]   = useState("all");
  const [sortKey,    setSortKey]      = useState("ovr");
  const [expandedFa, setExpandedFa]   = useState(null);
  const [faOffers,   setFaOffers]     = useState({});
  const [result,     setResult]       = useState(null);

  const rosterFull = rosterOf(simState, myTeam).length >= 5;
  const fas = freeAgents(simState)
    .filter(p => roleFilter === "all" || p.role === roleFilter)
    .sort((a,b) =>
      sortKey === "salary" ? a.salary - b.salary :
      sortKey === "age"    ? a.age - b.age :
      playerOvr(b) - playerOvr(a)
    );

  function getOffer(p) {
    return faOffers[p.name] !== undefined
      ? faOffers[p.name]
      : faDesiredSalary(p, simState.career?.[p.name]);
  }
  function setOffer(p, v) { setFaOffers(o => ({...o, [p.name]: v})); }

  function expandPlayer(p) {
    const next = expandedFa === p.name ? null : p.name;
    setExpandedFa(next);
    setResult(null);
    if (next && faOffers[p.name] === undefined) {
      setOffer(p, faDesiredSalary(p, simState.career?.[p.name]));
    }
  }

  return (
    <div>
      {/* Filters */}
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12,alignItems:"center"}}>
        <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
          {["all",...ROLES].map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              style={{background:roleFilter===r?C.acc:C.panel,color:roleFilter===r?"#0a0c10":C.dim,
                border:`1px solid ${roleFilter===r?C.acc:C.line}`,borderRadius:5,
                padding:"4px 9px",fontFamily:mono,fontSize:9,fontWeight:700}}>
              {r.toUpperCase()}
            </button>
          ))}
        </div>
        <div style={{marginLeft:"auto",display:"flex",gap:3}}>
          {[["ovr","OVR"],["salary","SALARY"],["age","AGE"]].map(([k,l]) => (
            <button key={k} onClick={() => setSortKey(k)}
              style={{background:sortKey===k?C.panel2:C.panel,color:sortKey===k?C.acc:C.faint,
                border:`1px solid ${sortKey===k?C.acc+"44":C.line}`,borderRadius:4,
                padding:"3px 7px",fontFamily:mono,fontSize:9}}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <ResultBanner result={result} onClose={() => setResult(null)}
        onMatchCounter={result?.counter ? () => {
          const p = freeAgents(simState).find(x => x.name === expandedFa);
          if (p) setOffer(p, result.counterSalary);
          setResult(null);
        } : null}/>

      {fas.length === 0
        ? <div style={{fontFamily:mono,fontSize:12,color:C.faint,padding:"24px 0",textAlign:"center"}}>No free agents available.</div>
        : (
        <div style={{display:"flex",flexDirection:"column",gap:5}}>
          {fas.slice(0, 20).map(p => {
            const ovr = playerOvr(p);
            const mv  = marketValue(p);
            const career  = simState.career?.[p.name];
            const desired = faDesiredSalary(p, career);
            const rc      = roleColor[p.role] || C.dim;
            const isExp   = expandedFa === p.name;
            const curOffer= getOffer(p);
            const canAfford = season.budget >= mv;

            return (
              <div key={p.name} style={{background:C.panel,border:`1px solid ${isExp?C.acc:C.line}`,borderRadius:9,overflow:"hidden"}}>
                {/* Summary row */}
                <div onClick={() => expandPlayer(p)}
                  style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",
                    flexWrap:"wrap",cursor:"pointer"}}>
                  <div style={{minWidth:90}}>
                    <div style={{fontWeight:700,fontSize:13}}>{p.name}</div>
                    <div style={{display:"flex",gap:4,marginTop:2}}>
                      <Pill c={rc}>{p.role}</Pill>
                      <span style={{fontFamily:mono,fontSize:9,
                        color:p.age<=22?C.win:p.age>=29?C.gold:C.faint}}>age {p.age}</span>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <Stat l="OVR" v={ovr}/>
                    <Stat l="AIM" v={p.aim}/>
                    <Stat l="SENSE" v={p.gameSense}/>
                  </div>
                  <div style={{marginLeft:"auto",textAlign:"right"}}>
                    <div style={{fontFamily:mono,fontSize:11,color:C.gold}}>Fee: ${mv}K</div>
                    <div style={{fontFamily:mono,fontSize:9,color:C.dim}}>Min: ${desired}K/mo</div>
                  </div>
                  <span style={{fontFamily:mono,fontSize:9,color:C.faint}}>{isExp?"▾":"▸"}</span>
                </div>

                {/* Negotiation panel */}
                {isExp && (
                  <div style={{background:C.panel2,borderTop:`1px solid ${C.line}`,padding:"12px 14px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                      <span style={{fontFamily:mono,fontSize:10,color:C.faint}}>SALARY OFFER ($/mo)</span>
                      <MoodTag offered={curOffer} desired={desired}/>
                      {career?.totalMaps > 0 && (
                        <span style={{fontFamily:mono,fontSize:9,color:C.dim,marginLeft:"auto"}}>
                          career {career.avgRating.toFixed(2)} RTG
                        </span>
                      )}
                    </div>
                    <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}>
                      <button onClick={e => { e.stopPropagation(); setOffer(p, Math.max(1,curOffer-1)); }}
                        style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:5,
                          padding:"4px 9px",fontFamily:mono,color:C.ink}}>−</button>
                      <input type="range" min={1} max={Math.round(desired*2.5)} value={curOffer}
                        onChange={e => setOffer(p, +e.target.value)}
                        onClick={e => e.stopPropagation()}
                        style={{flex:1,accentColor:C.acc}}/>
                      <button onClick={e => { e.stopPropagation(); setOffer(p, Math.min(Math.round(desired*2.5), curOffer+1)); }}
                        style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:5,
                          padding:"4px 9px",fontFamily:mono,color:C.ink}}>+</button>
                      <span style={{fontFamily:mono,fontSize:16,fontWeight:700,color:C.gold,minWidth:60,textAlign:"center"}}>
                        ${curOffer}K
                      </span>
                    </div>
                    <div style={{fontFamily:mono,fontSize:9,color:C.faint,marginBottom:10}}>
                      One-time fee: ${mv}K · Ongoing salary: ${curOffer}K/mo
                    </div>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        const res = onNegotiateFA(p.name, curOffer);
                        setResult(res);
                        if (res.success) { setExpandedFa(null); }
                        if (res.counter) { setOffer(p, res.counterSalary); }
                      }}
                      disabled={!canAfford || rosterFull}
                      style={{width:"100%",
                        background:(!canAfford||rosterFull)?"#1e2530":C.win,
                        color:(!canAfford||rosterFull)?C.faint:"#0a0c10",
                        border:"none",borderRadius:7,padding:"10px",
                        fontWeight:800,fontSize:13,fontFamily:mono}}>
                      {rosterFull   ? "ROSTER FULL"                  :
                       !canAfford   ? `NEED $${mv - season.budget}K` :
                                      `OFFER $${curOffer}K/MO`}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── BUYOUT ───────────────────────────────────────────────────────────────────

function BuyTab({ simState, season, myTeam, onBuyoutOffer }) {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [expanded,     setExpanded]     = useState(null);
  const [buyOffer,     setBuyOffer]     = useState(0);
  const [result,       setResult]       = useState(null);

  const rosterFull = rosterOf(simState, myTeam).length >= 5;
  const activeTeams = AI_TEAMS.filter(t => rosterOf(simState, t).length > 0);

  function expandPlayer(p, mv) {
    const next = expanded === p.name ? null : p.name;
    setExpanded(next);
    if (next) setBuyOffer(Math.round(mv * 1.8));
    setResult(null);
  }

  return (
    <div>
      {/* Team selector */}
      <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:14}}>
        {activeTeams.map(t => (
          <button key={t} onClick={() => { setSelectedTeam(t); setExpanded(null); setResult(null); }}
            style={{background:selectedTeam===t?C.acc:C.panel,
              color:selectedTeam===t?"#0a0c10":C.dim,
              border:`1px solid ${selectedTeam===t?C.acc:C.line}`,
              borderRadius:6,padding:"5px 12px",fontFamily:mono,fontSize:10,fontWeight:700}}>
            {t}
          </button>
        ))}
      </div>

      <ResultBanner result={result} onClose={() => setResult(null)}
        onMatchCounter={result?.counter ? () => { setBuyOffer(result.counterAmount); setResult(null); } : null}/>

      {!selectedTeam && (
        <div style={{fontFamily:mono,fontSize:12,color:C.faint,padding:"24px 0",textAlign:"center"}}>
          Select a team to browse their roster.
        </div>
      )}

      {selectedTeam && (
        <div style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:9,overflow:"hidden"}}>
          <div style={{padding:"8px 14px",borderBottom:`1px solid ${C.line}`,
            fontFamily:mono,fontSize:10,color:C.dim,letterSpacing:1}}>
            {selectedTeam} — ROSTER
          </div>
          {rosterOf(simState, selectedTeam).map(p => {
            const mv  = marketValue(p);
            const rc  = roleColor[p.role] || C.dim;
            const isExp = expanded === p.name;
            const curOffer = isExp ? buyOffer : Math.round(mv * 1.8);
            const canAfford = season.budget >= curOffer;

            return (
              <div key={p.name} style={{borderTop:`1px solid ${C.line}`}}>
                <div onClick={() => expandPlayer(p, mv)}
                  style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",
                    flexWrap:"wrap",cursor:"pointer"}}>
                  <div style={{minWidth:90}}>
                    <div style={{fontWeight:700,fontSize:13}}>{p.name}</div>
                    <div style={{display:"flex",gap:4,marginTop:2}}>
                      <Pill c={rc}>{p.role}</Pill>
                      <span style={{fontFamily:mono,fontSize:9,color:C.faint}}>age {p.age}</span>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <Stat l="OVR" v={playerOvr(p)}/>
                    <Stat l="AIM" v={p.aim}/>
                    <Stat l="SENSE" v={p.gameSense}/>
                  </div>
                  <div style={{marginLeft:"auto",textAlign:"right"}}>
                    <div style={{fontFamily:mono,fontSize:11,color:C.dim}}>MV ${mv}K</div>
                    <div style={{fontFamily:mono,fontSize:9,color:C.faint}}>min ~${Math.round(mv*1.5)}K</div>
                  </div>
                  <span style={{fontFamily:mono,fontSize:9,color:C.faint}}>{isExp?"▾":"▸"}</span>
                </div>

                {isExp && (
                  <div style={{background:C.panel2,borderTop:`1px solid ${C.line}`,padding:"12px 14px"}}>
                    <div style={{fontFamily:mono,fontSize:10,color:C.faint,marginBottom:8}}>
                      TRANSFER OFFER
                    </div>
                    <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}>
                      <input type="range"
                        min={Math.round(mv*0.8)} max={Math.round(mv*3.5)} step={5}
                        value={buyOffer}
                        onChange={e => setBuyOffer(+e.target.value)}
                        style={{flex:1,accentColor:C.acc}}/>
                      <span style={{fontFamily:mono,fontSize:16,fontWeight:700,color:C.gold,minWidth:70,textAlign:"center"}}>
                        ${buyOffer}K
                      </span>
                    </div>
                    {/* Quick offer buttons */}
                    <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:10}}>
                      {[1.2,1.5,1.8,2.2,2.5].map(m => (
                        <button key={m} onClick={() => setBuyOffer(Math.round(mv*m))}
                          style={{background:C.panel,border:`1px solid ${C.line}`,borderRadius:4,
                            padding:"3px 7px",fontFamily:mono,fontSize:9,color:C.dim}}>
                          {m}× (${Math.round(mv*m)}K)
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        const res = onBuyoutOffer(p.name, buyOffer);
                        setResult(res);
                        if (res.success) { setExpanded(null); setSelectedTeam(null); }
                      }}
                      disabled={!canAfford || rosterFull}
                      style={{width:"100%",
                        background:(!canAfford||rosterFull)?"#1e2530":C.live,
                        color:(!canAfford||rosterFull)?C.faint:"#0a0c10",
                        border:"none",borderRadius:7,padding:"10px",
                        fontWeight:800,fontSize:13,fontFamily:mono}}>
                      {rosterFull  ? "ROSTER FULL"       :
                       !canAfford  ? "INSUFFICIENT FUNDS" :
                                     `OFFER $${buyOffer}K`}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── TRADE ────────────────────────────────────────────────────────────────────

function TradeTab({ simState, season, myTeam, onTradeOffer }) {
  const [tradeMyPlayer,   setTradeMyPlayer]   = useState(null);
  const [tradeTeam,       setTradeTeam]       = useState(null);
  const [tradeTheirPlayer,setTradeTheirPlayer] = useState(null);
  const [tradeCash,       setTradeCash]       = useState(0);
  const [result,          setResult]          = useState(null);

  const roster = rosterOf(simState, myTeam);
  const myP    = roster.find(x => x.name === tradeMyPlayer);
  const theirP = tradeTeam ? rosterOf(simState, tradeTeam).find(x => x.name === tradeTheirPlayer) : null;

  const tradeReady = myP && theirP;
  const myMv    = myP    ? marketValue(myP)    : 0;
  const theirMv = theirP ? marketValue(theirP) : 0;
  const offerVal= myMv + tradeCash;
  const gap     = offerVal - theirMv;

  return (
    <div>
      <ResultBanner result={result} onClose={() => setResult(null)}
        onMatchCounter={result?.counter ? () => { setTradeCash(result.counterCash); setResult(null); } : null}/>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
        {/* Your offer */}
        <div>
          <SL n="YOU" t="OFFER"/>
          <div style={{display:"flex",flexDirection:"column",gap:4}}>
            {roster.map(p => (
              <PlayerRow key={p.name} p={p}
                selected={tradeMyPlayer===p.name}
                onClick={() => { setTradeMyPlayer(tradeMyPlayer===p.name?null:p.name); setResult(null); }}/>
            ))}
          </div>
        </div>

        {/* Their player */}
        <div>
          <SL n="THEM" t="REQUEST"/>
          <div style={{display:"flex",gap:3,flexWrap:"wrap",marginBottom:6}}>
            {AI_TEAMS.filter(t => rosterOf(simState,t).length > 0).map(t => (
              <button key={t} onClick={() => { setTradeTeam(t); setTradeTheirPlayer(null); }}
                style={{background:tradeTeam===t?C.acc:C.panel,color:tradeTeam===t?"#0a0c10":C.faint,
                  border:`1px solid ${tradeTeam===t?C.acc:C.line}`,
                  borderRadius:4,padding:"3px 7px",fontFamily:mono,fontSize:9,fontWeight:700}}>
                {t}
              </button>
            ))}
          </div>
          {tradeTeam && (
            <div style={{display:"flex",flexDirection:"column",gap:4}}>
              {rosterOf(simState, tradeTeam).map(p => (
                <PlayerRow key={p.name} p={p} right
                  selected={tradeTheirPlayer===p.name}
                  onClick={() => { setTradeTheirPlayer(tradeTheirPlayer===p.name?null:p.name); setResult(null); }}/>
              ))}
            </div>
          )}
          {!tradeTeam && (
            <div style={{fontFamily:mono,fontSize:10,color:C.faint,padding:"12px 0"}}>
              Pick a team above.
            </div>
          )}
        </div>
      </div>

      {/* Deal summary + cash slider */}
      <div style={{background:C.panel,border:`1px solid ${tradeReady?C.line:C.faint+"22"}`,
        borderRadius:9,padding:"14px",opacity:tradeReady?1:0.5}}>
        <SL n="$$" t="CASH SWEETENER"/>
        <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}>
          <input type="range" min={0} max={Math.min(400, season.budget)} step={5}
            value={tradeCash}
            onChange={e => setTradeCash(+e.target.value)}
            disabled={!tradeReady}
            style={{flex:1,accentColor:C.acc}}/>
          <span style={{fontFamily:mono,fontSize:16,fontWeight:700,color:C.gold,minWidth:60}}>
            +${tradeCash}K
          </span>
        </div>

        {/* Trade value breakdown */}
        {tradeReady && (
          <div style={{display:"flex",gap:16,flexWrap:"wrap",marginBottom:12,
            fontFamily:mono,fontSize:10}}>
            <span style={{color:C.dim}}>
              Your offer: <span style={{color:C.gold}}>${offerVal}K</span>
            </span>
            <span style={{color:C.dim}}>
              Their value: <span style={{color:C.gold}}>${theirMv}K</span>
            </span>
            <span style={{color:gap>=0?C.win:C.red,fontWeight:700}}>
              Gap: {gap>=0?"+":""}{gap}K
            </span>
          </div>
        )}

        <button
          onClick={() => {
            if (!tradeReady) return;
            const res = onTradeOffer(tradeMyPlayer, tradeTheirPlayer, tradeCash);
            setResult(res);
            if (res.success) {
              setTradeMyPlayer(null); setTradeTheirPlayer(null);
              setTradeTeam(null); setTradeCash(0);
            }
          }}
          disabled={!tradeReady || season.budget < tradeCash}
          style={{width:"100%",
            background:(!tradeReady||season.budget<tradeCash)?"#1e2530":C.acc,
            color:(!tradeReady||season.budget<tradeCash)?C.faint:"#0a0c10",
            border:"none",borderRadius:7,padding:"12px",fontWeight:800,fontSize:14,fontFamily:mono}}>
          {!tradeReady          ? "SELECT PLAYERS ABOVE" :
           season.budget<tradeCash ? "INSUFFICIENT FUNDS"   :
                                     "PROPOSE TRADE"}
        </button>
      </div>
    </div>
  );
}

// ── SELL / RELEASE ───────────────────────────────────────────────────────────

function SellTab({ simState, season, myTeam, onSellPlayer, onRelease }) {
  const [sellPlayer, setSellPlayer] = useState(null);
  const [sellBids,   setSellBids]   = useState([]);
  const [result,     setResult]     = useState(null);

  const roster = rosterOf(simState, myTeam);

  function selectForSale(p) {
    if (sellPlayer === p.name) { setSellPlayer(null); setSellBids([]); return; }
    const mv      = marketValue(p);
    const ranked  = getRankedTeams(simState, myTeam);
    const bids    = [];
    for (const team of AI_TEAMS) {
      const tr = rosterOf(simState, team);
      if (tr.length >= 5) continue;
      const rank    = ranked.findIndex(x => x.team === team);
      const budgetF = rank < 5 ? 1.0 : rank < 10 ? 0.85 : 0.70;
      const wantsRole = tr.filter(x => x.role === p.role).length === 0;
      if (wantsRole || Math.random() < 0.20) {
        bids.push({ team, bid: Math.round(mv * (1.15 + Math.random() * 0.85) * budgetF) });
      }
    }
    setSellPlayer(p.name);
    setSellBids(bids.sort((a,b) => b.bid - a.bid).slice(0, 3));
    setResult(null);
  }

  return (
    <div>
      <div style={{fontFamily:mono,fontSize:10,color:C.faint,marginBottom:12}}>
        SELL — generate AI bids. RELEASE — instant 30% refund.
      </div>

      <ResultBanner result={result} onClose={() => setResult(null)}/>

      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {roster.map(p => {
          const mv     = marketValue(p);
          const refund = Math.round(mv * 0.3);
          const rc     = roleColor[p.role] || C.dim;
          const isSel  = sellPlayer === p.name;

          return (
            <div key={p.name} style={{background:C.panel,
              border:`1px solid ${isSel?C.gold:C.line}`,borderRadius:9,overflow:"hidden"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",flexWrap:"wrap"}}>
                <div style={{minWidth:90}}>
                  <div style={{fontWeight:700,fontSize:13}}>{p.name}</div>
                  <div style={{display:"flex",gap:4,marginTop:2}}>
                    <Pill c={rc}>{p.role}</Pill>
                    <span style={{fontFamily:mono,fontSize:9,color:C.faint}}>age {p.age} · {p.contract}ev</span>
                  </div>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <Stat l="OVR" v={playerOvr(p)}/>
                  <Stat l="AIM" v={p.aim}/>
                </div>
                <div style={{marginLeft:"auto",textAlign:"right"}}>
                  <div style={{fontFamily:mono,fontSize:11,color:C.gold}}>MV ${mv}K</div>
                  <div style={{fontFamily:mono,fontSize:9,color:C.faint}}>Release: +${refund}K</div>
                </div>
                <div style={{display:"flex",gap:4}}>
                  <button onClick={() => selectForSale(p)}
                    style={{background:isSel?C.gold:C.panel2,color:isSel?"#0a0c10":C.gold,
                      border:`1px solid ${C.gold}44`,borderRadius:5,
                      padding:"4px 10px",fontFamily:mono,fontSize:9,fontWeight:700}}>
                    {isSel?"HIDE":"SELL"}
                  </button>
                  <button
                    onClick={() => {
                      if (roster.length <= 4) return;
                      onRelease(p.name);
                      setResult({success:true, msg:`${p.name} released. +$${refund}K returned.`});
                      if (sellPlayer === p.name) setSellPlayer(null);
                    }}
                    disabled={roster.length <= 4}
                    style={{background:"transparent",
                      border:`1px solid ${roster.length<=4?C.faint:C.red}`,
                      color:roster.length<=4?C.faint:C.red,
                      borderRadius:5,padding:"4px 10px",fontFamily:mono,fontSize:9,fontWeight:700}}>
                    RELEASE
                  </button>
                </div>
              </div>

              {/* AI bids panel */}
              {isSel && (
                <div style={{background:C.panel2,borderTop:`1px solid ${C.line}`,padding:"12px 14px"}}>
                  <div style={{fontFamily:mono,fontSize:10,color:C.dim,marginBottom:8}}>AI INTEREST</div>
                  {sellBids.length === 0 ? (
                    <div style={{fontFamily:mono,fontSize:11,color:C.faint}}>
                      No teams are interested right now.
                    </div>
                  ) : (
                    <div style={{display:"flex",flexDirection:"column",gap:5}}>
                      {sellBids.map((bid, i) => (
                        <div key={bid.team} style={{display:"flex",alignItems:"center",gap:10,
                          padding:"8px 10px",background:C.panel,
                          border:`1px solid ${i===0?C.win+"44":C.line}`,borderRadius:6}}>
                          <span style={{fontWeight:700,fontSize:12,color:i===0?C.win:C.ink,flex:1}}>
                            {bid.team}
                          </span>
                          {i===0 && (
                            <span style={{fontFamily:mono,fontSize:8,color:C.win,
                              border:`1px solid ${C.win}44`,borderRadius:3,padding:"1px 5px"}}>BEST</span>
                          )}
                          <span style={{fontFamily:mono,fontSize:14,fontWeight:700,color:C.gold}}>
                            ${bid.bid}K
                          </span>
                          <button
                            onClick={() => {
                              onSellPlayer(p.name, bid.team, bid.bid);
                              setResult({success:true, msg:`${p.name} sold to ${bid.team} for $${bid.bid}K!`});
                              setSellPlayer(null);
                            }}
                            style={{background:C.win,color:"#0a0c10",border:"none",
                              borderRadius:5,padding:"5px 12px",fontFamily:mono,fontSize:10,fontWeight:700}}>
                            SELL
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── ROOT ─────────────────────────────────────────────────────────────────────

export function TransferMarket({ season, myTeam, onNegotiateFA, onBuyoutOffer, onTradeOffer, onSellPlayer, onRelease }) {
  const [tab, setTab] = useState("fa");
  const simState = season.simState;

  const TABS = [["fa","FREE AGENTS"],["buy","BUYOUT"],["trade","TRADE"],["sell","SELL / RELEASE"]];

  return (
    <div>
      {/* Inner tab bar */}
      <div style={{display:"flex",gap:0,marginBottom:16,borderBottom:`1px solid ${C.line}`,
        flexWrap:"wrap",alignItems:"flex-end"}}>
        {TABS.map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)}
            style={{background:"transparent",border:"none",padding:"8px 14px",
              fontFamily:mono,fontSize:11,fontWeight:700,letterSpacing:0.5,
              color:tab===k?C.ink:C.dim,
              borderBottom:`2px solid ${tab===k?C.acc:"transparent"}`,
              marginBottom:-1,cursor:"pointer"}}>
            {l}
          </button>
        ))}
        <div style={{marginLeft:"auto",paddingBottom:10,fontFamily:mono,fontSize:11}}>
          <span style={{color:C.faint}}>BUDGET </span>
          <span style={{color:season.budget>0?C.gold:C.red,fontWeight:700}}>${season.budget}K</span>
          <span style={{color:C.faint,marginLeft:10}}>ROSTER </span>
          <span style={{color:C.ink,fontWeight:700}}>{rosterOf(simState,myTeam).length}/5</span>
        </div>
      </div>

      {tab === "fa"    && <FaTab    simState={simState} season={season} myTeam={myTeam} onNegotiateFA={onNegotiateFA}/>}
      {tab === "buy"   && <BuyTab   simState={simState} season={season} myTeam={myTeam} onBuyoutOffer={onBuyoutOffer}/>}
      {tab === "trade" && <TradeTab simState={simState} season={season} myTeam={myTeam} onTradeOffer={onTradeOffer}/>}
      {tab === "sell"  && <SellTab  simState={simState} season={season} myTeam={myTeam} onSellPlayer={onSellPlayer} onRelease={onRelease}/>}
    </div>
  );
}
