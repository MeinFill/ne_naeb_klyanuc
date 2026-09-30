// countries.ts

export type Country = {
  id: number
  name: string
}

export const countries: Country[] = [
  { id: 1,  name: 'Австралия' },
  { id: 2,  name: 'Австрия' },
  { id: 3,  name: 'Афганистан' },
  { id: 4,  name: 'Албания' },
  { id: 5,  name: 'Аргентина' },
  { id: 6,  name: 'Аусса' },
  { id: 7,  name: 'Бельгия' },
  { id: 8,  name: 'Бельгийское Конго' },
  { id: 9,  name: 'Болгария' },
  { id: 10, name: 'Боливия' },
  { id: 11, name: 'Бразилия' },
  { id: 12, name: 'Британская Бирма' },
  { id: 13, name: 'Британская Индия' },
  { id: 14, name: 'Британская Малайя' },
  { id: 15, name: 'Бутан' },
  { id: 16, name: 'Великобритания' },
  { id: 17, name: 'Венесуэла' },
  { id: 18, name: 'Венгрия' },
  { id: 19, name: 'Гаити' },
  { id: 20, name: 'Гватемала' },
  { id: 21, name: 'Германский рейх' },
  { id: 22, name: 'Голландская Ост-Индия' },
  { id: 23, name: 'Гондурас' },
  { id: 24, name: 'Греция' },
  { id: 25, name: 'Гуанси' },
  { id: 26, name: 'Дания' },
  { id: 27, name: 'Доминиканская Республика' },
  { id: 28, name: 'Доминион Канада' },
  { id: 29, name: 'Ирак' },
  { id: 30, name: 'Ирландия' },
  { id: 31, name: 'Испания' },
  { id: 32, name: 'Исландия' },
  { id: 33, name: 'Италия' },
  { id: 34, name: 'Йемен' },
  { id: 35, name: 'Китай' },
  { id: 36, name: 'Колумбия' },
  { id: 37, name: 'Коммунистический Китай' },
  { id: 38, name: 'Коста-Рика' },
  { id: 39, name: 'Куба' },
  { id: 40, name: 'Латвия' },
  { id: 41, name: 'Либерия' },
  { id: 42, name: 'Литва' },
  { id: 43, name: 'Люксембург' },
  { id: 44, name: 'Маньчжоу-го' },
  { id: 45, name: 'Мексика' },
  { id: 46, name: 'Мэнцзян' },
  { id: 47, name: 'Монголия' },
  { id: 48, name: 'Непал' },
  { id: 49, name: 'Нидерланды' },
  { id: 50, name: 'Никарагуа' },
  { id: 51, name: 'Новая Зеландия' },
  { id: 52, name: 'Норвегия' },
  { id: 53, name: 'Оман' },
  { id: 54, name: 'Панама' },
  { id: 55, name: 'Парагвай' },
  { id: 56, name: 'Персия' },
  { id: 57, name: 'Перу' },
  { id: 58, name: 'Польша' },
  { id: 59, name: 'Португалия' },
  { id: 60, name: 'Румыния' },
  { id: 61, name: 'Саудовская Аравия' },
  { id: 62, name: 'Сиам' },
  { id: 63, name: 'Сибэй сань ма' },
  { id: 64, name: 'Синьцзян' },
  { id: 65, name: 'Советский Союз' },
  { id: 66, name: 'Соединённые Штаты' },
  { id: 67, name: 'Танну-Тува' },
  { id: 68, name: 'Тибет' },
  { id: 69, name: 'Турция' },
  { id: 70, name: 'Уругвай' },
  { id: 71, name: 'Филиппины' },
  { id: 72, name: 'Финляндия' },
  { id: 73, name: 'Франция' },
  { id: 74, name: 'Чехословакия' },
  { id: 75, name: 'Чили' },
  { id: 76, name: 'Шаньси' },
  { id: 77, name: 'Швейцария' },
  { id: 78, name: 'Швеция' },
  { id: 79, name: 'Эквадор' },
  { id: 80, name: 'Эль-Сальвадор' },
  { id: 81, name: 'Эстония' },
  { id: 82, name: 'Эфиопия' },
  { id: 83, name: 'Югославия' },
  { id: 84, name: 'Южная Африка' },
  { id: 85, name: 'Юньнань' },
  { id: 86, name: 'Япония' },
]

export const getCountryById = (id: number): Country | undefined =>
  countries.find(c => c.id === id)

// "3,17,65" → [3, 17, 65]
export const parseCountryIds = (raw: string | null | undefined): number[] => {
  if (!raw) return []
  return raw
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .map(Number)
    .filter(n => !isNaN(n))
}

// "3,17,65" → ['Италия', 'Германия', 'Япония']
export const getCountryNames = (raw: string | null | undefined): string[] => {
  return parseCountryIds(raw)
    .map(id => getCountryById(id)?.name)
    .filter((name): name is string => Boolean(name))
}