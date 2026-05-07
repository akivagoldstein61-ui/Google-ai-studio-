/**
 * Input validation for the rewrite-first message coach.
 *
 * Pure module with no Firebase / fetch / DOM dependencies, so it can be
 * unit-tested in a node environment and imported from both the client
 * service and the server route guards.
 */

export function assertNonEmptyDraft(text: unknown): asserts text is string {
  if (typeof text !== 'string' || text.trim().length === 0) {
    throw new Error('A non-empty user draft is required.');
  }
}
