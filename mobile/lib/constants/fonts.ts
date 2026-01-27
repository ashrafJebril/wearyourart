export const AVAILABLE_FONTS = [
  // Latin fonts
  { name: 'Roboto', value: 'Roboto' },
  { name: 'Open Sans', value: 'Open Sans' },
  { name: 'Montserrat', value: 'Montserrat' },
  { name: 'Playfair Display', value: 'Playfair Display' },
  { name: 'Oswald', value: 'Oswald' },
  { name: 'Pacifico', value: 'Pacifico' },
  { name: 'Bebas Neue', value: 'Bebas Neue' },
  { name: 'Dancing Script', value: 'Dancing Script' },
  // Arabic fonts
  { name: 'Cairo - القاهرة', value: 'Cairo' },
  { name: 'Tajawal - تجوال', value: 'Tajawal' },
  { name: 'Amiri - أميري', value: 'Amiri' },
  { name: 'Noto Naskh Arabic', value: 'Noto Naskh Arabic' },
  { name: 'Scheherazade - شهرزاد', value: 'Scheherazade New' },
  { name: 'Aref Ruqaa - عارف رقعة', value: 'Aref Ruqaa' },
  { name: 'Lateef - لطيف', value: 'Lateef' },
  { name: 'Harmattan', value: 'Harmattan' },
] as const

export type FontValue = typeof AVAILABLE_FONTS[number]['value']
