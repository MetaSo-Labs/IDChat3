export interface PageResult<T> {
  list: T[]
  total: number
  nextCursor?: string | null
}
