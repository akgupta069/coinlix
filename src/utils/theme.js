// Single source of truth for all visual constants. Screens/components must
// never use raw hex values, magic numbers, or ad-hoc font sizes — import
// from here instead.

export const Colors = {
  primary: '#6C5CE7',
  primaryDark: '#4B3FCB',
  accent: '#00C2A8',
  background: '#F6F7FB',
  surface: '#FFFFFF',
  surfaceAlt: '#F0F1F8',
  border: '#E7E8F1',
  text: '#1B1D29',
  textSec: '#5B5E72',
  textMuted: '#9698A9',
  success: '#20C46A',
  warning: '#F5A623',
  danger: '#F0483E',
  coin: '#F5B60A',
  overlay: 'rgba(27, 29, 41, 0.5)',
  white: '#FFFFFF',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const Radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
};

export const Typography = {
  h1: { fontSize: 28, fontWeight: '700', color: Colors.text },
  h2: { fontSize: 22, fontWeight: '700', color: Colors.text },
  h3: { fontSize: 17, fontWeight: '600', color: Colors.text },
  body: { fontSize: 15, fontWeight: '400', color: Colors.text },
  small: { fontSize: 13, fontWeight: '400', color: Colors.textSec },
  caption: { fontSize: 11, fontWeight: '500', color: Colors.textMuted },
};

export const Shadows = {
  card: {
    shadowColor: '#1B1D29',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  floating: {
    shadowColor: '#1B1D29',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
};
