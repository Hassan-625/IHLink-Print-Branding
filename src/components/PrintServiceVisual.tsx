const serviceImages: [RegExp, string][] = [
  [/award|troph|plaque/i, 'awards'],
  [/business.?card/i, 'cards'],
  [/banner|roll.?up|flex/i, 'banners'],
  [/apparel|shirt|wear|cap/i, 'apparel'],
  [/gift|mug|souvenir|promotional/i, 'gifts'],
  [/stamp|\bid\b|identity/i, 'identity'],
  [/bind|book|document|typing/i, 'binding'],
  [/signage|sticker|graphic/i, 'signage'],
];

export function PrintServiceVisual({ name }: { name: string }) {
  const image = serviceImages.find(([pattern]) => pattern.test(name))?.[1] ?? 'flyers';
  return (
    <div className="aspect-[4/3] w-full bg-[#f8f6f2]">
      <img
        src={`/images/print-${image}.webp`}
        alt={`${name} — IHLink branded product illustration`}
        width={1448}
        height={1086}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-contain"
      />
    </div>
  );
}
