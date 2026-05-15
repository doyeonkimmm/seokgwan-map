import { useEffect, useRef } from 'react'
import { getGraph, findPath } from '../schoolGraph'
import type { Floor } from '../schoolGraph'

interface Props {
  floor: Floor
  startId: string
  endId: string
}

const OX = 75, OY = 54
const ML = 8, MR = 8, MT = 8, MB = 8
const VW = 370, VH = 237
const DW = VW - ML - MR
const DH = VH - MT - MB

function sx(x: number) { return ML + (x / OX) * DW }
function sy(y: number) { return MT + DH - (y / OY) * DH }

const C = {
  room: '#fff8f6',
  stair: '#ede8f8',
  caf: '#eaf5ea',
  corr: '#f5edea',
  void: '#fdf8f5',
}

const INK = '#9a8070'
const G = 2

let seed = 42
function rnd() { seed = (seed * 1664525 + 1013904223) & 0xffffffff; return (seed >>> 0) / 4294967296 }
function jit() { return (rnd() - 0.5) * 0.72 }
function sketchPath(x: number, y: number, w: number, h: number) {
  const j = () => jit()
  const ax = x+j(), ay = y+j(), bx = x+w+j(), by = y+j()
  const cx = x+w+j(), cy = y+h+j(), dx = x+j(), dy = y+h+j()
  const mx1=(ax+bx)/2+j()*0.5, my1=(ay+by)/2+j()*0.5
  const mx2=(bx+cx)/2+j()*0.5, my2=(by+cy)/2+j()*0.5
  const mx3=(cx+dx)/2+j()*0.5, my3=(cy+dy)/2+j()*0.5
  const mx4=(dx+ax)/2+j()*0.5, my4=(dy+ay)/2+j()*0.5
  return `M${ax.toFixed(1)},${ay.toFixed(1)} Q${mx1.toFixed(1)},${my1.toFixed(1)} ${bx.toFixed(1)},${by.toFixed(1)} Q${mx2.toFixed(1)},${my2.toFixed(1)} ${cx.toFixed(1)},${cy.toFixed(1)} Q${mx3.toFixed(1)},${my3.toFixed(1)} ${dx.toFixed(1)},${dy.toFixed(1)} Q${mx4.toFixed(1)},${my4.toFixed(1)} ${ax.toFixed(1)},${ay.toFixed(1)}Z`
}

function R(x1: number, y1: number, x2: number, y2: number, fill = C.room) {
  seed += 13
  const px = sx(Math.min(x1,x2))+G, py = sy(Math.max(y1,y2))+G
  const pw = Math.abs(sx(x2)-sx(x1))-G*2, ph = Math.abs(sy(y2)-sy(y1))-G*2
  if (pw < 1 || ph < 1) return ''
  return `<path d="${sketchPath(px,py,pw,ph)}" fill="${fill}" stroke="${INK}" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/>`
}

const FLOOR_ROOMS: Record<number, number[][]> = {
  1: [
    [0,0,8.5,10],[25.5,0,34,10,],[34,0,42,10],[42,0,51,10],[51,0,59.5,10],[59.5,0,68,10],[68,0,75,10],
    [68,10,75,20],
    [0,10,8.5,21.6],[0,21.6,8.5,30],[0,30,8.5,38.4],
    [59.5,10,68,38.4],
    [0,38.4,8.5,48],[8.5,38.4,17.3,48],[17.3,38.4,25.7,48],[25.7,38.4,34.1,48],
    [34.1,38.4,42.5,48],[42.5,38.4,51,48],[51,38.4,59.5,48],[59.5,38.4,68,48],[68,38.4,75,48],
    [17.3,48,25.7,54],
  ],
  2: [
    [0,0,8.5,10],[8.5,0,25.5,10],[25.5,0,34,10],[34,0,42,10],[42,0,51,10],
    [51,0,59.5,10],[59.5,0,68,10],[68,0,75,10],[68,10,75,20],
    [0,10,8.5,13.2],[0,13.2,8.5,21.6],[0,21.6,8.5,30],[0,30,8.5,38.4],
    [59.5,10,68,13.2],[59.5,13.2,68,21.6],[59.5,21.6,68,30],[59.5,30,68,38.4],
    [0,38.4,8.5,48],[8.5,38.4,17.3,48],[17.3,38.4,25.7,48],[25.7,38.4,34.1,48],
    [34.1,38.4,42.5,48],[42.5,38.4,59.5,48],[59.5,38.4,68,48],[68,38.4,75,48],
    [17.3,48,25.7,54],[25.7,48,42.5,54],
  ],
  3: [
    [0,0,8.5,10],[8.5,0,17,10],[17,0,25.5,10],[25.5,0,34,10],[34,0,42,10],
    [42,0,51,10],[51,0,59.5,10],[59.5,0,68,10],[68,0,75,10],[68,10,75,20],
    [0,10,8.5,13.2],[0,13.2,8.5,21.6],[0,21.6,8.5,30],[0,30,8.5,38.4],
    [59.5,10,68,21.6],[59.5,21.6,68,30],[59.5,30,68,38.4],
    [0,38.4,8.5,48],[8.5,38.4,17.3,48],[17.3,38.4,25.7,48],[25.7,38.4,34.1,48],
    [34.1,38.4,42.5,48],[42.5,38.4,59.5,48],[59.5,38.4,68,48],[68,38.4,75,48],
    [17.3,48,25.7,54],[25.7,48,42.5,54],
  ],
  4: [
    [0,0,8.5,10],[8.5,0,17,10],[17,0,25.5,10],[25.5,0,34,10],[34,0,42,10],
    [42,0,51,10],[51,0,59.5,10],[59.5,0,68,10],[68,0,75,10],[68,10,75,20],
    [0,10,8.5,13.2],[0,13.2,8.5,21.6],[0,21.6,8.5,30],[0,30,8.5,38.4],
    [59.5,10,68,13.2],[59.5,13.2,68,21.6],[59.5,21.6,68,30],[59.5,30,68,38.4],
    [0,38.4,8.5,48],[8.5,38.4,17.3,48],[17.3,38.4,25.7,48],[25.7,38.4,34.1,48],
    [34.1,38.4,59.5,48],[59.5,38.4,68,48],[68,38.4,75,48],
    [17.3,48,25.7,54],
  ],
}

