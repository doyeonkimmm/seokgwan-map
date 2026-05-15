// ============================================================
// schoolGraph.ts
// 학교 복도 그래프 데이터 + Dijkstra 길찾기 로직
// ============================================================

export type Floor = 1 | 2 | 3 | 4;

export interface Node {
  id: string;       // e.g. "1_Stairs_L"
  name: string;
  x: number;
  y: number;
  floor: Floor;
  type: "room" | "stairs" | "cafeteria";
}

export interface Edge {
  from: string;
  to: string;
  weight: number;   // 유클리드 거리
}

export interface PathResult {
  path: string[];         // node id 순서
  totalDistance: number;
  floorChanges: FloorChange[];
}

export interface FloorChange {
  stairNodeId: string;
  stairName: string;
  fromFloor: Floor;
  toFloor: Floor;
}

// ============================================================
// 1. 노드 정의
// ============================================================

const RAW_NODES: Omit<Node, "id">[] = [];

function makeNodes(floor: Floor, defs: Omit<Node, "id" | "floor">[]): Node[] {
  return defs.map((d) => ({ ...d, id: `${floor}_${d.name}`, floor }));
}

// 각 층 노드를 id로 참조하기 쉽게 key 함수
function nid(floor: Floor, key: string) {
  return `${floor}__${key}`;
}

// 노드 목록 (floor, key, name, x, y, type)
type RawNode = { key: string; name: string; x: number; y: number; type: Node["type"] };

