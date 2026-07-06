import { useState } from 'react'
import { findPath, generateDirections, getGraph } from '../schoolGraph'
import type { Floor, TravelMode } from '../schoolGraph'

interface Props {
  startId: string
  endId: string
  travelMode: TravelMode
  onStartChange: (id: string) => void
  onEndChange: (id: string) => void
  onTravelModeChange: (mode: TravelMode) => void
}

const font = "'온글잎 의연체', sans-serif"

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '1vh 3vw',
  borderRadius: '2vw',
  border: '1.5px solid #c9a8a8',
  fontFamily: font,
  fontSize: '5vw',
  color: '#6A635D',
  background: '#fff',
  boxSizing: 'border-box',
  outline: 'none',
}

const listStyle: React.CSSProperties = {
  maxHeight: '20vh',
  overflowY: 'auto',
  background: '#fff',
  border: '1.5px solid #c9a8a8',
  borderRadius: '2vw',
  marginTop: '1vh',
  padding: '1vh',
}

const listBtnStyle: React.CSSProperties = {
  width: '100%',
  textAlign: 'left',
  padding: '1vh 2vw',
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  fontFamily: font,
  fontSize: '4.5vw',
  color: '#6A635D',
}

const travelModes: { mode: TravelMode; label: string }[] = [
  { mode: 'both', label: '엘리베이터+계단' },
  { mode: 'stairsOnly', label: '계단' },
  { mode: 'elevatorOnly', label: '엘리베이터' },
]

