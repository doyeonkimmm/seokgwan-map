export type Floor = 1 | 2 | 3 | 4

export interface Node {
  id: string
  key: string
  name: string
  x: number
  y: number
  floor: Floor
  type: 'room' | 'stairs' | 'cafeteria' | 'elevator'
}

export interface PathResult {
  path: string[]
  totalDistance: number
  floorChanges: FloorChange[]
}

export interface FloorChange {
  nodeId: string
  nodeName: string
  fromFloor: Floor
  toFloor: Floor
  method: 'stairs' | 'elevator'
}

export interface PathOptions {
  travelMode?: TravelMode
}

export type TravelMode = 'both' | 'elevatorOnly' | 'stairsOnly'

type RawNode = { key: string; name: string; x: number; y: number; type: Node['type'] }
type EdgeDef = [string, string]

function nid(floor: Floor, key: string) {
  return `${floor}__${key}`
}

const FLOOR_NODES: Record<Floor, RawNode[]> = {
  1: [
    { key: 'TL', name: '화장실(왼쪽)', x: 4.25, y: 5.0, type: 'room' },
    { key: 'EV', name: '엘리베이터', x: 12.9, y: 51.0, type: 'elevator' },
    { key: 'SL', name: '계단(왼쪽)', x: 12.75, y: 5.0, type: 'stairs' },
    { key: 'SL2', name: '계단(2층행)', x: 29.75, y: 5.0, type: 'stairs' },
    { key: 'LIB', name: '도서실', x: 46.5, y: 5.0, type: 'room' },
    { key: 'HLT', name: '보건실', x: 55.25, y: 5.0, type: 'room' },
    { key: 'TR', name: '화장실(오른쪽)', x: 71.5, y: 5.0, type: 'room' },
    { key: 'SR', name: '계단(오른쪽)', x: 71.5, y: 15.0, type: 'stairs' },
    { key: 'BIO', name: '물리실', x: 4.25, y: 43.2, type: 'room' },
    { key: 'TT', name: '화장실(아래)', x: 21.5, y: 43.2, type: 'room' },
    { key: 'T27', name: '2-7반', x: 30.4, y: 43.2, type: 'room' },
    { key: 'T28', name: '2-8반', x: 38.3, y: 43.2, type: 'room' },
    { key: 'T39', name: '3-9반', x: 46.75, y: 43.2, type: 'room' },
    { key: 'SU', name: '계단(아래 오른쪽)', x: 63.75, y: 43.2, type: 'stairs' },
    { key: 'L30', name: '과학준비실', x: 4.25, y: 34.2, type: 'room' },
    { key: 'L22', name: '개별학습실', x: 4.25, y: 25.8, type: 'room' },
    { key: 'SEX', name: '계단(중앙 아래)', x: 21.5, y: 51.0, type: 'stairs' },
    { key: 'JR', name: '_junction_right', x: 63.75, y: 15.0, type: 'room' },
  ],
  2: [
    { key: 'TL', name: '화장실(왼쪽)', x: 4.25, y: 5.0, type: 'room' },
    { key: 'EV', name: '엘리베이터', x: 12.9, y: 51.0, type: 'elevator' },
    { key: 'SL', name: '계단(왼쪽)', x: 12.75, y: 5.0, type: 'stairs' },
    { key: 'SL2', name: '계단(1층행)', x: 29.75, y: 5.0, type: 'stairs' },
    { key: 'R38', name: '3-8반', x: 38.0, y: 5.0, type: 'room' },
    { key: 'R37', name: '3-7반', x: 46.5, y: 5.0, type: 'room' },
    { key: 'R36', name: '3-6반', x: 55.25, y: 5.0, type: 'room' },
    { key: 'R35', name: '3-5반', x: 63.75, y: 5.0, type: 'room' },
    { key: 'TR', name: '화장실(오른쪽)', x: 71.5, y: 5.0, type: 'room' },
    { key: 'SR', name: '계단(오른쪽)', x: 71.5, y: 15.0, type: 'stairs' },
    { key: 'CHM', name: '화학실', x: 4.25, y: 43.2, type: 'room' },
    { key: 'TT', name: '화장실(아래)', x: 21.5, y: 43.2, type: 'room' },
    { key: 'T26', name: '2-6반', x: 30.4, y: 43.2, type: 'room' },
    { key: 'T25', name: '2-5반', x: 38.3, y: 43.2, type: 'room' },
    { key: 'T24', name: '2-4반', x: 46.75, y: 43.2, type: 'room' },
    { key: 'SU', name: '계단(아래 오른쪽)', x: 63.75, y: 43.2, type: 'stairs' },
    { key: 'L30', name: '과학정보부', x: 4.25, y: 34.2, type: 'room' },
    { key: 'L22', name: '1-7반', x: 4.25, y: 25.8, type: 'room' },
    { key: 'L13', name: '1-6반', x: 4.25, y: 17.4, type: 'room' },
    { key: 'R30', name: '2학년 홈베이스', x: 63.75, y: 34.2, type: 'room' },
    { key: 'R22', name: '진학정보실', x: 63.75, y: 25.8, type: 'room' },
    { key: 'R13', name: '3학년부', x: 63.75, y: 17.4, type: 'room' },
    { key: 'CAF', name: '급식실', x: 34.1, y: 51.0, type: 'cafeteria' },
    { key: 'SEX', name: '계단(중앙 아래)', x: 21.5, y: 51.0, type: 'stairs' },
    { key: 'JR', name: '_junction_right', x: 63.75, y: 15.0, type: 'room' },
  ],
  3: [
    { key: 'TL', name: '화장실(왼쪽)', x: 4.25, y: 5.0, type: 'room' },
    { key: 'EV', name: '엘리베이터', x: 12.9, y: 51.0, type: 'elevator' },
    { key: 'SL', name: '계단(왼쪽)', x: 12.75, y: 5.0, type: 'stairs' },
    { key: 'CP', name: '컴퓨터실', x: 21.25, y: 5.0, type: 'room' },
    { key: 'AI', name: 'AI실', x: 29.75, y: 5.0, type: 'room' },
    { key: 'B31', name: '3-1반', x: 38.0, y: 5.0, type: 'room' },
    { key: 'B32', name: '3-2반', x: 46.5, y: 5.0, type: 'room' },
    { key: 'B33', name: '3-3반', x: 55.25, y: 5.0, type: 'room' },
    { key: 'B34', name: '3-4반', x: 63.75, y: 5.0, type: 'room' },
    { key: 'TR', name: '화장실(오른쪽)', x: 71.5, y: 5.0, type: 'room' },
    { key: 'SR', name: '계단(오른쪽)', x: 71.5, y: 15.0, type: 'stairs' },
    { key: 'BIO', name: '생물실', x: 4.25, y: 43.2, type: 'room' },
    { key: 'TT', name: '화장실(아래)', x: 21.5, y: 43.2, type: 'room' },
    { key: 'T21', name: '2-1반', x: 30.4, y: 43.2, type: 'room' },
    { key: 'T22', name: '2-2반', x: 38.3, y: 43.2, type: 'room' },
    { key: 'T23', name: '2-3반', x: 46.75, y: 43.2, type: 'room' },
    { key: 'SU', name: '계단(아래 오른쪽)', x: 63.75, y: 43.2, type: 'stairs' },
    { key: 'L30', name: '1-4반', x: 4.25, y: 34.2, type: 'room' },
    { key: 'L22', name: '1-5반', x: 4.25, y: 25.8, type: 'room' },
    { key: 'L13', name: '1-6반', x: 4.25, y: 17.4, type: 'room' },
    { key: 'R30', name: '모둠학습실', x: 63.75, y: 34.2, type: 'room' },
    { key: 'R22', name: '3학년 홈베이스', x: 63.75, y: 25.8, type: 'room' },
    { key: 'CAF', name: '급식실', x: 34.1, y: 51.0, type: 'cafeteria' },
    { key: 'SEX', name: '계단(중앙 아래)', x: 21.5, y: 51.0, type: 'stairs' },
    { key: 'JR', name: '_junction_right', x: 63.75, y: 15.0, type: 'room' },
  ],
  4: [
    { key: 'TL', name: '화장실(왼쪽)', x: 4.25, y: 5.0, type: 'room' },
    { key: 'EV', name: '엘리베이터', x: 12.9, y: 51.0, type: 'elevator' },
    { key: 'SL', name: '계단(왼쪽)', x: 12.75, y: 5.0, type: 'stairs' },
    { key: 'GH', name: '어학실', x: 21.25, y: 5.0, type: 'room' },
    { key: 'G12', name: '1,2학년부', x: 29.75, y: 5.0, type: 'room' },
    { key: 'CR', name: '창의체험교육부', x: 38.0, y: 5.0, type: 'room' },
    { key: 'ST', name: '학생회실', x: 46.5, y: 5.0, type: 'room' },
    { key: 'A2', name: '미술실2', x: 55.25, y: 5.0, type: 'room' },
    { key: 'A1', name: '미술실1', x: 63.75, y: 5.0, type: 'room' },
    { key: 'AST', name: '미술비품실', x: 71.5, y: 5.0, type: 'room' },
    { key: 'SR', name: '계단(오른쪽)', x: 71.5, y: 15.0, type: 'stairs' },
    { key: 'ES', name: '지구과학실', x: 4.25, y: 43.2, type: 'room' },
    { key: 'TT', name: '화장실(아래)', x: 21.5, y: 43.2, type: 'room' },
    { key: 'LE', name: '생활교육부', x: 30.4, y: 43.2, type: 'room' },
    { key: 'MU', name: '음악실', x: 46.75, y: 43.2, type: 'room' },
    { key: 'SU', name: '계단(아래 오른쪽)', x: 63.75, y: 43.2, type: 'stairs' },
    { key: 'L30', name: '1-3반', x: 4.25, y: 34.2, type: 'room' },
    { key: 'L22', name: '1-2반', x: 4.25, y: 25.8, type: 'room' },
    { key: 'L13', name: '1-1반', x: 4.25, y: 17.4, type: 'room' },
    { key: 'R30', name: '음악실', x: 63.75, y: 34.2, type: 'room' },
    { key: 'R22', name: '음악준비실', x: 63.75, y: 25.8, type: 'room' },
    { key: 'R13', name: '음악합주실', x: 63.75, y: 17.4, type: 'room' },
    { key: 'SEX', name: '계단(중앙 아래)', x: 21.5, y: 51.0, type: 'stairs' },
    { key: 'JR', name: '_junction_right', x: 63.75, y: 15.0, type: 'room' },
  ],
}

