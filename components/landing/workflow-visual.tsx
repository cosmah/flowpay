export function WorkflowVisual() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(126,217,196,0.22),transparent_55%),radial-gradient(ellipse_at_80%_10%,rgba(62,148,148,0.28),transparent_45%),linear-gradient(160deg,#071a22_0%,#0d2f38_48%,#123d42_100%)]" />
      <div className="rx-grid absolute inset-0 opacity-[0.18]" />
      <div className="absolute -right-16 top-24 h-[28rem] w-[28rem] rounded-full border border-[var(--rx-signal)]/25 blur-[1px] rx-orbit" />
      <div className="absolute right-[12%] top-[28%] h-56 w-56 rounded-full border border-white/10 rx-orbit-slow" />
      <svg
        className="absolute bottom-0 left-0 h-[55%] w-full opacity-70"
        viewBox="0 0 1440 420"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          className="rx-flow-path"
          d="M0 280 C 180 220, 280 320, 420 260 S 680 140, 820 200 S 1080 340, 1240 240 S 1380 180, 1440 210"
          stroke="rgba(126,217,196,0.55)"
          strokeWidth="2"
        />
        <path
          className="rx-flow-path-delay"
          d="M0 320 C 200 300, 320 360, 460 300 S 740 180, 900 250 S 1120 360, 1440 280"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="1.5"
        />
      </svg>
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[var(--rx-paper)] to-transparent" />
    </div>
  )
}
