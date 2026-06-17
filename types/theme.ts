import { Colors as _Colors } from '../constants/colors';

export type ColorScheme = 'light' | 'dark';

export type Theme = typeof _Colors['light'];

export interface ThemeContextType {
  scheme: ColorScheme;
  colors: Theme;
  toggleTheme: () => Promise<void>;
  setScheme: (s: ColorScheme) => Promise<void>;
}