const FLOOR_EDGES: Record<Floor, EdgeDef[]> = {
  1: [
    ['EV', 'SEX'],
    ['SL2', 'LIB'], ['LIB', 'HLT'], ['HLT', 'TR'],
    ['TR', 'JR'], ['JR', 'SR'], ['JR', 'SU'],
    ['TL', 'L22'], ['L22', 'L30'], ['L30', 'BIO'],
    ['BIO', 'TT'], ['TT', 'T27'], ['T27', 'T28'], ['T28', 'T39'], ['T39', 'SU'],
    ['TT', 'SEX'],
  ],
  2: [
    ['EV', 'SEX'],
    ['SL2', 'R38'], ['R38', 'R37'], ['R37', 'R36'], ['R36', 'R35'], ['R35', 'TR'],
    ['TR', 'JR'], ['JR', 'SR'],
    ['JR', 'R13'], ['R13', 'R22'], ['R22', 'R30'], ['R30', 'SU'],
    ['TL', 'L13'], ['L13', 'L22'], ['L22', 'L30'], ['L30', 'CHM'],
    ['CHM', 'TT'], ['TT', 'T26'], ['T26', 'T25'], ['T25', 'T24'], ['T24', 'SU'],
    ['TT', 'SEX'], ['T25', 'CAF'], ['SEX', 'CAF'],
  ],
  3: [
    ['EV', 'SEX'], ['SL', 'CP'], ['CP', 'AI'], ['AI', 'B31'],
    ['B31', 'B32'], ['B32', 'B33'], ['B33', 'B34'], ['B34', 'TR'],
    ['TR', 'JR'], ['JR', 'SR'],
    ['JR', 'R22'], ['R22', 'R30'], ['R30', 'SU'],
    ['TL', 'L13'], ['L13', 'L22'], ['L22', 'L30'], ['L30', 'BIO'],
    ['BIO', 'TT'], ['TT', 'T21'], ['T21', 'T22'], ['T22', 'T23'], ['T23', 'SU'],
    ['TT', 'SEX'], ['T22', 'CAF'], ['SEX', 'CAF'],
  ],
  4: [
    ['EV', 'SEX'], ['SL', 'GH'], ['GH', 'G12'], ['G12', 'CR'],
    ['CR', 'ST'], ['ST', 'A2'], ['A2', 'A1'], ['A1', 'AST'],
    ['AST', 'JR'], ['JR', 'SR'],
    ['JR', 'R13'], ['R13', 'R22'], ['R22', 'R30'], ['R30', 'SU'],
    ['TL', 'L13'], ['L13', 'L22'], ['L22', 'L30'], ['L30', 'ES'],
    ['ES', 'TT'], ['TT', 'LE'], ['LE', 'MU'], ['MU', 'SU'], ['TT', 'SEX'],
  ],
}

