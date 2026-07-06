import { useEffect, useRef, useState } from 'react'
import { findPath, getGraph } from '../schoolGraph'
import type { Floor, TravelMode } from '../schoolGraph'

interface Props {
  floor: Floor
  startId: string
  endId: string
  travelMode: TravelMode
}

type RoomType = 'room' | 'stairs' | 'cafeteria' | 'elevator'
type RoomDef = [number, number, number, number, string, RoomType?]

const OX = 75, OY = 54
const VW = 370, VH = 237
const DW = VW, DH = VH
const G = 2

function sx(x: number) { return (x / OX) * DW }
function sy(y: number) { return DH - (y / OY) * DH }

const C = {
  room: '#fff8f6',
  stair: '#ede8f8',
  elevator: '#e8f2fb',
  caf: '#eaf5ea',
  corr: '#f5edea',
}

const INK = '#9a8070'

let seed = 42
function rnd() { seed = (seed * 1664525 + 1013904223) & 0xffffffff; return (seed >>> 0) / 4294967296 }
function jit() { return (rnd() - 0.5) * 0.72 }
function sketchPath(x: number, y: number, w: number, h: number) {
  const j = () => jit()
  const ax = x + j(), ay = y + j(), bx = x + w + j(), by = y + j()
  const cx = x + w + j(), cy = y + h + j(), dx = x + j(), dy = y + h + j()
  const mx1 = (ax + bx) / 2 + j() * 0.5, my1 = (ay + by) / 2 + j() * 0.5
  const mx2 = (bx + cx) / 2 + j() * 0.5, my2 = (by + cy) / 2 + j() * 0.5
  const mx3 = (cx + dx) / 2 + j() * 0.5, my3 = (cy + dy) / 2 + j() * 0.5
  const mx4 = (dx + ax) / 2 + j() * 0.5, my4 = (dy + ay) / 2 + j() * 0.5
  return `M${ax.toFixed(1)},${ay.toFixed(1)} Q${mx1.toFixed(1)},${my1.toFixed(1)} ${bx.toFixed(1)},${by.toFixed(1)} Q${mx2.toFixed(1)},${my2.toFixed(1)} ${cx.toFixed(1)},${cy.toFixed(1)} Q${mx3.toFixed(1)},${my3.toFixed(1)} ${dx.toFixed(1)},${dy.toFixed(1)} Q${mx4.toFixed(1)},${my4.toFixed(1)} ${ax.toFixed(1)},${ay.toFixed(1)}Z`
}

function roomPath(x1: number, y1: number, x2: number, y2: number, fill = C.room) {
  seed += 13
  const px = sx(Math.min(x1, x2)) + G, py = sy(Math.max(y1, y2)) + G
  const pw = Math.abs(sx(x2) - sx(x1)) - G * 2, ph = Math.abs(sy(y2) - sy(y1)) - G * 2
  if (pw < 1 || ph < 1) return ''
  return `<path d="${sketchPath(px, py, pw, ph)}" fill="${fill}" stroke="${INK}" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/>`
}

const sharedTop: RoomDef[] = [
  [0, 0, 8.5, 10, '화장실', 'room'],
  [8.5, 0, 17, 10, '계단', 'stairs'],
]

const sharedElevator: RoomDef = [
  8.5, 48, 17.3, 54, '엘리베이터', 'elevator',
]

