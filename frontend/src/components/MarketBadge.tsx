interface Props { market: 'USA' | 'EUROPE'; size?: 'sm' | 'md'; }

export default function MarketBadge({ market, size = 'md' }: Props) {
  const flag = market === 'USA' ? '🇺🇸' : '🇪🇺';
  const label = market === 'USA' ? 'USA' : 'Europe';
  const cls = size === 'sm'
    ? 'text-xs px-2 py-0.5 gap-1'
    : 'text-sm px-3 py-1 gap-1.5';
  return (
    <span className={`inline-flex items-center ${cls} rounded-full font-medium bg-navy-800 text-white border border-navy-700`}>
      <span>{flag}</span>
      <span>{label}</span>
    </span>
  );
}
