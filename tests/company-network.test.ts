import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { companyNetwork, createNetworkViewportLayout, getNetworkNodeLayout, placeTooltip, primaryCompany, trimConnection } from "../lib/company-network";

test("the editable network has a valid AAPL center and usable assets", () => {
  assert.equal(primaryCompany.ticker, "AAPL");
  assert.equal(primaryCompany.id, companyNetwork.primaryNodeId);
  assert.equal(new Set(companyNetwork.nodes.map(node => node.id)).size, companyNetwork.nodes.length);
  for (const node of companyNetwork.nodes) {
    assert.ok(node.description.length > 20, `${node.id} needs hover description copy`);
    assert.ok(existsSync(join(process.cwd(), "public", node.icon)), `${node.icon} does not exist`);
  }
  assert.ok(existsSync(join(process.cwd(), "public", companyNetwork.interactionIcon)));
});

test("connections are explicit and include an indirect relationship", () => {
  const ids = new Set(companyNetwork.nodes.map(node => node.id));
  for (const connection of companyNetwork.connections) {
    assert.ok(ids.has(connection.source));
    assert.ok(ids.has(connection.target));
    assert.notEqual(connection.source, connection.target);
  }
  assert.ok(companyNetwork.connections.some(connection =>
    connection.source !== companyNetwork.primaryNodeId && connection.target !== companyNetwork.primaryNodeId
  ));
});

test("connection endpoints leave the configured gap outside each circle", () => {
  const source = { x: 100, y: 100, radius: 50 };
  const target = { x: 400, y: 500, radius: 30 };
  const line = trimConnection(source, target, companyNetwork.lineGap);
  assert.ok(Math.abs(Math.hypot(line.x1 - source.x, line.y1 - source.y) - (source.radius + companyNetwork.lineGap)) < 0.0001);
  assert.ok(Math.abs(Math.hypot(line.x2 - target.x, line.y2 - target.y) - (target.radius + companyNetwork.lineGap)) < 0.0001);
});

test("hover descriptions remain next to the pointer and inside the viewport", () => {
  const bottomRight = placeTooltip(1275, 795, 1280, 800);
  assert.ok(bottomRight.x >= 16 && bottomRight.x + bottomRight.width <= 1264);
  assert.ok(bottomRight.y >= 16 && bottomRight.y <= 614);
  const topLeft = placeTooltip(0, 0, 390, 844);
  assert.equal(topLeft.x, 18);
  assert.equal(topLeft.y, 18);
});

for (const [width, height, headerHeight] of [[320, 568, 97], [375, 667, 97], [390, 844, 97], [768, 1024, 65], [810, 1080, 65]]) {
  test(`${width}x${height}: mobile hierarchy stays inside its safe region`, () => {
    const viewport = createNetworkViewportLayout(width, height, headerHeight);
    assert.equal(viewport.mobile, true);
    const layouts = new Map(companyNetwork.nodes.map(node => [node.id, getNetworkNodeLayout(node, width, height, viewport)]));
    assert.equal(layouts.get(companyNetwork.primaryNodeId)!.y, viewport.focusY);
    for (const [id, layout] of layouts) {
      const radius = layout.diameter / 2;
      assert.ok(layout.x - radius >= 0, `${id} crosses the left edge`);
      assert.ok(layout.x + radius <= width, `${id} crosses the right edge`);
      assert.ok(layout.y - radius >= headerHeight, `${id} overlaps the header`);
      assert.ok(layout.y + radius <= height - 88, `${id} enters the continuation area`);
    }
    for (const connection of companyNetwork.connections) {
      const source = layouts.get(connection.source)!;
      const target = layouts.get(connection.target)!;
      const line = trimConnection(
        { x: source.x, y: source.y, radius: source.diameter / 2 },
        { x: target.x, y: target.y, radius: target.diameter / 2 },
        companyNetwork.lineGap,
      );
      assert.ok(Math.abs(Math.hypot(line.x1 - source.x, line.y1 - source.y) - (source.diameter / 2 + companyNetwork.lineGap)) < 0.0001);
      assert.ok(Math.abs(Math.hypot(line.x2 - target.x, line.y2 - target.y) - (target.diameter / 2 + companyNetwork.lineGap)) < 0.0001);
      assert.ok(Math.hypot(line.x2 - line.x1, line.y2 - line.y1) >= 40, `${connection.id} needs a readable connector`);
    }
  });
}

test("the compact hierarchy hands off to desktop above 820px", () => {
  assert.equal(createNetworkViewportLayout(820, 900, 65).mobile, true);
  assert.equal(createNetworkViewportLayout(821, 900, 65).mobile, false);
});
