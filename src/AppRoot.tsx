import { useState } from 'react'
import Lobbi from './lobbi'
import Room from './room'

function AppRoot() {
  const [roomId, setRoomId] = useState<number | null>(null)
  const [playerId, setPlayerId] = useState<number | null>(null)
  const [isCreator, setIsCreator] = useState<number | null>(null)

  const onEnterRoom = (roomId: number, playerId: number, isCreator:number) => {
    setRoomId(roomId)
    setPlayerId(playerId)
    setIsCreator(isCreator)
  }

  if (roomId !== null && playerId !== null && isCreator !== null) {
    return (
      <Room
        roomId={roomId}
        playerId={playerId}
        isCreator={isCreator}
        onLeave={() => {
          setRoomId(null)
          setPlayerId(null)
          setIsCreator(null)
        }}
      />
    )
  }

  return <Lobbi onEnterRoom={onEnterRoom} />
}


export default AppRoot
