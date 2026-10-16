/* Single source of truth for timing (seconds). Read by assets/js/film.js (picture) and by
   tools/score.py (music), so the score is written to the picture rather than the other way round.
   60 BPM: one beat per second, so every scene boundary is also a beat. */
window.CUES = {
  "duration": 56,
  "bpm": 60,
  "scenes": {
    "open":   [0, 8],
    "logo":   [8, 14],
    "ask":    [14, 28],
    "review": [28, 40],
    "draft":  [40, 48],
    "end":    [48, 56]
  },
  "open":   { "l1": 0.8, "l2": 1.5, "l3": 3.8, "out": 6.9 },
  "logo":   { "in": 8.0, "swirl": 8.5, "tag": 9.2, "out": 13.2 },
  "ask":    { "head": 14.4, "panel": 16.0, "type": [16.6, 19.4], "send": 19.8, "answer": 20.4, "cite": 21.6, "out": 27.0 },
  "review": { "head": 28.4, "page": 29.0, "mark": 30.6, "note": 31.2, "fix": 34.6, "out": 39.2 },
  "draft":  { "head": 40.4, "page": 40.9, "ink": [41.4, 45.2], "out": 47.0 },
  "end":    { "logo": 48.0, "tag": 49.6, "url": 50.6, "foot": 51.4 }
};
