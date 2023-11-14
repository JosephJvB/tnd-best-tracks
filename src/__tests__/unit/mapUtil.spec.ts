import { mapToString, stringToMap } from '../../mapUtil'

describe('unit/mapUtil.ts', () => {
  describe('#mapToString', () => {
    it('throws if the input is not a map', () => {
      const input = {}

      expect(() => {
        mapToString(input as any)
      }).toThrow()
    })

    it('saves a map as string value', () => {
      const input = new Map<any, any>([
        [1, 'a'],
        [2, true],
        [
          3,
          {
            x: true,
          },
        ],
      ])

      const result = mapToString(input)

      expect(result.length).toBeGreaterThan(2) // ie: did not save "{}"
      expect(result.length).toBe(95)
    })
  })

  describe('#stringToMap', () => {
    it('throws if the input is not a valid json string x1', () => {
      const input = 'not valid json string'

      expect(() => {
        stringToMap(input)
      }).toThrow()
    })

    it('throws if the input is not a valid json string x2', () => {
      const input = '[1, 2, 3]'

      expect(() => {
        stringToMap(input)
      }).toThrow()
    })

    it('creates a map object from valid JSON string x1', () => {
      const input = '[[1, 1], [2, 2], [3, 3]]'

      const result = stringToMap<number, number>(input)

      expect(result.size).toBe(3)
      expect(result.get(1)).toBe(1)
      expect(result.get(2)).toBe(2)
      expect(result.get(3)).toBe(3)
    })

    it('creates a map object from valid JSON string x2', () => {
      const input = '[[1, true], [2, { "a": "yup" }], [3, 3]]'

      const result = stringToMap<number, any>(input)

      expect(result.size).toBe(3)
      expect(result.get(1)).toBe(true)
      expect(result.get(2)).toEqual({
        a: 'yup',
      })
      expect(result.get(3)).toBe(3)
    })
  })

  describe('#mapHelpers', () => {
    it('can turn a map to string and back again', () => {
      const input = new Map<number, any>()
      input.set(1, true)
      input.set(2, {
        x: 'yup',
      })
      input.set(3, 123)

      const str = mapToString(input)
      const result = stringToMap<number, any>(str)

      expect(result).toEqual(input)
    })
  })
})