const FLOOR_NODES: Record<Floor, RawNode[]> = {
  1: [
    { key: "TL",  name: "화장실(여,남)",  x: 0.0,  y: 0.0,  type: "room" },
    { key: "SL",  name: "계단(좌)",        x: 8.5,  y: 0.0,  type: "stairs" },
    { key: "SL2", name: "계단(2층행)",     x: 25.5, y: 0.0,  type: "stairs" },
    { key: "LIB", name: "도서실",          x: 34.0, y: 0.0,  type: "room" },
    { key: "HLT", name: "보건실",          x: 51.0, y: 0.0,  type: "room" },
    { key: "TR",  name: "화장실(여)",      x: 68.0, y: 0.0,  type: "room" },
    { key: "SR",  name: "계단(우)",        x: 68.0, y: 10.0, type: "stairs" },
    { key: "BIO", name: "물리실",          x: 3.5,  y: 38.4, type: "room" },
    { key: "TT",  name: "화장실(상)",      x: 17.3, y: 38.4, type: "room" },
    { key: "T27", name: "2-7반",           x: 25.7, y: 38.4, type: "room" },
    { key: "T28", name: "2-8반",           x: 34.1, y: 38.4, type: "room" },
    { key: "T39", name: "3-9반",           x: 42.5, y: 38.4, type: "room" },
    { key: "SU",  name: "계단(상)",        x: 59.5, y: 38.4, type: "stairs" },
    { key: "L30", name: "과학준비실",      x: 3.5,  y: 30.0, type: "room" },
    { key: "L22", name: "개별학습실",      x: 3.5,  y: 21.6, type: "room" },
    { key: "SEX", name: "계단(상단좌)",   x: 17.3, y: 45.6, type: "stairs" },
    // 우측 줄기 중간 가상 노드 (계단(우) 분기점)
    { key: "JR",  name: "_junction_right", x: 59.5, y: 10.0, type: "room" },
  ],
  2: [
    { key: "TL",  name: "화장실(여,남)",   x: 0.0,  y: 0.0,  type: "room" },
    { key: "SL",  name: "계단(좌·전층)",  x: 8.5,  y: 0.0,  type: "stairs" },
    { key: "SL2", name: "계단(1층행)",     x: 25.5, y: 0.0,  type: "stairs" },
    { key: "R38", name: "3-8반",           x: 34.0, y: 0.0,  type: "room" },
    { key: "R37", name: "3-7반",           x: 42.0, y: 0.0,  type: "room" },
    { key: "R36", name: "3-6반",           x: 51.0, y: 0.0,  type: "room" },
    { key: "R35", name: "3-5반",           x: 59.5, y: 0.0,  type: "room" },
    { key: "TR",  name: "화장실(남)",      x: 68.0, y: 0.0,  type: "room" },
    { key: "SR",  name: "계단(우)",        x: 68.0, y: 10.0, type: "stairs" },
    { key: "CHM", name: "화학실",          x: 3.5,  y: 38.4, type: "room" },
    { key: "TT",  name: "화장실 남/여",    x: 17.3, y: 38.4, type: "room" },
    { key: "T26", name: "2-6반",           x: 25.7, y: 38.4, type: "room" },
    { key: "T25", name: "2-5반",           x: 34.1, y: 38.4, type: "room" },
    { key: "T24", name: "2-4반",           x: 42.5, y: 38.4, type: "room" },
    { key: "SU",  name: "계단(상)",        x: 59.5, y: 38.4, type: "stairs" },
    { key: "L30", name: "과학정보부",      x: 3.5,  y: 30.0, type: "room" },
    { key: "L22", name: "1-7반",           x: 3.5,  y: 21.6, type: "room" },
    { key: "L13", name: "1-6반",           x: 3.5,  y: 13.2, type: "room" },
    { key: "R30", name: "2학년 홈베이스",  x: 59.5, y: 30.0, type: "room" },
    { key: "R22", name: "진학정보실",      x: 59.5, y: 21.6, type: "room" },
    { key: "R13", name: "3학년부",         x: 59.5, y: 13.2, type: "room" },
    { key: "CAF", name: "급식실",          x: 34.1, y: 48.0, type: "cafeteria" },
    { key: "SEX", name: "계단(상단좌)",   x: 17.3, y: 45.6, type: "stairs" },
    { key: "JR",  name: "_junction_right", x: 59.5, y: 10.0, type: "room" },
  ],
  3: [
    { key: "TL",  name: "화장실(여,남)",   x: 0.0,  y: 0.0,  type: "room" },
    { key: "SL",  name: "계단(좌)",         x: 8.5,  y: 0.0,  type: "stairs" },
    { key: "CP",  name: "컴퓨터실",        x: 17.0, y: 0.0,  type: "room" },
    { key: "AI",  name: "AI실",            x: 25.5, y: 0.0,  type: "room" },
    { key: "B31", name: "3-1반",           x: 34.0, y: 0.0,  type: "room" },
    { key: "B32", name: "3-2반",           x: 42.0, y: 0.0,  type: "room" },
    { key: "B33", name: "3-3반",           x: 51.0, y: 0.0,  type: "room" },
    { key: "B34", name: "3-4반",           x: 59.5, y: 0.0,  type: "room" },
    { key: "TR",  name: "화장실(여)",      x: 68.0, y: 0.0,  type: "room" },
    { key: "SR",  name: "계단(우)",        x: 68.0, y: 10.0, type: "stairs" },
    { key: "BIO", name: "생물실",          x: 3.5,  y: 38.4, type: "room" },
    { key: "TT",  name: "화장실(상)",      x: 17.3, y: 38.4, type: "room" },
    { key: "T21", name: "2-1반",           x: 25.7, y: 38.4, type: "room" },
    { key: "T22", name: "2-2반",           x: 34.1, y: 38.4, type: "room" },
    { key: "T23", name: "2-3반",           x: 42.5, y: 38.4, type: "room" },
    { key: "SU",  name: "계단(상)",        x: 59.5, y: 38.4, type: "stairs" },
    { key: "L30", name: "1-4반",           x: 3.5,  y: 30.0, type: "room" },
    { key: "L22", name: "1-5반",           x: 3.5,  y: 21.6, type: "room" },
    { key: "L13", name: "1-6반",           x: 3.5,  y: 13.2, type: "room" },
    { key: "R30", name: "모둠학습실",      x: 59.5, y: 30.0, type: "room" },
    { key: "R22", name: "3학년 홈베이스",  x: 59.5, y: 21.6, type: "room" },
    { key: "CAF", name: "급식실",          x: 34.1, y: 48.0, type: "cafeteria" },
    { key: "SEX", name: "계단(상단좌)",   x: 17.3, y: 45.6, type: "stairs" },
    { key: "JR",  name: "_junction_right", x: 59.5, y: 10.0, type: "room" },
  ],
  4: [
    { key: "TL",  name: "화장실(여,남)",   x: 0.0,  y: 0.0,  type: "room" },
    { key: "SL",  name: "계단(좌)",         x: 8.5,  y: 0.0,  type: "stairs" },
    { key: "GH",  name: "설렘온실",         x: 17.0, y: 0.0,  type: "room" },
    { key: "G12", name: "1,2학년부",        x: 25.5, y: 0.0,  type: "room" },
    { key: "CR",  name: "창의체험교육부",   x: 34.0, y: 0.0,  type: "room" },
    { key: "ST",  name: "학생회실",         x: 42.0, y: 0.0,  type: "room" },
    { key: "A2",  name: "미술실2",           x: 51.0, y: 0.0,  type: "room" },
    { key: "A1",  name: "미술실1",           x: 59.5, y: 0.0,  type: "room" },
    { key: "AST", name: "미술비품실",        x: 68.0, y: 0.0,  type: "room" },
    { key: "SR",  name: "계단(우)",          x: 68.0, y: 10.0, type: "stairs" },
    { key: "ES",  name: "지구과학실",        x: 3.5,  y: 38.4, type: "room" },
    { key: "TT",  name: "화장실(상)",        x: 17.3, y: 38.4, type: "room" },
    { key: "LE",  name: "생활교육부",        x: 25.7, y: 38.4, type: "room" },
    { key: "MU",  name: "다목적실",          x: 34.1, y: 38.4, type: "room" },
    { key: "SU",  name: "계단(상)",          x: 59.5, y: 38.4, type: "stairs" },
    { key: "L30", name: "1-3반",             x: 3.5,  y: 30.0, type: "room" },
    { key: "L22", name: "1-2반",             x: 3.5,  y: 21.6, type: "room" },
    { key: "L13", name: "1-1반",             x: 3.5,  y: 13.2, type: "room" },
    { key: "R30", name: "음악실",            x: 59.5, y: 30.0, type: "room" },
    { key: "R22", name: "음악준비실",        x: 59.5, y: 21.6, type: "room" },
    { key: "R13", name: "음악합주실",        x: 59.5, y: 13.2, type: "room" },
    { key: "SEX", name: "계단(상단좌)",     x: 17.3, y: 45.6, type: "stairs" },
    { key: "JR",  name: "_junction_right",   x: 59.5, y: 10.0, type: "room" },
  ],
};

