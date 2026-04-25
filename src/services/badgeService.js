import { evaluateBadges } from '@/utils/badgeEvaluator';

// --- Backend stub ---
// TODO: Replace with a real API call when a backend is chosen.
// Expected contract: POST /badges/validate
//   body:     { userId, badgeId, userSnapshot }
//   response: { valid: boolean }
async function validateWithBackend(_badgeId, _userSnapshot) {
  // Stub — always approves locally until backend is wired
  return true;
}

/**
 * Evaluates which badges should unlock and optionally validates each with a backend.
 * Local-first by default; flip useBackend when the server is ready.
 *
 * @param {{ completedLessons: object, stats: object, earnedBadges: string[] }} userState
 * @param {Array}   badgeBank
 * @param {object}  [options]
 * @param {boolean} [options.useBackend=false] - Set true when backend is ready
 * @returns {Promise<string[]>} Newly unlocked badge IDs
 */
export async function checkAndUnlockBadges(userState, badgeBank, { useBackend = false } = {}) {
  const candidates = evaluateBadges(userState, badgeBank);
  if (!candidates.length) return [];

  if (useBackend) {
    const results = await Promise.all(
      candidates.map((id) =>
        validateWithBackend(id, userState).then((valid) => (valid ? id : null))
      )
    );
    return results.filter(Boolean);
  }

  return candidates;
}
