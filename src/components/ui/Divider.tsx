export function Divider({ className = '' }: { className?: string }) {
  return (
    <hr className={`border-none h-px bg-gradient-to-r from-transparent via-[rgba(196,162,101,0.3)] to-transparent ${className}`} />
  );
}
