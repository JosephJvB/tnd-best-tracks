import fs from 'fs'
import { fileHelper } from '../fileApi'

const genNumbers1 = (limit: number, saveFn: (next: number[]) => void) => {
  for (let i = 0; i < limit; i++) {
    saveFn([Math.floor(Math.random() * 10)])
  }
}
const genNumbers2 = (limit: number, saveFn: (next: number[]) => void) => {
  const temp: number[] = []
  for (let i = 0; i < limit; i++) {
    temp.push(Math.floor(Math.random() * 10))
  }
  saveFn(temp)
}

describe('fileApi.ts', () => {
  // NOTE: mocking readFile apis does not work
  // jest uses these internally
  // but this is ok
  const writeFileSpy = jest
    .spyOn(fs, 'writeFileSync')
    .mockImplementation(jest.fn())

  describe('array scope', () => {
    it('adds items and calls writeFile', () => {
      const { list, saveFn } = fileHelper<number>('./test.json')

      genNumbers1(10, saveFn)

      expect(list.length).toBe(10)
      expect(writeFileSpy).toBeCalledTimes(10)

      genNumbers2(10, saveFn)

      expect(list.length).toBe(20)
      expect(writeFileSpy).toBeCalledTimes(11)

      genNumbers1(5, saveFn)
      genNumbers2(5, saveFn)

      expect(list.length).toBe(30)
      expect(writeFileSpy).toBeCalledTimes(17)
    })
  })
})
