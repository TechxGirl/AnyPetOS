export default function BrandMark({ size = 44, className = "", title = "AnyPetOS" }) {
  const id = `anypetos-mark-${String(size).replace(/\W/g, "")}`;

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label={title}
    >
      <defs>
        <linearGradient id={`${id}-gradient`} x1="10" y1="10" x2="55" y2="54" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5B5CFF" />
          <stop offset="0.52" stopColor="#1E8FFF" />
          <stop offset="1" stopColor="#22D3EE" />
        </linearGradient>
        <filter id={`${id}-glow`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle cx="32" cy="32" r="24" fill="none" stroke="rgba(148,163,184,.22)" strokeWidth="5" />
      <path d="M12.8 28.4A20.4 20.4 0 0 1 49.4 18" fill="none" stroke={`url(#${id}-gradient)`} strokeWidth="6" strokeLinecap="round" filter={`url(#${id}-glow)`} />
      <path d="M51.2 35.6A20.4 20.4 0 0 1 16.3 47.2" fill="none" stroke={`url(#${id}-gradient)`} strokeWidth="6" strokeLinecap="round" filter={`url(#${id}-glow)`} />
      <circle cx="51" cy="30.7" r="4.2" fill="#22D3EE" />
      <path d="M14.8 41.6l7.8 1.6-5.1 6.2z" fill="#5B5CFF" />
    </svg>
  );
}
