/* eslint-disable @typescript-eslint/no-explicit-any */

const PASS_PHRASE = 'flowa-oms-demo'
const SALT_TEXT = 'flowa-oms-salt'

const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()

const toBase64 = (buf: ArrayBuffer) => {
  const bytes = new Uint8Array(buf)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    const code = bytes[i] as number
    binary += String.fromCharCode(code)
  }
  return btoa(binary)
}

const fromBase64 = (b64: string) => {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes.buffer
}

const getKeyMaterial = async (passphrase: string) => {
  return await crypto.subtle.importKey('raw', textEncoder.encode(passphrase), 'PBKDF2', false, [
    'deriveKey'
  ])
}

const deriveKey = async (passphrase: string, salt: string) => {
  const keyMaterial = await getKeyMaterial(passphrase)
  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: textEncoder.encode(salt),
      iterations: 100_000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

export const encryptJson = async (data: any) => {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(PASS_PHRASE, SALT_TEXT)
  const cipherBuf = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    textEncoder.encode(JSON.stringify(data))
  )
  return { cipher: toBase64(cipherBuf), iv: toBase64(iv.buffer) }
}

export const decryptJson = async (cipher: string, ivB64: string) => {
  const key = await deriveKey(PASS_PHRASE, SALT_TEXT)
  const iv = new Uint8Array(fromBase64(ivB64))
  const plainBuf = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    fromBase64(cipher)
  )
  const jsonText = textDecoder.decode(plainBuf)
  return JSON.parse(jsonText)
}

export const setSecureItem = async (key: string, value: any, ttlMs: number) => {
  const { cipher, iv } = await encryptJson(value)
  const exp = Date.now() + ttlMs
  localStorage.setItem(
    key,
    JSON.stringify({
      c: cipher,
      i: iv,
      e: exp
    })
  )
}

export const getSecureItem = async <T = any>(key: string): Promise<T | null> => {
  const raw = localStorage.getItem(key)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (parsed.e && Date.now() > parsed.e) {
      localStorage.removeItem(key)
      return null
    }
    return (await decryptJson(parsed.c, parsed.i)) as T
  } catch {
    return null
  }
}

export const removeSecureItem = (key: string) => {
  localStorage.removeItem(key)
}

// IndexedDB 简单封装
const DB_NAME = 'flowaCache'
const STORE_NAME = 'kv'

const openDB = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })

export const idbSet = async (key: string, value: any) => {
  const db = await openDB()
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(value, key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export const idbGet = async <T = any>(key: string): Promise<T | undefined> => {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).get(key)
    req.onsuccess = () => resolve(req.result as T)
    req.onerror = () => reject(req.error)
  })
}

export const idbRemove = async (key: string) => {
  const db = await openDB()
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).delete(key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

// 记住账号工具
const REMEMBER_KEY = 'rememberCredentials'
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000

export const saveRememberCredentials = async (payload: { email: string; password: string }) => {
  await setSecureItem(REMEMBER_KEY, payload, THIRTY_DAYS)
  await idbSet(REMEMBER_KEY, payload) // 作为备份
}

// 浏览器密码管理器（支持则尝试）
export const tryBrowserCredentialStore = async (email: string, password: string) => {
  try {
    const w: any = window as any
    if (w.PasswordCredential) {
      const cred = new w.PasswordCredential({ id: email, password })
      await (navigator as any).credentials.store(cred)
      return true
    }
    if ((navigator as any).credentials && (navigator as any).credentials.store) {
      const cred = { id: email, password } as any
      await (navigator as any).credentials.store(cred)
      return true
    }
  } catch {
    // ignore
  }
  return false
}

export const loadRememberCredentials = async (): Promise<
  { email: string; password: string } | null
> => {
  const v = await getSecureItem<{ email: string; password: string }>(REMEMBER_KEY)
  if (v) return v
  const backup = await idbGet<{ email: string; password: string }>(REMEMBER_KEY)
  return backup ?? null
}

export const clearRememberCredentials = async () => {
  removeSecureItem(REMEMBER_KEY)
  await idbRemove(REMEMBER_KEY)
}
