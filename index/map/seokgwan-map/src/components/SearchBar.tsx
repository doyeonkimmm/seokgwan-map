import { useState } from 'react'
import { getGraph, findPath, generateDirections } from '../schoolGraph'
import type { Floor } from '../schoolGraph'

interface Props {
  startId: string
  endId: string
  onStartChange: (id: string) => void
  onEndChange: (id: string) => void
}

export default function SearchBar({ startId, endId, onStartChange, onEndChange }: Props) {
  const [startName, setStartName] = useState('')
  const [endName, setEndName] = useState('')
  const [directions, setDirections] = useState<string[]>([])
  const [error, setError] = useState('')
  const [showStartList, setShowStartList] = useState(false)
  const [showEndList, setShowEndList] = useState(false)

  const { nodes } = getGraph()

  // 가상 노드 제외한 전체 시설 목록
  const allNodes = Array.from(nodes.values()).filter(
    n => !n.name.startsWith('_')
  )

  // 검색어로 필터링
  const filteredStart = allNodes.filter(
    n => n.name.includes(startName) && startName.length > 0
  )
  const filteredEnd = allNodes.filter(
    n => n.name.includes(endName) && endName.length > 0
  )

  function selectStart(id: string, name: string, floor: Floor) {
    setStartName(`${name} (${floor}층)`)
    onStartChange(id)
    setShowStartList(false)
    setError('')
  }

  function selectEnd(id: string, name: string, floor: Floor) {
    setEndName(`${name} (${floor}층)`)
    onEndChange(id)
    setShowEndList(false)
    setError('')
  }

  function handleSearch() {
    setError('')
    setDirections([])

    if (!startId || !endId) {
      setError('출발지와 도착지를 모두 선택해주세요.')
      return
    }

    if (startId === endId) {
      setError('출발지와 도착지가 같습니다.')
      return
    }

    const result = findPath(startId, endId)
    if (!result) {
      setError('경로를 찾을 수 없습니다.')
      return
    }

    setDirections(generateDirections(result))
  }

  return (
    <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
      <div>
        <label style={{ display: 'block', marginBottom: 6 }}>출발지</label>
        <input
          value={startName}
          onChange={(e) => {
            setStartName(e.target.value)
            setShowStartList(true)
          }}
          onFocus={() => setShowStartList(true)}
          placeholder="출발지명을 입력하세요"
          style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
        />
        {showStartList && filteredStart.length > 0 && (
          <div style={{ maxHeight: 200, overflowY: 'auto', background: '#fff', border: '1px solid #ccc', borderRadius: 8, marginTop: 8, padding: 8 }}>
            {filteredStart.map((node) => (
              <button
                key={node.id}
                type="button"
                onClick={() => selectStart(node.id, node.name, node.floor)}
                style={{
                  width: '100%', textAlign: 'left', padding: 8, border: 'none', background: 'transparent', cursor: 'pointer'
                }}
              >
                {node.name} ({node.floor}층)
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: 6 }}>도착지</label>
        <input
          value={endName}
          onChange={(e) => {
            setEndName(e.target.value)
            setShowEndList(true)
          }}
          onFocus={() => setShowEndList(true)}
          placeholder="도착지명을 입력하세요"
          style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
        />
        {showEndList && filteredEnd.length > 0 && (
          <div style={{ maxHeight: 200, overflowY: 'auto', background: '#fff', border: '1px solid #ccc', borderRadius: 8, marginTop: 8, padding: 8 }}>
            {filteredEnd.map((node) => (
              <button
                key={node.id}
                type="button"
                onClick={() => selectEnd(node.id, node.name, node.floor)}
                style={{
                  width: '100%', textAlign: 'left', padding: 8, border: 'none', background: 'transparent', cursor: 'pointer'
                }}
              >
                {node.name} ({node.floor}층)
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleSearch}
        style={{ padding: 10, borderRadius: 8, border: 'none', background: '#1d4ed8', color: '#fff', cursor: 'pointer' }}
      >
        경로 찾기
      </button>

      {error && <div style={{ color: '#b91c1c', fontSize: 14 }}>{error}</div>}

      {directions.length > 0 && (
        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
          <strong>안내</strong>
          <ol style={{ marginTop: 8, paddingLeft: 18 }}>
            {directions.map((line, index) => (
              <li key={index} style={{ marginBottom: 6 }}>{line}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