const FLOOR_ROOMS: Record<Floor, RoomDef[]> = {
  1: [
    ...sharedTop, [25.5, 0, 34, 10, '계단', 'stairs'], [42, 0, 51, 10, '도서실'], [51, 0, 59.5, 10, '보건실'], [68, 0, 75, 10, '화장실'],
    [68, 10, 75, 20, '계단', 'stairs'], [0, 21.6, 8.5, 30, '개별학습실'], [0, 30, 8.5, 38.4, '과학준비실'],
    [0, 38.4, 8.5, 48, '물리실'], [17.3, 38.4, 25.7, 48, '화장실'], [25.7, 38.4, 34.1, 48, '2-7반'],
    [34.1, 38.4, 42.5, 48, '2-8반'], [42.5, 38.4, 51, 48, '3-9반'], [59.5, 38.4, 68, 48, '계단', 'stairs'],
    sharedElevator, [17.3, 48, 25.7, 54, '계단', 'stairs'],
  ],
  2: [
    ...sharedTop, [25.5, 0, 34, 10, '계단', 'stairs'], [34, 0, 42, 10, '3-8반'], [42, 0, 51, 10, '3-7반'], [51, 0, 59.5, 10, '3-6반'],
    [59.5, 0, 68, 10, '3-5반'], [68, 0, 75, 10, '화장실'], [68, 10, 75, 20, '계단', 'stairs'],
    [0, 13.2, 8.5, 21.6, '1-6반'], [0, 21.6, 8.5, 30, '1-7반'], [0, 30, 8.5, 38.4, '과학정보부'],
    [59.5, 13.2, 68, 21.6, '3학년부'], [59.5, 21.6, 68, 30, '진학정보실'], [59.5, 30, 68, 38.4, '2학년 홈베이스'],
    [0, 38.4, 8.5, 48, '화학실'], [17.3, 38.4, 25.7, 48, '화장실'], [25.7, 38.4, 34.1, 48, '2-6반'],
    [34.1, 38.4, 42.5, 48, '2-5반'], [42.5, 38.4, 51, 48, '2-4반'], [59.5, 38.4, 68, 48, '계단', 'stairs'],
    sharedElevator, [17.3, 48, 25.7, 54, '계단', 'stairs'], [25.7, 48, 42.5, 54, '급식실', 'cafeteria'],
  ],
  3: [
    ...sharedTop, [17, 0, 25.5, 10, '컴퓨터실'], [25.5, 0, 34, 10, 'AI실'], [34, 0, 42, 10, '3-1반'], [42, 0, 51, 10, '3-2반'],
    [51, 0, 59.5, 10, '3-3반'], [59.5, 0, 68, 10, '3-4반'], [68, 0, 75, 10, '화장실'],
    [68, 10, 75, 20, '계단', 'stairs'], [0, 13.2, 8.5, 21.6, '1-6반'], [0, 21.6, 8.5, 30, '1-5반'],
    [0, 30, 8.5, 38.4, '1-4반'], [59.5, 21.6, 68, 30, '3학년 홈베이스'], [59.5, 30, 68, 38.4, '모둠학습실'],
    [0, 38.4, 8.5, 48, '생물실'], [17.3, 38.4, 25.7, 48, '화장실'], [25.7, 38.4, 34.1, 48, '2-1반'],
    [34.1, 38.4, 42.5, 48, '2-2반'], [42.5, 38.4, 51, 48, '2-3반'], [59.5, 38.4, 68, 48, '계단', 'stairs'],
    sharedElevator, [17.3, 48, 25.7, 54, '계단', 'stairs'], [25.7, 48, 42.5, 54, '급식실', 'cafeteria'],
  ],
  4: [
    ...sharedTop, [17, 0, 25.5, 10, '어학실'], [25.5, 0, 34, 10, '1,2학년부'], [34, 0, 42, 10, '창체부'], [42, 0, 51, 10, '학생회실'],
    [51, 0, 59.5, 10, '미술실2'], [59.5, 0, 68, 10, '미술실1'], [68, 0, 75, 10, '미술비품실'],
    [68, 10, 75, 20, '계단', 'stairs'], [0, 13.2, 8.5, 21.6, '1-1반'], [0, 21.6, 8.5, 30, '1-2반'],
    [0, 30, 8.5, 38.4, '1-3반'], [59.5, 13.2, 68, 21.6, '음악합주실'], [59.5, 21.6, 68, 30, '음악준비실'],
    [59.5, 30, 68, 38.4, '음악실'], [0, 38.4, 8.5, 48, '지구과학실'], [17.3, 38.4, 25.7, 48, '화장실'],
    [25.7, 38.4, 34.1, 48, '생활교육부'], [34.1, 38.4, 42.5, 48, '탈의실'], [42.5, 38.4, 51, 48, '음악실'],
    [59.5, 38.4, 68, 48, '계단', 'stairs'], sharedElevator, [17.3, 48, 25.7, 54, '계단', 'stairs'],
  ],
}

function fillFor(type?: RoomType) {
  if (type === 'stairs') return C.stair
  if (type === 'cafeteria') return C.caf
  if (type === 'elevator') return C.elevator
  return C.room
}

function getMemos(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem('schoolMemos') || '{}') }
  catch { return {} }
}

function saveMemo(key: string, text: string) {
  const memos = getMemos()
  if (text.trim()) memos[key] = text
  else delete memos[key]
  localStorage.setItem('schoolMemos', JSON.stringify(memos))
}