// ============================================================
// 2. 층내 간선 정의 (양방향)
// ============================================================
// [key_A, key_B] — 가중치는 자동으로 유클리드 거리 계산

type EdgeDef = [string, string];

const FLOOR_EDGES: Record<Floor, EdgeDef[]> = {
  1: [
    ["TL","SL"],
    // SL ~ SL2 야외 — 이동 불가이므로 간선 없음
    ["SL2","LIB"], ["LIB","HLT"], ["HLT","TR"],
    // 우측 줄기: TR(68,0)→JR(59.5,10) 경로상 가상노드 활용
    // 실제로는 TR(68,0) - 직선거리로 JR(59.5,10) 연결
    ["TR","JR"], ["JR","SR"],   // SR = 계단(우)(68,10) → JR에서 가지
    ["JR","SU"],                // 줄기 아래로
    ["TL","L22"], ["L22","L30"], ["L30","BIO"],
    ["BIO","TT"], ["TT","T27"], ["T27","T28"], ["T28","T39"], ["T39","SU"],
    ["TT","SEX"],
  ],
  2: [
    ["TL","SL"],
    // SL ~ SL2 막힘 — 간선 없음
    ["SL2","R38"], ["R38","R37"], ["R37","R36"], ["R36","R35"], ["R35","TR"],
    ["TR","JR"], ["JR","SR"],
    ["JR","R13"], ["R13","R22"], ["R22","R30"], ["R30","SU"],
    ["TL","L13"], ["L13","L22"], ["L22","L30"], ["L30","CHM"],
    ["CHM","TT"], ["TT","T26"], ["T26","T25"], ["T25","T24"], ["T24","SU"],
    ["TT","SEX"],
    ["T25","CAF"], ["SEX","CAF"],
  ],
  3: [
    ["TL","SL"], ["SL","CP"], ["CP","AI"], ["AI","B31"],
    ["B31","B32"], ["B32","B33"], ["B33","B34"], ["B34","TR"],
    ["TR","JR"], ["JR","SR"],
    ["JR","R22"], ["R22","R30"], ["R30","SU"],
    ["TL","L13"], ["L13","L22"], ["L22","L30"], ["L30","BIO"],
    ["BIO","TT"], ["TT","T21"], ["T21","T22"], ["T22","T23"], ["T23","SU"],
    ["TT","SEX"],
    ["T22","CAF"], ["SEX","CAF"],
  ],
  4: [
    ["TL","SL"], ["SL","GH"], ["GH","G12"], ["G12","CR"],
    ["CR","ST"], ["ST","A2"], ["A2","A1"], ["A1","AST"],
    ["AST","JR"], ["JR","SR"],   // AST(68,0)→JR(59.5,10)
    ["JR","R13"], ["R13","R22"], ["R22","R30"], ["R30","SU"],
    ["TL","L13"], ["L13","L22"], ["L22","L30"], ["L30","ES"],
    ["ES","TT"], ["TT","LE"], ["LE","MU"], ["MU","SU"],
    ["TT","SEX"],
  ],
};

