/**
 * Product-level promises for the relationship engine.
 *
 * The database migration enforces the limits that protect member pacing. This
 * shared object keeps the same language available to server and admin UI code
 * without turning care rules into hidden marketing heuristics.
 */
export const RELATIONSHIP_GUARDRAILS = Object.freeze({
  maxActiveJourneysPerMember: 2,
  maxAutomatedMessagesPerRollingWeek: 3,
  maxMilestonesPerJourney: 7,
  mandatoryQuietPeriodHours: 24,
  noSellingInFirstMilestones: 3,
  supportKeywordsPauseJourney: ["urgent", "help", "struggle", "emergency"],
})