export default function FloorMap({ floor, startId, endId, travelMode }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [popup, setPopup] = useState<{ roomName: string; memoKey: string } | null>(null)
  const [memoText, setMemoText] = useState('')

  useEffect(() => {
    if (!svgRef.current) return
    seed = floor * 100

    let html = ''
    FLOOR_ROOMS[floor].forEach((r) => {
      const [x1, y1, x2, y2, label, type] = r
      html += roomPath(x1, y1, x2, y2, fillFor(type))

      const cx = sx((x1 + x2) / 2)
      const cy = sy((y1 + y2) / 2)
      const fontSize = type === 'elevator' ? 6.3 : 10
      html += `<text x="${cx.toFixed(1)}" y="${cy.toFixed(1)}" font-size="${fontSize}" fill="#6A635D" text-anchor="middle" dominant-baseline="middle" font-family="'온글잎 의연체', sans-serif" style="pointer-events:none">${label}</text>`

      const px = sx(Math.min(x1, x2)) + G
      const py = sy(Math.max(y1, y2)) + G
      const pw = Math.abs(sx(x2) - sx(x1)) - G * 2
      const ph = Math.abs(sy(y2) - sy(y1)) - G * 2
      const memoKey = `${floor}_${label}_${x1}_${y1}`
      html += `<rect x="${px.toFixed(1)}" y="${py.toFixed(1)}" width="${pw.toFixed(1)}" height="${ph.toFixed(1)}" fill="transparent" style="cursor:pointer" data-room="${label}" data-key="${memoKey}"/>`
    })

    const gardenX = sx(13)
    const gardenY = sy(38)
    const gardenW = sx(59) - sx(17)
    const gardenH = sy(10) - sy(38)
    html += `<image href="./garden.png" x="${gardenX}" y="${gardenY}" width="${gardenW}" height="${gardenH}" preserveAspectRatio="xMidYMid meet" opacity="0.9"/>`

    seed = floor * 100 + 999
    html += `<path d="${sketchPath(sx(0) + G, sy(54) + G, sx(75) - sx(0) - G * 2, sy(0) - sy(54) - G * 2)}" fill="none" stroke="${INK}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`

    if (startId && endId) {
      const result = findPath(startId, endId, { travelMode })
      if (result) {
        const { nodes } = getGraph({ travelMode })
        const floorNodes = result.path
          .map(id => nodes.get(id)!)
          .filter(n => n && n.floor === floor && !n.name.startsWith('_'))

        if (floorNodes.length >= 2) {
          let d = `M${sx(floorNodes[0].x).toFixed(1)},${sy(floorNodes[0].y).toFixed(1)}`
          floorNodes.slice(1).forEach(n => { d += ` L${sx(n.x).toFixed(1)},${sy(n.y).toFixed(1)}` })
          html += `<path d="${d}" fill="none" stroke="#f0c0c0" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" stroke-opacity="0.4"/>`
          html += `<path d="${d}" fill="none" stroke="#d03030" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="5 3" stroke-opacity="0.9"/>`
          const s = floorNodes[0]
          const e = floorNodes[floorNodes.length - 1]
          html += `<circle cx="${sx(s.x)}" cy="${sy(s.y)}" r="5" fill="#b135f8" fill-opacity="0.45" stroke="white" stroke-width="1.5"/>`
          html += `<circle cx="${sx(e.x)}" cy="${sy(e.y)}" r="5" fill="#309030" fill-opacity="0.35" stroke="white" stroke-width="1.5"/>`
        }
      }
    }

    svgRef.current.innerHTML = html
    svgRef.current.querySelectorAll('rect[data-room]').forEach(el => {
      el.addEventListener('click', () => {
        const roomName = el.getAttribute('data-room') || ''
        const memoKey = el.getAttribute('data-key') || ''
        const memos = getMemos()
        setMemoText(memos[memoKey] || '')
        setPopup({ roomName, memoKey })
      })
    })
  }, [floor, startId, endId, travelMode])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 ${VW} ${VH}`}
        style={{ display: 'block' }}
        preserveAspectRatio="xMidYMid meet"
      />

      {popup && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(255,255,255,0.3)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }} onClick={() => setPopup(null)}>
          <div style={{ position: 'relative', width: '80vw' }} onClick={e => e.stopPropagation()}>
            <img src="./memo.png" style={{ width: '100%', display: 'block', mixBlendMode: 'multiply' }} />
            <div style={{
              position: 'absolute',
              top: '32%', left: '15%', right: '15%', bottom: '12%',
              display: 'flex',
              flexDirection: 'column',
              fontFamily: "'온글잎 의연체', sans-serif",
            }}>
              <div style={{ fontSize: '10vw', color: '#6A635D', marginBottom: '1vh' }}>
                {popup.roomName}
              </div>
              <textarea
                value={memoText}
                onChange={e => setMemoText(e.target.value)}
                placeholder="메모를 입력하세요..."
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'transparent',
                  fontFamily: "'온글잎 의연체', sans-serif",
                  fontSize: '3.5vw',
                  color: '#6A635D',
                  resize: 'none',
                  outline: 'none',
                  lineHeight: '1.6',
                  overflow: 'auto',
                  padding: '0.5vh',
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '3vw' }}>
                <button onClick={() => setPopup(null)} style={{
                  fontFamily: "'온글잎 의연체', sans-serif",
                  fontSize: '4.5vw',
                  color: '#6A635D',
                  background: 'none', border: 'none', cursor: 'pointer',
                }}>취소</button>
                <button onClick={() => { saveMemo(popup.memoKey, memoText); setPopup(null) }} style={{
                  fontFamily: "'온글잎 의연체', sans-serif",
                  fontSize: '4.5vw',
                  color: '#9a5050',
                  background: 'none', border: 'none', cursor: 'pointer',
                }}>저장</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
