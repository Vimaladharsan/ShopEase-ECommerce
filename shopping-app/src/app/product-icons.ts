const CATEGORY_EMOJI: Record<string, string> = {
  Electronics: '💻',
  Food: '🍕',
  Games: '🎮',
  Clothes: '👕'
};

const PRODUCT_EMOJI: Record<string, string> = {
  Laptop: '💻',
  Phone: '📱',
  HeadPhones: '🎧',
  TV: '📺',
  Pizza: '🍕',
  Burger: '🍔',
  Sandwich: '🥪',
  Juice: '🧃',
  'Grand Theft Auto V': '🚗',
  'God of War': '⚔️',
  'Red Dead Redemption 2': '🤠',
  Sekiro: '🗡️',
  Shirt: '👔',
  Pant: '👖',
  'T-Shirt': '👕',
  Trousers: '🩳'
};

export function categoryEmoji(name: string): string {
  return CATEGORY_EMOJI[name] ?? '🛒';
}

export function productEmoji(name: string): string {
  return PRODUCT_EMOJI[name] ?? '🛍️';
}
