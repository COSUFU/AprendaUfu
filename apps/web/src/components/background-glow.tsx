export function BackgroundGlow() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-teal-500/10 blur-[120px]" />
      <div className="absolute -bottom-40 -right-20 h-[32rem] w-[32rem] rounded-full bg-accent/10 blur-[130px]" />
    </div>
  );
}
