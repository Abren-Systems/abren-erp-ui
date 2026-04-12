import { describe, it, expect, vi } from 'vitest'
import { useResourceQuery } from '../useResourceQuery'
import * as useApiQueryModule from '../useApiQuery'

describe('useResourceQuery', () => {
  it('should call useApiQuery with mapped data', async () => {
    const useApiQuerySpy = vi
      .spyOn(useApiQueryModule, 'useApiQuery')
      .mockImplementation((_key, queryFn) => {
        // Just execute the query function passed in to test mapping logic
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return { queryFn } as any
      })

    const adapterFn = vi.fn().mockResolvedValue({ id: 'dto-1' })
    const mapperFn = vi.fn().mockReturnValue({ id: 'domain-1' })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = useResourceQuery(['test'], adapterFn, mapperFn) as any
    const data = await result.queryFn()

    expect(adapterFn).toHaveBeenCalled()
    expect(mapperFn).toHaveBeenCalledWith({ id: 'dto-1' })
    expect(data).toEqual({ id: 'domain-1' })
    expect(useApiQuerySpy).toHaveBeenCalledWith(['test'], expect.any(Function), expect.any(Object))
  })
})
