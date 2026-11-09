/**
 * Pure calculation logic for Reading Room ("আমাদের স্টাডি রুম")
 */

export function formatBanglaNumber(n: number | string): string {
  return Number(n || 0).toLocaleString("bn-BD");
}

export function formatHoursMinutes(m: number): string {
  const mins = Math.max(0, m || 0);
  const hours = Math.floor(mins / 60);
  const remMinutes = mins % 60;
  return (hours ? `${formatBanglaNumber(hours)}ঘ ` : "") + `${formatBanglaNumber(remMinutes)}মি`;
}

/**
 * Points calculation formula:
 * (completed_tasks * 10 + Math.floor(minutes / 15) * 10) * multiplier
 */
export function calculatePoints(tasksCount: number, studyMinutes: number, multiplier = 1): number {
  const k = Math.max(0, tasksCount || 0);
  const m = Math.max(0, studyMinutes || 0);
  const mult = multiplier || 1;
  return Math.round((k * 10 + Math.floor(m / 15) * 10) * mult);
}

/**
 * Joint winner or member win calculation:
 * Score = 50% study time proportion + 50% task completion rate
 */
export function calculateLeaderboardScore(
  myMinutes: number,
  partnerMinutes: number,
  myTasksCompleted: number,
  myTasksTotal: number
): { score: number; isJointWinner: boolean } {
  const totalMinutes = myMinutes + partnerMinutes;
  const timeRatio = totalMinutes > 0 ? (myMinutes / totalMinutes) * 100 : 0;
  const taskRatio = myTasksTotal > 0 ? (myTasksCompleted / myTasksTotal) * 100 : 0;
  const score = Math.round(timeRatio / 2 + taskRatio / 2);
  const isJointWinner = Math.abs(myMinutes - partnerMinutes) <= 5;
  return { score, isJointWinner };
}

/**
 * Precise remaining session time calculation in milliseconds
 */
export interface StudySession {
  t: number;      // start timestamp (ms)
  d: number;      // planned duration in minutes
  pz?: number;    // total paused time in ms
  ps?: number;    // timestamp when paused
}

export function calculateRemainingTime(session: StudySession | null | undefined, now: number): number {
  if (!session || !session.t) return 0;
  const elapsed = session.ps 
    ? (session.ps - session.t - (session.pz || 0)) 
    : (now - session.t - (session.pz || 0));
  const totalDurationMs = (session.d || 180) * 60000;
  return Math.max(0, totalDurationMs - elapsed);
}

export function isSessionActive(session: StudySession | null | undefined, now: number): boolean {
  return calculateRemainingTime(session, now) > 0;
}
