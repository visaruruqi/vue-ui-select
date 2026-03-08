export interface Person {
  id: number
  name: string
  email: string
  age: number
  country: string
  status?: 'active' | 'inactive'
}

export const people: Person[] = [
  { id: 1, name: 'Adam', email: 'adam@email.com', age: 12, country: 'United States' },
  { id: 2, name: 'Amalie', email: 'amalie@email.com', age: 12, country: 'Argentina' },
  { id: 3, name: 'Estefanía', email: 'estefania@email.com', age: 21, country: 'Argentina' },
  { id: 4, name: 'Adrian', email: 'adrian@email.com', age: 21, country: 'Ecuador' },
  { id: 5, name: 'Wladimir', email: 'wladimir@email.com', age: 30, country: 'Ecuador' },
  { id: 6, name: 'Samantha', email: 'samantha@email.com', age: 30, country: 'United States' },
  { id: 7, name: 'Nicole', email: 'nicole@email.com', age: 43, country: 'Colombia' },
  { id: 8, name: 'Natasha', email: 'natasha@email.com', age: 54, country: 'Ecuador' },
  { id: 9, name: 'Michael', email: 'michael@email.com', age: 15, country: 'Colombia' },
  { id: 10, name: 'Nicolás', email: 'nicolas@email.com', age: 43, country: 'Colombia' },
  { id: 11, name: 'Daniel', email: 'daniel@email.com', age: 32, country: 'United States' },
  { id: 12, name: 'Sarah', email: 'sarah@email.com', age: 28, country: 'United States' },
  { id: 13, name: 'Carlos', email: 'carlos@email.com', age: 35, country: 'Argentina' },
  { id: 14, name: 'Maria', email: 'maria@email.com', age: 26, country: 'Colombia' },
  { id: 15, name: 'Diego', email: 'diego@email.com', age: 41, country: 'Ecuador' },
]

export const peopleObj: Record<string, Omit<Person, 'id'>> = Object.fromEntries(
  people.map((p) => [
    `person-${p.id}`,
    { name: p.name, email: p.email, age: p.age, country: p.country },
  ])
)

export const colors: string[] = [
  'Red', 'Green', 'Blue', 'Yellow', 'Magenta', 'Maroon', 'Umbra', 'Turquoise',
  'Orange', 'Purple', 'Pink', 'Cyan', 'Teal', 'Lime', 'Indigo',
]

export const tags: string[] = [
  'JavaScript', 'TypeScript', 'Vue', 'React', 'Angular', 'Svelte',
  'Node.js', 'Deno', 'Bun', 'Vite', 'Webpack', 'Rollup',
]

/**
 * Simulate async remote search with a configurable delay.
 */
export function searchPeopleAsync(
  query: string,
  delay = 500
): Promise<Person[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!query) {
        resolve([])
        return
      }
      const lq = query.toLowerCase()
      resolve(
        people.filter(
          (p) =>
            p.name.toLowerCase().includes(lq) ||
            p.email.toLowerCase().includes(lq)
        )
      )
    }, delay)
  })
}