export default function SearchBar({
  startId,
  endId,
  travelMode,
  onStartChange,
  onEndChange,
  onTravelModeChange,
}: Props) {
  const [startName, setStartName] = useState('')
  const [endName, setEndName] = useState('')
  const [directions, setDirections] = useState<string[]>([])
  const [error, setError] = useState('')
  const [showStartList, setShowStartList] = useState(false)
  const [showEndList, setShowEndList] = useState(false)
  const [activeInput, setActiveInput] = useState<'start' | 'end' | null>(null)

  const { nodes } = getGraph({ travelMode })
  const allNodes = Array.from(nodes.values()).filter(n => !n.name.startsWith('_'))
  const filteredStart = allNodes.filter(n => n.name.includes(startName) && startName.length > 0)
  const filteredEnd = allNodes.filter(n => n.name.includes(endName) && endName.length > 0)

  function selectStart(id: string, name: string, floor: Floor) {
    setStartName(`${name} (${floor}층)`)
    onStartChange(id)
    setShowStartList(false)
    setActiveInput(null)
    setError('')
  }

  function selectEnd(id: string, name: string, floor: Floor) {
    setEndName(`${name} (${floor}층)`)
    onEndChange(id)
    setShowEndList(false)
    setActiveInput(null)
    setError('')
  }

  function runSearch(mode = travelMode) {
    setError('')
    setDirections([])
    if (!startId || !endId) {
      setError('출발지와 목적지를 모두 선택해주세요.')
      return
    }
    if (startId === endId) {
      setError('출발지와 목적지가 같습니다.')
      return
    }
    const result = findPath(startId, endId, { travelMode: mode })
    if (!result) {
      const message = mode === 'elevatorOnly'
        ? '엘리베이터만으로는 갈 수 없는 공간입니다. 학교 구조상 계단으로만 연결된 구역일 수 있어요.'
        : '경로를 찾을 수 없습니다.'
      setError(message)
      return
    }
    setDirections(generateDirections(result, { travelMode: mode }))
  }

  function changeMode(mode: TravelMode) {
    onTravelModeChange(mode)
    if (startId && endId) runSearch(mode)
  }

  return (
    <div style={{ width: '88vw', margin: '4vh auto 0' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1vh' }}>
        <img src="./stof.png" alt="경로" style={{ width: '70vw', display: 'block', margin: '0 auto' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '70vw' }}>
          <button type="button" onClick={() => setActiveInput(activeInput === 'start' ? null : 'start')} style={{
            fontFamily: font,
            fontSize: '5vw',
            color: startId ? '#9a5050' : '#6A635D',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textDecoration: 'underline wavy #c9a8a8',
            textUnderlineOffset: '0.5vh',
            textDecorationThickness: '1.5px',
            padding: '0 3vw',
          }}>
            {startName || '출발지'}
          </button>
          <button type="button" onClick={() => setActiveInput(activeInput === 'end' ? null : 'end')} style={{
            fontFamily: font,
            fontSize: '5vw',
            color: endId ? '#9a5050' : '#6A635D',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textDecoration: 'underline wavy #c9a8a8',
            textUnderlineOffset: '0.5vh',
            textDecorationThickness: '1.5px',
            padding: '0 3vw',
          }}>
            {endName || '목적지'}
          </button>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1.5vw',
        marginTop: '3vh',
      }}>
        {travelModes.map(({ mode, label }) => {
          const active = travelMode === mode
          return (
            <button key={mode} type="button" onClick={() => changeMode(mode)} style={{
              minHeight: '6vh',
              borderRadius: '2vw',
              border: `1.5px solid ${active ? '#9a5050' : '#c9a8a8'}`,
              background: active ? '#FFF3F3' : '#fff',
              color: active ? '#9a5050' : '#6A635D',
              fontFamily: font,
              cursor: 'pointer',
              padding: '0.8vh 1vw',
            }}>
              <span style={{ display: 'block', fontSize: '3.8vw', lineHeight: 1.15, wordBreak: 'keep-all' }}>{label}</span>
            </button>
          )
        })}
      </div>

      {activeInput === 'start' && (
        <div style={{ marginTop: '4.3vh' }}>
          <input
            autoFocus
            value={startName}
            onChange={(e) => { setStartName(e.target.value); setShowStartList(true) }}
            placeholder="출발지명을 입력하세요"
            style={inputStyle}
          />
          {showStartList && filteredStart.length > 0 && (
            <div style={listStyle}>
              {filteredStart.map((node) => (
                <button key={node.id} type="button" onClick={() => selectStart(node.id, node.name, node.floor)} style={listBtnStyle}>
                  {node.name} ({node.floor}층)
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {activeInput === 'end' && (
        <div style={{ marginTop: '4.3vh' }}>
          <input
            autoFocus
            value={endName}
            onChange={(e) => { setEndName(e.target.value); setShowEndList(true) }}
            placeholder="목적지명을 입력하세요"
            style={inputStyle}
          />
          {showEndList && filteredEnd.length > 0 && (
            <div style={listStyle}>
              {filteredEnd.map((node) => (
                <button key={node.id} type="button" onClick={() => selectEnd(node.id, node.name, node.floor)} style={listBtnStyle}>
                  {node.name} ({node.floor}층)
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <button type="button" onClick={() => runSearch()} style={{
        width: '100%',
        marginTop: '3.5vh',
        padding: '1.5vh 0',
        borderRadius: '2vw',
        border: '1.5px solid #c9a8a8',
        background: '#FFF3F3',
        color: '#6A635D',
        fontFamily: font,
        fontSize: '5vw',
        cursor: 'pointer',
      }}>
        경로 찾기
      </button>

      {error && <div style={{ color: '#b94040', fontSize: '4vw', marginTop: '1vh' }}>{error}</div>}

      {directions.length > 0 && (
        <div style={{
          background: '#FFF3F3',
          border: '1.5px solid #c9a8a8',
          borderRadius: '2vw',
          padding: '2vh 4vw',
          marginTop: '3.5vh',
          marginBottom: '3.5vh',
        }}>
          <strong style={{ fontSize: '5vw', color: '#6A635D' }}>안내</strong>
          <ol style={{ marginTop: '1vh', paddingLeft: '5vw' }}>
            {directions.map((line, index) => (
              <li key={index} style={{ marginBottom: '1vh', fontSize: '4vw', color: '#6A635D' }}>{line}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
