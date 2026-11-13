import { describe, expect, it } from 'vitest';
import { DUR, makeAudioSamples, sampleAudio, timeline } from './timeline';

describe('the motion clock', () => {
  it('supports arbitrary seek order without history', () => {
    const expected = timeline(6.7);
    [14, 0, 11, 2.2, 6.7].forEach(timeline);
    expect(timeline(6.7)).toEqual(expected);
    expect(timeline(-5).time).toBe(0);
    expect(timeline(50).time).toBe(DUR);
    expect(timeline(Number.NaN).time).toBe(0);
  });
  it('keeps the parcel continuous across all three spaces', () => {
    for (const boundary of [4.5, 9.5]) {
      const before = timeline(boundary - 0.00001);
      const after = timeline(boundary);
      expect(Math.hypot(before.parcelX - after.parcelX, before.parcelY - after.parcelY)).toBeLessThan(0.01);
      expect(Math.abs(before.parcelRotation - after.parcelRotation)).toBeLessThan(0.01);
    }
  });
  it('synthesizes bounded, repeatable sound and silent boundaries', () => {
    const samples = makeAudioSamples(8000);
    expect(samples.length).toBe(DUR * 8000);
    expect(samples.every(value => Number.isFinite(value) && Math.abs(value) < 0.95)).toBe(true);
    expect(samples.some(value => Math.abs(value) > 0.05)).toBe(true);
    expect(sampleAudio(-1)).toBe(0);
    expect(sampleAudio(DUR)).toBe(0);
    expect(sampleAudio(5.52)).toBe(sampleAudio(5.52));
  });
});
