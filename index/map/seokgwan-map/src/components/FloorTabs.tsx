type Floor = 1 | 2 | 3 | 4

interface Props {
  currentFloor: Floor
  onChange: (floor: Floor) => void
}

export default function FloorTabs({ currentFloor, onChange }: Props) {
  const floors: Floor[] = [1, 2, 3, 4]

  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
      {floors.map((f) => (
        <button
          key={f}
          onClick={() => onChange(f)}
          style={{
            flex: 1,
            padding: '8px 0',
            borderRadius: 10,
            border: '2px solid #c8b8b8',
            background: currentFloor === f ? '#fff0f0' : '#fff',
            color: currentFloor === f ? '#903030' : '#666',
            fontWeight: currentFloor === f ? 600 : 400,
            cursor: 'pointer',
            fontSize: 15,
          }}
        >
          {f}층
        </button>
      ))}
    </div>
  )
}