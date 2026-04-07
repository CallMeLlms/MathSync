import { 
  useFonts,
  Lexend_100Thin,
  Lexend_200ExtraLight,
  Lexend_300Light,
  Lexend_400Regular,
  Lexend_500Medium,
  Lexend_600SemiBold,
  Lexend_700Bold,
  Lexend_800ExtraBold,
  Lexend_900Black
} from '@expo-google-fonts/lexend';
import {
  PlusJakartaSans_200ExtraLight,
  PlusJakartaSans_300Light,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  PlusJakartaSans_200ExtraLight_Italic,
  PlusJakartaSans_300Light_Italic,
  PlusJakartaSans_400Regular_Italic,
  PlusJakartaSans_500Medium_Italic,
  PlusJakartaSans_600SemiBold_Italic,
  PlusJakartaSans_700Bold_Italic,
  PlusJakartaSans_800ExtraBold_Italic
} from '@expo-google-fonts/plus-jakarta-sans';

/**
 * Custom hook to load all required fonts for the MathSync project.
 * Uses @expo-google-fonts for better cross-platform compatibility.
 * 
 * @returns {Array} [loaded, error] - The fonts' loading status.
 */
export function useAppFonts() {
  const [loaded, error] = useFonts({
    // Lexend Variants (Headlines)
    'Lexend-Thin': Lexend_100Thin,
    'Lexend-ExtraLight': Lexend_200ExtraLight,
    'Lexend-Light': Lexend_300Light,
    'Lexend-Regular': Lexend_400Regular,
    'Lexend-Medium': Lexend_500Medium,
    'Lexend-SemiBold': Lexend_600SemiBold,
    'Lexend-Bold': Lexend_700Bold,
    'Lexend-ExtraBold': Lexend_800ExtraBold,
    'Lexend-Black': Lexend_900Black,

    // Plus Jakarta Sans Variants (Body & Titles)
    'PlusJakartaSans-ExtraLight': PlusJakartaSans_200ExtraLight,
    'PlusJakartaSans-Light': PlusJakartaSans_300Light,
    'PlusJakartaSans-Regular': PlusJakartaSans_400Regular,
    'PlusJakartaSans-Medium': PlusJakartaSans_500Medium,
    'PlusJakartaSans-SemiBold': PlusJakartaSans_600SemiBold,
    'PlusJakartaSans-Bold': PlusJakartaSans_700Bold,
    'PlusJakartaSans-ExtraBold': PlusJakartaSans_800ExtraBold,
    'PlusJakartaSans-ExtraLightItalic': PlusJakartaSans_200ExtraLight_Italic,
    'PlusJakartaSans-LightItalic': PlusJakartaSans_300Light_Italic,
    'PlusJakartaSans-RegularItalic': PlusJakartaSans_400Regular_Italic,
    'PlusJakartaSans-MediumItalic': PlusJakartaSans_500Medium_Italic,
    'PlusJakartaSans-SemiBoldItalic': PlusJakartaSans_600SemiBold_Italic,
    'PlusJakartaSans-BoldItalic': PlusJakartaSans_700Bold_Italic,
    'PlusJakartaSans-ExtraBoldItalic': PlusJakartaSans_800ExtraBold_Italic
  });

  return [loaded, error];
}