// ============================================================
// 3. 층간 계단 연결
// 같은 key의 계단 노드들을 층간으로 연결
// ============================================================

// 계단별 연결 가능 층 목록
const STAIR_CONNECTIONS: { key: string; floors: Floor[] }[] = [
  { key: "SL",  floors: [1, 2, 3, 4] },   // 계단(좌) 전층
  { key: "SL2", floors: [1, 2] },          // 계단(2층행/1층행) 1↔2만
  { key: "SU",  floors: [1, 2, 3, 4] },   // 계단(상) 전층
  { key: "SR",  floors: [1, 2, 3, 4] },   // 계단(우) 전층
  { key: "SEX", floors: [1, 2, 3, 4] },   // 계단(상단좌) 전층
];

// 층간 이동 가중치 (층 하나 오르내리기 = 복도 평균 이동 거리 상수)
const FLOOR_CHANGE_WEIGHT = 20;

// ============================================================
// 4. 그래프 빌드
// ============================================================

export function buildGraph(): {
  nodes: Map<string, Node>;
  adjacency: Map<string, { to: string; weight: number }[]>;
} {
  const nodes = new Map<string, Node>();
  const adjacency = new Map<string, { to: string; weight: number }[]>();

  // 노드 등록
  (Object.entries(FLOOR_NODES) as [string, RawNode[]][]).forEach(([floorStr, defs]) => {
    const floor = Number(floorStr) as Floor;
    defs.forEach((d) => {
      const id = nid(floor, d.key);
      nodes.set(id, { id, name: d.name, x: d.x, y: d.y, floor, type: d.type });
      adjacency.set(id, []);
    });
  });

  // 거리 계산
  function dist(a: Node, b: Node) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
  }

  function addEdge(idA: string, idB: string, weight?: number) {
    const na = nodes.get(idA), nb = nodes.get(idB);
    if (!na || !nb) return;
    const w = weight ?? dist(na, nb);
    adjacency.get(idA)!.push({ to: idB, weight: w });
    adjacency.get(idB)!.push({ to: idA, weight: w });
  }

  // 층내 간선
  (Object.entries(FLOOR_EDGES) as [string, EdgeDef[]][]).forEach(([floorStr, edges]) => {
    const floor = Number(floorStr) as Floor;
    edges.forEach(([kA, kB]) => {
      addEdge(nid(floor, kA), nid(floor, kB));
    });
  });

  // 층간 계단 연결
  STAIR_CONNECTIONS.forEach(({ key, floors }) => {
    for (let i = 0; i < floors.length - 1; i++) {
      const idA = nid(floors[i], key);
      const idB = nid(floors[i + 1], key);
      addEdge(idA, idB, FLOOR_CHANGE_WEIGHT);
    }
  });

  return { nodes, adjacency };
}

// ============================================================
// 5. Dijkstra
// ============================================================