const STAIR_CONNECTIONS: { key: string; floors: Floor[] }[] = [
  { key: 'SL', floors: [1, 2, 3, 4] },
  { key: 'SL2', floors: [1, 2] },
  { key: 'SU', floors: [1, 2, 3, 4] },
  { key: 'SR', floors: [1, 2, 3, 4] },
  { key: 'SEX', floors: [1, 2, 3, 4] },
]

const ELEVATOR_CONNECTIONS: { key: string; floors: Floor[] }[] = [
  { key: 'EV', floors: [1, 2, 3, 4] },
]

const FLOOR_CHANGE_WEIGHT = 20
const ELEVATOR_CHANGE_WEIGHT = 6

function canUseStairs(mode: TravelMode) {
  return mode === 'both' || mode === 'stairsOnly'
}

function canUseElevator(mode: TravelMode) {
  return mode === 'both' || mode === 'elevatorOnly'
}

export function buildGraph(options: PathOptions = {}): {
  nodes: Map<string, Node>
  adjacency: Map<string, { to: string; weight: number }[]>
} {
  const mode = options.travelMode ?? 'stairsOnly'
  const nodes = new Map<string, Node>()
  const adjacency = new Map<string, { to: string; weight: number }[]>()

  ;(Object.entries(FLOOR_NODES) as [string, RawNode[]][]).forEach(([floorStr, defs]) => {
    const floor = Number(floorStr) as Floor
    defs.forEach((d) => {
      const id = nid(floor, d.key)
      nodes.set(id, { ...d, id, floor })
      adjacency.set(id, [])
    })
  })

  function dist(a: Node, b: Node) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
  }

  function addEdge(idA: string, idB: string, weight?: number) {
    const na = nodes.get(idA), nb = nodes.get(idB)
    if (!na || !nb) return
    const w = weight ?? dist(na, nb)
    adjacency.get(idA)!.push({ to: idB, weight: w })
    adjacency.get(idB)!.push({ to: idA, weight: w })
  }

  ;(Object.entries(FLOOR_EDGES) as [string, EdgeDef[]][]).forEach(([floorStr, edges]) => {
    const floor = Number(floorStr) as Floor
    edges.forEach(([kA, kB]) => addEdge(nid(floor, kA), nid(floor, kB)))
  })

  if (canUseStairs(mode)) {
    STAIR_CONNECTIONS.forEach(({ key, floors }) => {
      for (let i = 0; i < floors.length - 1; i++) {
        addEdge(nid(floors[i], key), nid(floors[i + 1], key), FLOOR_CHANGE_WEIGHT)
      }
    })
  }

  if (canUseElevator(mode)) {
    ELEVATOR_CONNECTIONS.forEach(({ key, floors }) => {
      for (let i = 0; i < floors.length - 1; i++) {
        addEdge(nid(floors[i], key), nid(floors[i + 1], key), ELEVATOR_CHANGE_WEIGHT)
      }
    })
  }

  return { nodes, adjacency }
}

