import type { Floor } from '../schoolGraph'

interface Props {
  currentFloor: Floor
  onChange: (floor: Floor) => void
}

export default function FloorTabs({ currentFloor, onChange }: Props) {
  const floors: Floor[] = [1, 2, 3, 4]

  return (
    <div style={{
      display: 'flex',
      gap: '2vw',
      margin: '5vh auto 0',
      width: '88vw',
      justifyContent: 'center',
    }}>
      {floors.map((f) => (
        <button
          key={f}
          onClick={() => onChange(f)}
          style={{
            width: '25vw',
            height: '5.5vh',
            border: 'none',
            fontFamily: "'온글잎 의연체', sans-serif",
            fontSize: '7vw',
            color: currentFloor === f ? '#9a5050' : '#6A635D',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundImage: "url('./1f.png')",
            backgroundSize: '100% 100%',
            backgroundColor: 'transparent',
            opacity: currentFloor === f ? 1 : 0.6,
          }}
        >
          {f}층
        </button>
      ))}
    </div>
  )
}
