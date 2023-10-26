import { writeFileSync } from 'fs'

export const fileHelper = <T>(filePath: string) => {
  const list: T[] = []
  return {
    list,
    saveFn: (nextItems: T[]) => {
      list.push(...nextItems)
      writeFileSync(filePath, JSON.stringify(list, null, 2))
    },
  }
}
