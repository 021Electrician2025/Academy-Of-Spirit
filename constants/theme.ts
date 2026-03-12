import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#211E1F',
    background: '#FFFFFF',
    card: '#F5F5F5',
    gold: '#C79F27',
    tint: '#C79F27',
    muted: '#6E6A6B',
    border: '#E5E1DC',
    tabBar: '#FFFFFF',
    tabBarBorder: '#E5E1DC',
    tabIconDefault: '#6E6A6B',
    tabIconSelected: '#C79F27',
  },
  dark: {
    text: '#FFFFFF',
    background: '#121212',
    card: '#1E1E1E',
    gold: '#D4AF37',
    tint: '#D4AF37',
    muted: '#AFAFAF',
    border: '#2E2E2E',
    tabBar: '#1E1E1E',
    tabBarBorder: '#2E2E2E',
    tabIconDefault: '#AFAFAF',
    tabIconSelected: '#D4AF37',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
