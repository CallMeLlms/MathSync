/**
 * MathSync Tonal Hierarchy & Color System
 * 
 * Extracted from the "Tactile Discovery Garden" Design Guidelines (README.md).
 * Follows the principle of tonal depth and soft shifts instead of rigid lines/shadows.
 */

export const Colors = {
  // Core Tonal Hierarchy
  primary: '#9f4200',          // Action Orange: Major interactions & achievements
  secondary: '#0058ca',        // Curiosity Blue: Navigational & exploration tasks
  tertiary: '#006e2a',         // Growth Green: Progress & reinforcement
  
  // Surfaces & Backgrounds (Warm Paper approach)
  surface: '#fff8f3',          // Warm Paper: Base background for lower eye strain
  onSurface: '#231a0d',        // Darkest neutral for text and ambient shadows
  
  // Semantic / Functional Variants
  // Note: These are derived from the core palette to maintain tonal consistency
  surfaceContainerLow: '#fff1e6',     // Subtle shift for background sectioning
  surfaceContainerHigh: '#ffe4d1',    // More pronounced shift for secondary cards
  surfaceContainerHighest: '#f7d7bd', // For highest contrast surfaces (e.g. inner cards)
  
  onPrimary: '#ffffff',        // Text on primary backgrounds
  primaryContainer: '#ffdcc3',  // Lighter primary for gradients and CTAs
  
  onSurfaceVariant: '#524437', // Muted text for labels and secondary info
  outlineVariant: 'rgba(35, 26, 13, 0.2)', // Ghost Border (20% opacity on-surface)
  
  // Semantic Signaling
  success: '#006e2a',          // Same as Tertiary (Growth Green)
  error: '#ba1a1a',            // Standard clear error signaling
  
  // Custom Components
  bloomProgress: '#006e2a',    // For "The Progress Bloom" circles
};

export default Colors;
