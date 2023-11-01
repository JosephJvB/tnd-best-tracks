import { readFileSync } from 'fs'

// wrap readFileSync
// jest has issues mocking readFile in some cases.
export const loadJsonFile = <T>(filePath: string): T =>
  JSON.parse(readFileSync(filePath, 'utf-8'))
