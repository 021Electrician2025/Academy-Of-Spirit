import { useColorScheme as useNativeWindScheme } from 'nativewind';

// Returns the effective color scheme — respects manual overrides (light/dark/system)
// set via useAppTheme() in the settings screen.
export function useColorScheme() {
  const { colorScheme } = useNativeWindScheme();
  return colorScheme ?? 'light';
}
