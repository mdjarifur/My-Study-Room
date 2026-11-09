import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatBanglaNumber,
  formatHoursMinutes,
  calculatePoints,
  calculateLeaderboardScore,
  calculateRemainingTime,
  isSessionActive,
} from './readingRoomLogic.ts';

test('formatBanglaNumber formats numbers to Bengali digits', () => {
  assert.equal(formatBanglaNumber(5), '৫');
  assert.equal(formatBanglaNumber(10), '১০');
});

test('formatHoursMinutes formats minutes into Bengali hours and minutes', () => {
  assert.equal(formatHoursMinutes(45), '৪৫মি');
  assert.equal(formatHoursMinutes(75), '১ঘ ১৫মি');
  assert.equal(formatHoursMinutes(120), '২ঘ ০মি');
});

test('calculatePoints correctly scores tasks and study durations', () => {
  // 3 tasks = 30 pts, 45 mins = floor(45/15)*10 = 30 pts => total 60 pts
  assert.equal(calculatePoints(3, 45, 1), 60);

  // Single room 1.5x multiplier
  assert.equal(calculatePoints(3, 45, 1.5), 90);
});

test('calculateLeaderboardScore calculates 50/50 time and tasks ratio', () => {
  // 60m vs 60m (50% time) + 2/2 tasks (50% tasks) => 50/2 + 100/2 = 75 score
  const result = calculateLeaderboardScore(60, 60, 2, 2);
  assert.equal(result.score, 75);
  assert.equal(result.isJointWinner, true); // diff is 0 <= 5 mins

  // 120m vs 30m
  const winResult = calculateLeaderboardScore(120, 30, 4, 4);
  assert.equal(winResult.isJointWinner, false); // diff is 90 mins
  assert.ok(winResult.score > 70);
});

test('calculateRemainingTime computes active and paused study timer', () => {
  const start = 1000000;
  const durationMinutes = 25; // 25 * 60,000 = 1,500,000 ms

  // 10 minutes elapsed
  const now = start + 10 * 60000;
  const rem = calculateRemainingTime({ t: start, d: durationMinutes }, now);
  assert.equal(rem, 15 * 60000); // 15 mins left
  assert.equal(isSessionActive({ t: start, d: durationMinutes }, now), true);

  // Session completed
  const futureNow = start + 30 * 60000;
  assert.equal(calculateRemainingTime({ t: start, d: durationMinutes }, futureNow), 0);
  assert.equal(isSessionActive({ t: start, d: durationMinutes }, futureNow), false);
});
