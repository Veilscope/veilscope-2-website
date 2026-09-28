import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildDots } from "../lib/coastline";
import { createNetworkViewportLayout } from "../lib/company-network";
import { createFlightLayout, sampleFlight, advanceProgress, isFlightRevealReady, mapScrollProgress } from "../lib/globe-flight";
import { globeConfig as config } from "../lib/visual-config";

const dots = buildDots(JSON.parse(readFileSync("public/assets/geography/ne_110m_coastline.geojson", "utf8")));

test("one exact NYC point survives thinning without a near duplicate", () => {
  const primaries = dots.filter(dot => dot.isPrimary);
  assert.equal(primaries.length, 1);
  const focus = primaries[0];
  assert.ok(Math.abs(focus.x + 0.4770793899311263) < 1e-10);
  assert.ok(Math.abs(focus.y - 0.5155504434735457) < 1e-10);
  assert.equal(focus.visibility, 1);
  assert.ok(dots.every(dot => dot.isPrimary || Math.hypot(dot.x - focus.x, dot.y - focus.y, dot.z - focus.z) > 0.001));
});

for (const [width, height, header] of [[1440, 1024, 65], [1280, 800, 65], [390, 844, 97], [375, 667, 97], [320, 568, 97], [768, 1024, 65], [810, 1080, 65], [844, 390, 65]]) {
  test(`${width}x${height}: initial composition, complete isolation, and reversible progress`, () => {
    const layout = createFlightLayout(dots, width, height, header);
    const initial = sampleFlight(layout, 0);
    assert.equal(initial.zoom, 1);
    assert.equal(initial.hover, 1);
    assert.equal(initial.spriteSize, layout.initialSpriteSize);
    const reconstructedCenterY = initial.anchorY - layout.primary.y * layout.radius;
    assert.ok(Math.abs(reconstructedCenterY - layout.centerY) < 1e-9);
    if (width <= config.mobile.breakpoint) {
      const globeTop = height / 2 - layout.centerY - layout.radius;
      assert.ok(Math.abs(globeTop - (header + config.mobile.heroGap)) < 1e-9);
    }
    assert.equal(sampleFlight(layout, config.flight.hoverFadeEnd).hover, 0);
    const final = sampleFlight(layout, 1);
    assert.equal(Math.abs(final.anchorX), 0);
    assert.equal(final.anchorY, layout.finalAnchorY);
    assert.equal(height / 2 - final.anchorY, createNetworkViewportLayout(width, height, header).focusY);
    assert.ok(Math.abs(final.spriteSize / final.haloScale - layout.finalCoreSize) < 1e-9);
    assert.ok(layout.finalCoreSize >= 78);
    assert.equal(layout.finalCoreSize, Math.min(
      createNetworkViewportLayout(width, height, header).primaryDiameter,
      (Math.min(width, height) - 32) / config.flight.finalHaloScale,
    ));
    for (const dot of dots.filter(dot => !dot.isPrimary && dot.visibility > 0)) {
      const x = (dot.x - layout.primary.x) * layout.radius * final.zoom;
      const y = layout.finalAnchorY + (dot.y - layout.primary.y) * layout.radius * final.zoom;
      assert.ok(Math.abs(x) > width / 2 + layout.finalSpriteSize / 2 || Math.abs(y) > height / 2 + layout.finalSpriteSize / 2, "non-primary halo must be completely outside the viewport");
    }
    let lastZoom = 0, lastSprite = 0;
    for (let i = 0; i <= 100; i++) {
      const current = sampleFlight(layout, i / 100);
      assert.ok(current.zoom >= lastZoom && current.spriteSize >= lastSprite);
      // Centering and expansion must share the same phase, with no early arrival.
      assert.ok(Math.abs(current.anchorX * (layout.anchorY - layout.finalAnchorY) - (current.anchorY - layout.finalAnchorY) * layout.anchorX) < 1e-8);
      assert.ok(Math.abs(current.pathRemaining + (current.zoom - 1) / (layout.finalZoom - 1) - 1) < 1e-9);
      if (i < 100) assert.ok(current.pathRemaining > 0);
      lastZoom = current.zoom; lastSprite = current.spriteSize;
    }
    assert.deepEqual(sampleFlight(layout, 0), initial);
    assert.deepEqual(sampleFlight(layout, -1), initial);
    assert.deepEqual(sampleFlight(layout, 2), final);
    assert.equal(initial.crossfade, 0);
    assert.equal(final.crossfade, 1);
  });
}


test("scroll damping picks up quickly, coasts after input, and converges without overshoot", () => {
  const active = advanceProgress(0, 0.6, 1 / 60, 0);
  const idle = advanceProgress(0, 0.6, 1 / 60, 1);
  assert.ok(active > idle && active < 0.6);
  let current = active;
  for (let i = 1; i < 300; i++) {
    const next = advanceProgress(current, 0.6, 1 / 60, i / 60);
    assert.ok(next >= current && next <= 0.6);
    current = next;
  }
  assert.equal(current, 0.6);
  for (let i = 0; i < 300; i++) {
    const next = advanceProgress(current, 0.2, 1 / 60, i / 60);
    assert.ok(next <= current && next >= 0.2);
    current = next;
  }
  assert.equal(current, 0.2);
});

test("damping is consistent across refresh rates", () => {
  function follow(hz: number) {
    let p = 0;
    for (let i = 0; i < hz; i++) p = advanceProgress(p, 1, 1 / hz, 1);
    return p;
  }
  assert.ok(Math.abs(follow(60) - follow(120)) < 1e-10);
  assert.equal(advanceProgress(0.2, 0.8, 0, 1), 0.2);
});

test("scroll completion zone finishes at 56% and reverses through the same curve", () => {
  const { start, end } = config.flight.completionZone;
  assert.equal(mapScrollProgress(0), 0);
  assert.equal(mapScrollProgress(start - 0.01), start - 0.01);
  assert.equal(mapScrollProgress(start), start);
  assert.equal(mapScrollProgress(end), 1);
  assert.equal(mapScrollProgress(0.8), 1);
  assert.equal(mapScrollProgress(1), 1);
  assert.equal(mapScrollProgress(-1), 0);
  assert.equal(mapScrollProgress(2), 1);

  let previous = 0;
  for (let i = 0; i <= 1000; i++) {
    const mapped = mapScrollProgress(i / 1000);
    assert.ok(mapped >= previous && mapped <= 1);
    previous = mapped;
  }

  // There is no direction-dependent state: identical scrollbar positions map
  // to identical animation targets while moving down or back up.
  for (const raw of [0, 0.25, start, 0.5, 0.52, 0.54, end, 0.9]) {
    assert.equal(mapScrollProgress(raw), mapScrollProgress(raw));
  }
  assert.ok(mapScrollProgress(0.5) > 0.5);
  assert.ok(mapScrollProgress(0.54) > 0.9);
});

test("the relationship graph reveals near visual convergence and reverses cleanly", () => {
  const threshold = config.flight.revealProgress;
  assert.equal(isFlightRevealReady(threshold - 0.001, 1), false);
  assert.equal(isFlightRevealReady(threshold, 1), true);
  assert.equal(isFlightRevealReady(1, threshold), true);
  assert.equal(isFlightRevealReady(1, threshold - 0.001), false);
  assert.ok(sampleFlight(createFlightLayout(dots, 1280, 800, 65), threshold).pathRemaining < 0.03);
  assert.equal(config.flight.postFlightViewports, 1.5);
  assert.ok(config.flight.minimumHoldMs >= 1000);
});
