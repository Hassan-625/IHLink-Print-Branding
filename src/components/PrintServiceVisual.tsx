const productImages: Record<string, string> = {
  'awards, trophies & plaques': 'awards',
  'banners & flex': 'banners',
  'binding': 'binding',
  'black & white printing': 'photocopying',
  'books & booklets': 'booklets',
  'brand identity': 'brand-identity',
  'brochures': 'brochures',
  'business cards': 'brand-identity',
  'certificates': 'certificates',
  'colour printing': 'colour-printing',
  'flyers & handbills': 'flyers',
  'graphic design': 'graphic-design',
  'id cards': 'id-cards',
  'lamination': 'lamination',
  'letterheads': 'letterheads',
  'mug branding': 'mug',
  'photocopying': 'photocopying',
  'posters': 'posters',
  'scanning & digitisation': 'scanning',
  'signage': 'signage',
  'souvenirs & promotional items': 'gifts',
  't-shirt & apparel branding': 'tshirt',
  'typing & document preparation': 'typing',
};

const serviceImages: [RegExp, string][] = [
  [/award|troph|plaque/i, 'awards'],
  [/business.?card/i, 'cards'],
  [/banner|roll.?up|flex/i, 'banners'],
  [/apparel|shirt|wear|cap/i, 'apparel'],
  [/gift|mug|souvenir|promotional/i, 'gifts'],
  [/stamp|\bid\b|identity/i, 'identity'],
  [/bind|book|document|typing/i, 'binding'],
  [/signage|sticker/i, 'signage'],
  [/flyer|brochure|handbill/i, 'flyers'],
];

export function PrintServiceVisual({ name }: { name: string }) {
  const image = productImages[name.trim().toLowerCase()]
    ?? serviceImages.find(([pattern]) => pattern.test(name))?.[1]
    ?? 'studio';
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
