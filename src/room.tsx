import { useEffect, useState } from 'react'
import './room.css'
import { countries } from '../data/countries'
import { getCountryNames } from '../data/countries'
import { supabase } from './lib/supabase'

type RoomProps = {
  roomId: number
  playerId: number
  isCreator: number
  onLeave: () => void
}

type RoomPlayer = {
  id: number
  name: string
  countries: string | null
  banned: string | null
  command: number
  isActive: number
}

function Room({ roomId, playerId, isCreator, onLeave }: RoomProps) {
  const [commands, setCommands] = useState<string[]>([])
  const [roomPlayers, setRoomPlayers] = useState<RoomPlayer[]>([])
  const [choosenCountries, setChoosenCountries] = useState<number[]>([])
  const [choosenTick, setChoosenTick] = useState<number>(1)
  const [isStarted, setIsStarted] = useState<number>(0)

  useEffect(() => {
    let isMounted = true

    async function loadCommands() {
      if (!roomId) {
        if (isMounted) {
          setRoomPlayers([])
        }
        return
      }

      const { data: commands, error: commandsError } = await supabase
        .from('rooms')
        .select('command_first, command_second')
        .eq('id', roomId)
        .single()

      if (commandsError) {
        console.error('Ошибка загрузки игроков комнаты:', commandsError.message)

        if (isMounted) {
          setRoomPlayers([])
        }

        return
      }

      const commandsNew = [commands.command_first, commands.command_second,].filter(Boolean)

      setCommands(commandsNew)
    }

    async function loadRoomPlayers() {
      if (!roomId) {
        if (isMounted) {
          setRoomPlayers([])
        }
        return
      }

      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select('id, name, command, countries, banned, isActive')
        .eq('room', roomId)

      if (playersError) {
        console.error(
          'Ошибка загрузки игроков комнаты:',
          playersError.message,
        )

        if (isMounted) {
          setRoomPlayers([])
        }

        return
      }

      if (isMounted) {
        setRoomPlayers(playersData ?? [])
      }
    }

    async function loadChoosenCountries() {
      const { data: players, error } = await supabase
        .from('players')
        .select('countries, banned')
        .eq('room', roomId)
      if (error) {
        console.error(error)
        return []
      }

      const result: number[] = []
      for (const player of players) {
        for (const field of [player.countries, player.banned]) {
          if (!field) continue
        
          // "1,2,3" → [1, 2, 3]
          const ids = String(field)
            .split(',')
            .map(s => s.trim())
            .filter(s => s !== '')
            .map(Number)
            .filter(n => !isNaN(n))
          if (ids) result.push(...ids)
        }
      }
    
      setChoosenCountries([...new Set(result)])
    }

    loadChoosenCountries()
    loadCommands()
    loadRoomPlayers()
    const intervalId = window.setInterval(() => {
      loadRoomPlayers()
      loadChoosenCountries()
    }, 100)
    return () => {
      isMounted = false
      window.clearInterval(intervalId)
    }
  }, [roomId, supabase])

  const startClick = async () => {
    await supabase
      .from('players')
      .update({ isActive: 1 })
      .eq('id', playerId)

    setIsStarted(1)
  }

  const countryClick = async (country: number) => {
    if (choosenTick === 1) {
      let current = ''
      const { data: player, error} = await supabase
        .from('players')
        .select('banned')
        .eq('id', playerId)
        .single()

      if (error) {
        console.error(error)
        return []
      }

      if (player){
        current = player.banned
      }

      const updated = `${current},${country}`

      const { error: updateError } = await supabase
        .from('players')
        .update({ banned: updated })
        .eq('id', playerId)
          
      if (updateError) {
        console.error('Ошибка обновления banned:', error)
      }

      setChoosenTick(2)

      const { data, error: getSecondPlayerError } = await supabase
        .from('players')
        .select('id')
        .eq('room', roomId)
        .neq('id', playerId)
        .limit(1)
        .maybeSingle()

      if (getSecondPlayerError) {
        console.error(error)
        return
      }

      const secondPlayerId = data?.id ?? null

      await supabase
        .from('players')
        .update({ isActive: 0 })
        .eq('id', playerId)

      await supabase
      .from('players')
      .update({ isActive: 1 })
      .eq('id', secondPlayerId)
    }
    if (choosenTick === 2) {
      let current = ''
      const { data: player, error} = await supabase
        .from('players')
        .select('countries')
        .eq('id', playerId)
        .single()

      if (error) {
        console.error(error)
        return []
      }
      
      if (player){
        current = player.countries
      }
    
      const updated = `${current},${country}`

      const { error: updateError } = await supabase
        .from('players')
        .update({ countries: updated })
        .eq('id', playerId)
          
      if (updateError) {
        console.error('Ошибка обновления countries:', error)
      }

      
      setChoosenTick(1)

      const { data, error: getSecondPlayerError } = await supabase
        .from('players')
        .select('id')
        .eq('room', roomId)
        .neq('id', playerId)
        .limit(1)
        .maybeSingle()

      if (getSecondPlayerError) {
        console.error(error)
        return
      }

      const secondPlayerId = data?.id ?? null

      await supabase
        .from('players')
        .update({ isActive: 0 })
        .eq('id', playerId)

      await supabase
      .from('players')
      .update({ isActive: 1 })
      .eq('id', secondPlayerId)
    }
  }

  const onLeaveClick = async () => {
    await supabase
      .from('rooms')
      .update({ full: 0 })
      .eq('id', roomId)

    await supabase
      .from('players')
      .delete()
      .eq('id', playerId)

    if (isCreator == 1) {
      await supabase
      .from('players')
      .delete()
      .eq('room', roomId)

      await supabase
        .from('rooms')
        .delete()
        .eq('id', roomId)
    }
    onLeave()
  }

  return (
    <div className="roomPage">
      <header className="roomHeader">
        <h1>Комната №{roomId}</h1>
        {choosenTick === 1 ? <p>Выбирай страну, которую хочешь ЗАБАНИТЬ</p> : <p>Выбирай страну, которую хочешь ВЫБРАТЬ</p>}
        <div>
          {isCreator == 1 && (<button className={`startButton ${isStarted === 1 ? 'hidden' : ''}`} onClick={startClick}>Начать</button>)}
          <button className='cancelButton' onClick={onLeaveClick}>Вернуться в лобби</button>
        </div>
      </header>

      <main className="roomMain">
        <section className="roomSide roomSideLeft">
          <h2>Игроки команды {commands[0]}</h2>
          <ul className="roomPlayersList">
            {roomPlayers.map((player) =>
              player.command === 1 ? (
                <li key={player.id} className="roomPlayerCard">
                  <strong>{player.name}</strong>
                  <span>Страны: {getCountryNames(player.countries).join(', ') || 'не выбрано'}</span>
                  <span>Забанены: {getCountryNames(player.banned).join(', ') || 'не выбрано'}</span>
                </li>
              ) : null
            )}
          </ul>
        </section>
        <section className="roomCenter">
          <div className="countryButtons">
            {countries.map((country) => {
              const me = roomPlayers.find(p => p.id === playerId)
              const isMyTurn = me?.isActive === 1
              const isTaken = choosenCountries.includes(country.id)
                        
              return (
                <button
                  key={country.id}
                  className="countryButton"
                  disabled={!isMyTurn || isTaken}
                  onClick={() => countryClick(country.id)}
                >
                  {country.name}
                </button>
              )
            })}
          </div>
        </section>
        <section className="roomSide roomSideRight">
          <h2>Игроки команды {commands[1]}</h2>
          <ul className="roomPlayersList">
              {roomPlayers.map((player) => 
                player.command === 2 ? (
                  <li key={player.id} className="roomPlayerCard">
                    <strong>{player.name}</strong>
                    <span>Страна: {getCountryNames(player.countries).join(', ') || 'не выбрано'}</span>
                    <span>Забанены: {getCountryNames(player.banned).join(', ') || 'не выбрано'}</span>
                  </li>
                ) : null
              )}
            </ul>
          </section>
      </main>
    </div>
  )
}

export default Room
