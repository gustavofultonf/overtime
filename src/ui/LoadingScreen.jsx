import React from "react";
import { C, sans, mono, GRAD } from "./theme.js";
import { Wordmark } from "./primitives.jsx";
import { Gstyle } from "./Gstyle.jsx";

export function LoadingScreen() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: GRAD,
        color: C.ink,
        fontFamily: sans,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Gstyle />
      <div
        style={{
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        <Wordmark size={22} />
        <div
          style={{
            color: C.dim,
            fontSize: 12,
            fontFamily: mono,
            letterSpacing: 1,
            animation: "pulse 1.4s ease infinite",
          }}
        >
          Loading…
        </div>
      </div>
    </div>
  );
}
