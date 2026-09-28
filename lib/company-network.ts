import networkJson from "../data/company-network.json";
import { globeConfig } from "./visual-config";

export type NetworkPosition = { x: number; y: number };

export type CompanyNode = {
  id: string;
  ticker: string;
  name: string;
  type: "company" | "factor";
  description: string;
  icon: string;
  diameter: number;
  mobileDiameter: number;
  position: NetworkPosition;
  mobilePosition: NetworkPosition;
};

export type CompanyConnection = {
  id: string;
  source: string;
  target: string;
};

export type CompanyNetwork = {
  primaryNodeId: string;
  lineGap: number;
  interactionIcon: string;
  nodes: CompanyNode[];
  connections: CompanyConnection[];
};

function validateNetwork(data: CompanyNetwork) {
  const ids = new Set(data.nodes.map(node => node.id));
  if (ids.size !== data.nodes.length || !ids.has(data.primaryNodeId)) {
    throw new Error("company-network.json must have unique node IDs and a valid primaryNodeId.");
  }
  if (data.lineGap < 0) throw new Error("company-network.json lineGap must be zero or greater.");
  if (!data.interactionIcon) throw new Error("company-network.json must define an interactionIcon.");
  for (const node of data.nodes) {
    const positions = [node.position, node.mobilePosition];
    if (!node.ticker || !node.name || !node.description || !node.icon || node.diameter <= 0 || node.mobileDiameter <= 0
      || positions.some(position => position.x < 0 || position.x > 1 || position.y < 0 || position.y > 1)) {
      throw new Error(`Invalid company network node: ${node.id}`);
    }
  }
  const connectionIds = new Set(data.connections.map(connection => connection.id));
  if (connectionIds.size !== data.connections.length) {
    throw new Error("company-network.json connection IDs must be unique.");
  }
  for (const connection of data.connections) {
    if (!ids.has(connection.source) || !ids.has(connection.target) || connection.source === connection.target) {
      throw new Error(`Invalid company network connection: ${connection.id}`);
    }
  }
  return data;
}

export const companyNetwork = validateNetwork(networkJson as CompanyNetwork);
export const primaryCompany = companyNetwork.nodes.find(node => node.id === companyNetwork.primaryNodeId)!;

export type NetworkViewportLayout = {
  mobile: boolean;
  scale: number;
  primaryDiameter: number;
  focusY: number;
  span: number;
};

export type NetworkNodeLayout = NetworkPosition & { diameter: number };

export function createNetworkViewportLayout(width: number, height: number, headerHeight: number): NetworkViewportLayout {
  const mobile = width <= globeConfig.mobile.breakpoint;
  if (!mobile) {
    return {
      mobile,
      scale: 1,
      primaryDiameter: primaryCompany.diameter,
      focusY: height * (0.5 - globeConfig.network.desktopLiftViewportHeight),
      span: height,
    };
  }
  const scale = Math.max(0.82, Math.min(1.25, width / 390, height / 667));
  const primaryRadius = primaryCompany.mobileDiameter * scale / 2;
  const focusY = Math.max(
    headerHeight + primaryRadius + globeConfig.network.mobileHeaderGap,
    Math.min(height * globeConfig.network.mobileFocusViewportHeight, headerHeight + globeConfig.network.mobileFocusMaxFromHeader),
  );
  const bottom = Math.min(
    height - globeConfig.network.mobileBottomReserve,
    focusY + globeConfig.network.mobileMaxSpan,
  );
  return { mobile, scale, primaryDiameter: primaryCompany.mobileDiameter * scale, focusY, span: Math.max(1, bottom - focusY) };
}

export function getNetworkNodeLayout(
  node: CompanyNode,
  width: number,
  height: number,
  viewport: NetworkViewportLayout,
): NetworkNodeLayout {
  if (viewport.mobile) {
    return {
      x: node.mobilePosition.x * width,
      y: viewport.focusY + node.mobilePosition.y * viewport.span,
      diameter: node.mobileDiameter * viewport.scale,
    };
  }
  return {
    x: node.position.x * width,
    y: node.position.y * height - height * globeConfig.network.desktopLiftViewportHeight,
    diameter: node.diameter,
  };
}

export function trimConnection(
  source: { x: number; y: number; radius: number },
  target: { x: number; y: number; radius: number },
  gap: number,
) {
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const distance = Math.hypot(dx, dy) || 1;
  const unitX = dx / distance;
  const unitY = dy / distance;
  return {
    x1: source.x + unitX * (source.radius + gap),
    y1: source.y + unitY * (source.radius + gap),
    x2: target.x - unitX * (target.radius + gap),
    y2: target.y - unitY * (target.radius + gap),
  };
}

export function placeTooltip(clientX: number, clientY: number, viewportWidth: number, viewportHeight: number) {
  const margin = 16;
  const offset = 18;
  const width = Math.min(320, Math.max(0, viewportWidth - margin * 2));
  const estimatedHeight = 170;
  const right = clientX + offset;
  const left = right + width <= viewportWidth - margin ? right : clientX - width - offset;
  return {
    x: Math.max(margin, Math.min(left, viewportWidth - width - margin)),
    y: Math.max(margin, Math.min(clientY + offset, viewportHeight - estimatedHeight - margin)),
    width,
  };
}
