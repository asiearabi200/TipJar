export default function Shell({ children, className = "" }) {
  return (
    <section
      className={`glass mx-auto w-full max-w-7xl rounded-[2rem] border border-white/10 shadow-panel ${className}`}
    >
      {children}
    </section>
  );
}
