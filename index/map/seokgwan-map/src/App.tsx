import { useState } from 'react'
import FloorMap from './components/FloorMap.tsx'
import FloorTabs from './components/FloorTabs.tsx'
import SearchBar from './components/SearchBar.tsx'
import type { Floor, TravelMode } from './schoolGraph.ts'

function App() {
  const params = new URLSearchParams(window.location.search)
  const initialFloor = Number(params.get('floor')) as Floor
  const [currentFloor, setCurrentFloor] = useState<Floor>(initialFloor || 1)
  const [startId, setStartId] = useState('')
  const [endId, setEndId] = useState('')
  const [travelMode, setTravelMode] = useState<TravelMode>('stairsOnly')

  function handleStartChange(id: string) {
    setStartId(id)
    const floor = Number(id.split('__')[0]) as Floor
    if (floor) setCurrentFloor(floor)
  }

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      color: '#6A635D',
      fontFamily: "'온글잎 의연체', sans-serif",
      position: 'relative',
      overflowY: 'auto',
    }}>
      <div style={{
        width: '100%',
        background: '#FFF3F3',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.8vh 6vw',
        boxSizing: 'border-box',
        position: 'relative',
      }}>
        <img
          src="./back.png"
          alt="뒤로가기"
          style={{ width: '7vw', height: '3.5vh', cursor: 'pointer', objectFit: 'contain' }}
          onClick={() => { window.history.back() }}
        />
        <span style={{ fontSize: '5vw', color: '#6A635D', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
          석관고등학교 길찾기
        </span>
      </div>

      <div style={{
        width: '88vw',
        maxWidth: '100%',
        aspectRatio: '370 / 237',
        margin: '4vh auto 0',
        overflow: 'hidden',
        borderRadius: '2vw',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <FloorMap floor={currentFloor} startId={startId} endId={endId} travelMode={travelMode} />
      </div>

      <FloorTabs currentFloor={currentFloor} onChange={setCurrentFloor} />

      <SearchBar
        startId={startId}
        endId={endId}
        travelMode={travelMode}
        onStartChange={handleStartChange}
        onEndChange={setEndId}
        onTravelModeChange={setTravelMode}
      />

      <div style={{
        width: '100%',
        background: '#FFF3F3',
        marginTop: 'auto',
        minHeight: '6vh',
        padding: '0.8vh 6vw',
        boxSizing: 'border-box',
      }} />
    </div>
  )
}

export default App
