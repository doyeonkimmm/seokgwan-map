import { useState } from 'react'
import FloorMap from './components/FloorMap.tsx'
import FloorTabs from './components/FloorTabs.tsx'
import SearchBar from './components/SearchBar.tsx'

function App() {
  const [currentFloor, setCurrentFloor] = useState<1|2|3|4>(1)
  const [startId, setStartId] = useState<string>('')
  const [endId, setEndId] = useState<string>('')

  function handleStartChange(id: string) {
    setStartId(id)
    // 출발지 층으로 자동 이동
    const floor = Number(id.split('__')[0]) as 1|2|3|4
    if (floor) setCurrentFloor(floor)
  }

  return (
    <div style={{ maxWidth: 390, margin: '0 auto', padding: 16 }}>
      <div style={{ width: '100%', aspectRatio: '750/480', background: '#fff', border: '1px solid #ccc', borderRadius: 8, overflow: 'hidden' }}>
        <FloorMap
          floor={currentFloor}
          startId={startId}
          endId={endId}
        />
      </div>

      <FloorTabs currentFloor={currentFloor} onChange={setCurrentFloor} />

      <SearchBar
        startId={startId}
        endId={endId}
        onStartChange={handleStartChange}
        onEndChange={setEndId}
      />
    </div>
  )
}

export default App