export function dijkstra(
  startId: string,
  endId: string,
  nodes: Map<string, Node>,
  adjacency: Map<string, { to: string; weight: number }[]>
): PathResult | null {
  const dist = new Map<string, number>()
  const prev = new Map<string, string | null>()
  const visited = new Set<string>()
  const pq: { id: string; dist: number }[] = []

  nodes.forEach((_, id) => {
    dist.set(id, Infinity)
    prev.set(id, null)
  })
  dist.set(startId, 0)
  pq.push({ id: startId, dist: 0 })

  function pqPop() {
    let minIdx = 0
    for (let i = 1; i < pq.length; i++) {
      if (pq[i].dist < pq[minIdx].dist) minIdx = i
    }
    return pq.splice(minIdx, 1)[0]
  }

  while (pq.length > 0) {
    const { id: u } = pqPop()
    if (visited.has(u)) continue
    visited.add(u)
    if (u === endId) break

    for (const { to: v, weight } of adjacency.get(u) ?? []) {
      if (visited.has(v)) continue
      const newDist = dist.get(u)! + weight
      if (newDist < dist.get(v)!) {
        dist.set(v, newDist)
        prev.set(v, u)
        pq.push({ id: v, dist: newDist })
      }
    }
  }

  if (dist.get(endId) === Infinity) return null

  const path: string[] = []
  let cur: string | null = endId
  while (cur !== null) {
    path.unshift(cur)
    cur = prev.get(cur) ?? null
  }

  const floorChanges: FloorChange[] = []
  for (let i = 0; i < path.length - 1; i++) {
    const na = nodes.get(path[i])!
    const nb = nodes.get(path[i + 1])!
    if (na.floor !== nb.floor) {
      floorChanges.push({
        nodeId: path[i],
        nodeName: na.name,
        fromFloor: na.floor,
        toFloor: nb.floor,
        method: na.type === 'elevator' && nb.type === 'elevator' ? 'elevator' : 'stairs',
      })
    }
  }

  return { path, totalDistance: dist.get(endId)!, floorChanges }
}