export function dijkstra(
  startId: string,
  endId: string,
  nodes: Map<string, Node>,
  adjacency: Map<string, { to: string; weight: number }[]>
): PathResult | null {
  const dist = new Map<string, number>();
  const prev = new Map<string, string | null>();
  const visited = new Set<string>();

  // 우선순위 큐 (간단한 min-heap 구현)
  const pq: { id: string; dist: number }[] = [];

  nodes.forEach((_, id) => {
    dist.set(id, Infinity);
    prev.set(id, null);
  });
  dist.set(startId, 0);
  pq.push({ id: startId, dist: 0 });

  function pqPop() {
    let minIdx = 0;
    for (let i = 1; i < pq.length; i++) {
      if (pq[i].dist < pq[minIdx].dist) minIdx = i;
    }
    return pq.splice(minIdx, 1)[0];
  }

  while (pq.length > 0) {
    const { id: u } = pqPop();
    if (visited.has(u)) continue;
    visited.add(u);
    if (u === endId) break;

    const neighbors = adjacency.get(u) ?? [];
    for (const { to: v, weight } of neighbors) {
      if (visited.has(v)) continue;
      const newDist = dist.get(u)! + weight;
      if (newDist < dist.get(v)!) {
        dist.set(v, newDist);
        prev.set(v, u);
        pq.push({ id: v, dist: newDist });
      }
    }
  }

  // 경로 복원
  if (dist.get(endId) === Infinity) return null;

  const path: string[] = [];
  let cur: string | null = endId;
  while (cur !== null) {
    path.unshift(cur);
    cur = prev.get(cur) ?? null;
  }

  // 층 변경 감지
  const floorChanges: FloorChange[] = [];
  for (let i = 0; i < path.length - 1; i++) {
    const na = nodes.get(path[i])!;
    const nb = nodes.get(path[i + 1])!;
    if (na.floor !== nb.floor) {
      floorChanges.push({
        stairNodeId: path[i],
        stairName: na.name,
        fromFloor: na.floor,
        toFloor: nb.floor,
      });
    }
  }

  return {
    path,
    totalDistance: dist.get(endId)!,
    floorChanges,
  };
}

// ============================================================
// 6. 편의 함수 — 이름으로 노드 검색
// ============================================================
export function findNodeByName(name: string): Node[] {
  const { nodes } = getGraph()
  const results: Node[] = []
  nodes.forEach((node) => {
    if (node.name.includes(name) && !node.name.startsWith('_')) results.push(node)
  })
  return results
}

export function findNodeById(
  floor: Floor,
  key: string,
  nodes: Map<string, Node>
): Node | undefined {
  return nodes.get(nid(floor, key));
}

// ============================================================
// 7. 경로 → 사람이 읽을 수 있는 안내문 생성
// ============================================================

export function generateDirections(result: PathResult): string[] {
  const { nodes } = getGraph()
  const steps: string[] = []
  const { path } = result
  if (path.length < 2) return ['목적지가 출발지와 같습니다.']

  const startNode = nodes.get(path[0])!
  steps.push(`${startNode.floor}층 [${startNode.name}]에서 출발합니다.`)

  for (let i = 0; i < path.length - 1; i++) {
    const cur = nodes.get(path[i])!
    const next = nodes.get(path[i + 1])!
    if (next.name.startsWith('_')) continue
    if (cur.floor !== next.floor) {
      const dir = next.floor > cur.floor ? '올라가' : '내려가'
      steps.push(`[${cur.name}] 계단을 통해 ${next.floor}층으로 ${dir}세요.`)
      continue
    }
    const dx = next.x - cur.x, dy = next.y - cur.y
    const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? '오른쪽' : '왼쪽') : (dy > 0 ? '위쪽' : '아래쪽')
    steps.push(`${dir}으로 이동 → [${next.name}]`)
  }

  const endNode = nodes.get(path[path.length - 1])!
  steps.push(`🏁 [${endNode.name}] (${endNode.floor}층) 도착!`)
  return steps
}

let _cache: ReturnType<typeof buildGraph> | null = null
export function getGraph() {
  if (!_cache) _cache = buildGraph()
  return _cache
}
export function findPath(startId: string, endId: string): PathResult | null {
  const { nodes, adjacency } = getGraph();
  return dijkstra(startId, endId, nodes, adjacency);
}

/**
 * 노드 id 생성 헬퍼 (컴포넌트에서 사용)
 * 예: nodeId(2, "CHM") → "2__CHM"
 */
export function nodeId(floor: Floor, key: string): string {
  return nid(floor, key);
}
