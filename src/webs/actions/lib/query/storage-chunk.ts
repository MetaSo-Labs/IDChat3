export type StorageChunkParams = {
  key: string
  index: number
  total: number
  chunk: string
}

interface ChunkEntry {
  chunks: string[]
  received: number
  total: number
  data?: string
}

// IndexedDB helper
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ChunkDB', 1)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains('chunks')) {
        db.createObjectStore('chunks')
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function saveToIndexedDB(key: string, data: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('chunks', 'readwrite')
    tx.objectStore('chunks').put(data, key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

async function loadFromIndexedDB(key: string): Promise<string | null> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('chunks', 'readonly')
    const req = tx.objectStore('chunks').get(key)
    req.onsuccess = () => resolve(req.result ?? null)
    req.onerror = () => reject(req.error)
  })
}

async function deleteFromIndexedDB(key: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('chunks', 'readwrite')
    tx.objectStore('chunks').delete(key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

async function clearAllChunks(): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('chunks', 'readwrite')
    tx.objectStore('chunks').clear()
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

// In-memory store for chunks
const chunkStore: Map<string, ChunkEntry> = new Map()
export async function process(params: StorageChunkParams) {
  const { key, index, total, chunk } = params

  if (!chunkStore.has(key)) {
    chunkStore.set(key, { chunks: [], received: 0, total })
  }

  const entry = chunkStore.get(key)!
  entry.chunks[index] = chunk
  entry.received++

  if (entry.received === total) {
    console.log('All chunks received for key:', key)
    const fullData = entry.chunks.join('')
    saveToIndexedDB(key, fullData).then(() => {
      chunkStore.delete(key) // 清理内存
    })
  }
  return true // keep async
}

export async function getChunkData(key: string): Promise<string | undefined> {
  console.log('getChunkData', chunkStore, key)
  const data = await loadFromIndexedDB(key)
  if (data) {
    return data
  }

  return undefined
}

export async function clearChunkData() {
  await clearAllChunks()
  return true
}
