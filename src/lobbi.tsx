import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import './lobbi.css'

type Room = {
  id: number
  creator: number
  full: number
}

type Player = {
  id: number
  name: string
}

type LobbiProps = {
  onEnterRoom: (roomId: number, playerId: number, isCreator: number) => void
}

function Lobbi({ onEnterRoom }: LobbiProps) {
  const [rooms, setRooms] = useState<Room[]>([])
  const [creatorPlayers, setCreatorPlayers] = useState<Record<number, Player>>({})

  useEffect(() => {
    async function loadRoom() {
      const { data: roomsData, error: roomError } = await supabase
        .from('rooms')
        .select('id, creator, full')
        .order('id')

      if (roomError) {
        console.error(roomError.message)
        return
      }

      setRooms(roomsData)

      const creatorIds = roomsData.map((room) => room.creator)
      
      const { data: creatorData, error: creatorError } = await supabase
        .from('players')
        .select('id, name')
        .in('id', creatorIds)

      if (creatorError) {
        console.error(creatorError.message)
        return
      }

      const playersById = Object.fromEntries(
        creatorData.map((player) => [player.id, player]),
      )

      setCreatorPlayers(playersById)
    }

    loadRoom()
  }, [])

  async function createPlayer(name: string, roomId: number, command: number) {
    const { data, error } = await supabase
      .from('players')
      .insert({
        name,
        room: roomId,
        command: command
      })
      .select('id')
      .single()


    if (error) {
      console.error(error)
      return null
    }
    return data.id
  }

  async function createRoom(creatorId: number, firstCommand: string, secondCommand: string) {
    const { data, error } = await supabase
      .from('rooms')
      .insert({
        creator: creatorId,
        command_first: firstCommand,
        command_second: secondCommand,
        full: 0,
      })
      .select('id')
      .single()


    if (error) {
      console.error(error)
      return null
    }
    return data.id
  }

  async function closeRoom(roomId: number) {
    const { data, error } = await supabase
      .from('rooms')
      .update({ full: 1 })
      .eq('id', roomId)
      .select('id')
      .single()

    if (error) {
      console.error(error)
      return null
    }
    return data.id
  }


  const clickEnterButton = async (roomId: number) => {
    const name = document.querySelector<HTMLInputElement>(
      'input[name="playerName"]'
    )

    if (
      !name ||
      name.value.trim() === ''
    ) {
      alert('Ваш ник пуст')
      return
    }

    const playerId = await createPlayer(
      name.value,
      roomId, 
      2
    )

    await closeRoom(roomId)

    if (playerId !== null) {
      onEnterRoom(roomId, Number(playerId), 0)
    }
  }

  const createRoomClick = async () => {
    const name = document.querySelector<HTMLInputElement>('input[name="playerName"]',)
    const firstCommand = document.querySelector<HTMLInputElement>('input[name="firstCommandName"]',)
    const secondCommand = document.querySelector<HTMLInputElement>('input[name="secondCommandName"]',)

    if (
      !name ||
      name.value.trim() === '' || 
      !firstCommand ||
      firstCommand.value.trim() === '' || 
      !secondCommand ||
      secondCommand.value.trim() === ''
    ) {
      alert('Данные пусты')
      return
    }

    const roomId = await createRoom(
      1,
      firstCommand.value,
      secondCommand.value
    )

    const playerId = await createPlayer(
      name.value,
      roomId,
      1
    )

    await supabase
    .from('rooms')
    .update({ creatorId: playerId })
    .eq('id', roomId)

    if (playerId !== null) {
      onEnterRoom(roomId, Number(playerId), 1)
    }
  }

  const createRoomWindow = () => {
    const name = document.querySelector<HTMLInputElement>('input[name="playerName"]',)

    if ((!name || name.value.trim() == '')) {
      alert('Ваш ник пуст')
    }
    else {
      document.querySelector('.createRoomWindow')?.classList.add('active')
    }
  }

  const cancelCreateRoom = () => {
    document.querySelector('.createRoomWindow')?.classList.remove('active')
  }

  return (
    <div className='lobbi'>
      <div className="playerCard">
        <div className="playerSetting">
          <p>Ник:</p>
          <input name='playerName' />
        </div>
      </div>

      <h1>HEARTS OF IRON IV</h1>

      <div className='roomsCard'>
        {rooms
          .filter((room) => room.full === 0)
          .map((room) => {
            const creator = creatorPlayers[room.creator]
          
            return (
              <div className="roomCard" key={room.id}>
                <p>Номер комнаты: {room.id}</p>
                <p>Создатель: {creator?.name ?? 'Имени нет'}</p>
                <button
                  className="enterButton"
                  onClick={() => clickEnterButton(room.id)}
                >
                  Войти
                </button>
              </div>
            )
          })}
        <div className='createRoomContainer'>
          <button className='createRoom' onClick={createRoomWindow}>Создать комнату</button>
        </div>
      </div>

      <div className='createRoomWindow'>
        <div className='createRoomContainer'>
          <div className='commandsContainer'>
            <div className='firstCommand'>
              <p>Команда А</p>
              <input name='firstCommandName'/>
            </div>
            <div className='secondCommand'>
              <p>Команда Б</p>
              <input name='secondCommandName'/></div>
            </div>
          <div className='createRoomButtons'>
            <button className='createRoomButton cancel' onClick={cancelCreateRoom}>Отмена</button>
            <button className='createRoomButton' onClick={createRoomClick}>Создать комнату</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Lobbi