export function getGraph(options: PathOptions = {}) {
  return buildGraph(options)
}

export function findNodeByName(name: string): Node[] {
  const { nodes } = getGraph()
  return Array.from(nodes.values()).filter((node) => node.name.includes(name) && !node.name.startsWith('_'))
}

export function findNodeById(floor: Floor, key: string, nodes: Map<string, Node>): Node | undefined {
  return nodes.get(nid(floor, key))
}

export function generateDirections(result: PathResult, options: PathOptions = {}): string[] {
  const { nodes } = getGraph(options)
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
      const verb = next.floor > cur.floor ? '올라가세요' : '내려가세요'
      const method = cur.type === 'elevator' && next.type === 'elevator' ? '엘리베이터' : '계단'
      steps.push(`[${cur.name}] ${method}로 ${next.floor}층까지 ${verb}.`)
      continue
    }
    const dx = next.x - cur.x
    const dy = next.y - cur.y
    const dir = Math.abs(dx) > Math.abs(dy)
      ? (dx > 0 ? '오른쪽' : '왼쪽')
      : (dy > 0 ? '아래쪽' : '위쪽')
    steps.push(`${dir}으로 이동해 [${next.name}]`)
  }

  const endNode = nodes.get(path[path.length - 1])!
  steps.push(`완료: [${endNode.name}] (${endNode.floor}층)에 도착했습니다.`)
  return steps
}

export function findPath(startId: string, endId: string, options: PathOptions = {}): PathResult | null {
  const { nodes, adjacency } = getGraph(options)
  return dijkstra(startId, endId, nodes, adjacency)
}

export function nodeId(floor: Floor, key: string): string {
  return nid(floor, key)
}
