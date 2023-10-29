import { existsSync, readFileSync, writeFileSync } from 'fs'

export const createMapHelper = <K, V>(filePath: string) => ({
  load: () => reloadMap<K, V>(filePath),
  save: (map: Map<K, V>) => saveMap(filePath, map),
})
export const reloadMap = <K, V>(filePath: string) => {
  if (!existsSync(filePath)) {
    return new Map<K, V>()
  }

  return stringToMap<K, V>(readFileSync(filePath, 'utf8'))
}
export const saveMap = (filePath: string, map: Map<any, any>) =>
  writeFileSync(filePath, mapToString(map))

export const mapToString = (map: Map<any, any>) =>
  JSON.stringify([...map.entries()], null, 2)

export const stringToMap = <K, V>(str: string) => new Map<K, V>(JSON.parse(str))