// 층별 방 색상
const FLOOR_COLORS: Record<number, string[]> = {
  1: [C.corr,'',C.room,C.room,C.room,C.room,C.room,C.stair,C.room,C.room,C.corr,C.corr,C.corr,C.stair,C.room,C.room,C.room,C.room,C.room,C.stair,C.corr,C.stair],
  2: [C.corr,C.stair,C.stair,C.room,C.room,C.room,C.room,C.room,C.stair,C.room,C.room,C.room,C.corr,C.room,C.room,C.room,C.corr,C.corr,C.room,C.room,C.room,C.room,C.room,C.stair,C.corr,C.stair,C.caf],
  3: [C.corr,C.stair,C.room,C.room,C.room,C.room,C.room,C.room,C.room,C.stair,C.room,C.room,C.room,C.corr,C.room,C.room,C.corr,C.corr,C.room,C.room,C.room,C.room,C.room,C.stair,C.corr,C.stair,C.caf],
  4: [C.corr,C.stair,C.room,C.room,C.room,C.room,C.room,C.room,C.room,C.stair,C.room,C.room,C.room,C.corr,C.room,C.room,C.room,C.corr,C.corr,C.room,C.room,C.room,C.room,C.stair,C.corr,C.stair],
}

export default function FloorMap({ floor, startId, endId }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return
    seed = floor * 100

    const rooms = FLOOR_ROOMS[floor]
    const colors = FLOOR_COLORS[floor]
    let html = ''

    rooms.forEach((r, i) => {
      html += R(r[0], r[1], r[2], r[3], colors[i] ?? C.room)
    })

    // 외곽선
    seed = floor * 100 + 999
    const px = sx(0)+G, py = sy(54)+G
    const pw = sx(75)-sx(0)-G*2, ph = sy(0)-sy(54)-G*2
    html += `<path d="${sketchPath(px,py,pw,ph)}" fill="none" stroke="${INK}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`

    // 경로선
    if (startId && endId) {
      const result = findPath(startId, endId)
      if (result) {
        const { nodes } = getGraph()
        const floorNodes = result.path
          .map(id => nodes.get(id)!)
          .filter(n => n && n.floor === floor && !n.name.startsWith('_'))

        if (floorNodes.length >= 2) {
          let d = `M${sx(floorNodes[0].x).toFixed(1)},${sy(floorNodes[0].y).toFixed(1)}`
          floorNodes.slice(1).forEach(n => {
            d += ` L${sx(n.x).toFixed(1)},${sy(n.y).toFixed(1)}`
          })
          html += `<path d="${d}" fill="none" stroke="#f0c0c0" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" opacity="0.4"/>`
          html += `<path d="${d}" fill="none" stroke="#d03030" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="5 3" opacity="0.9"/>`

          // 출발 마커
          const s = floorNodes[0]
          html += `<circle cx="${sx(s.x)}" cy="${sy(s.y)}" r="5" fill="#d03030" stroke="white" stroke-width="1.5"/>`
          // 도착 마커
          const e = floorNodes[floorNodes.length-1]
          html += `<circle cx="${sx(e.x)}" cy="${sy(e.y)}" r="5" fill="#309030" stroke="white" stroke-width="1.5"/>`
        }
      }
    }

    svgRef.current.innerHTML = html
  }, [floor, startId, endId])

  return (
    <svg
      ref={svgRef}
      width="100%"
      viewBox={`0 0 ${VW} ${VH}`}
      style={{ display: 'block' }}
    />
  )
}