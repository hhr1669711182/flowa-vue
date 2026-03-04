import { defineMock } from '@alova/mock'

type Role = 'Owner' | 'Admin' | 'Member'

interface Account {
  id: string
  name: string
  email: string
  password: string
  role: Role
}

const LS_KEY = 'mock_auth_accounts'
const load = (): Account[] => {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    if (!Array.isArray(arr)) return []
    return arr
  } catch {
    return []
  }
}
const save = (list: Account[]) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(list))
  } catch {}
}

let accounts: Account[] = [
  { id: 'u1', name: 'Evan Su', email: 'evan@flowa.com', password: 'Flowa@123!', role: 'Owner' },
  { id: 'u2', name: 'Admin User', email: 'admin@flowa.com', password: 'Admin@123!', role: 'Admin' },
  { id: 'u3', name: 'Demo Member', email: 'member@flowa.com', password: 'Member@123!', role: 'Member' }
]
const persisted = load()
persisted.forEach(p => {
  const exists = accounts.some(a => a.email.toLowerCase() === p.email.toLowerCase())
  if (!exists) accounts.push(p)
})

const codeStore: Record<string, string> = {
  'evan@flowa.com': '13579',
  'admin@flowa.com': '24680',
  'member@flowa.com': '12345'
}

const issue = (email: string) => {
  const base = codeStore[email] || '12345'
  codeStore[email] = base // keep stable for demo
  return base
}

export default defineMock({
  '[POST]/api/auth/login': ({ data }) => {
    const { email, password } = data
    const acc = accounts.find(a => a.email.toLowerCase() === String(email).toLowerCase())
    if (!acc || acc.password !== password) {
      return { ok: false, message: 'Invalid email or password' }
    }
    return {
      ok: true,
      token: `mock-token-${acc.id}`,
      user: { id: acc.id, name: acc.name, email: acc.email, role: acc.role }
    }
  },

  '[POST]/api/auth/reset': ({ data }) => {
    const { email } = data
    const acc = accounts.find(a => a.email.toLowerCase() === String(email).toLowerCase())
    if (!acc) {
      return {
        ok: false,
        message:
          "The email you entered isn’t linked to any account in our system. Please try again or reach out to the Flowa Support Team for assistance."
      }
    }
    const code = issue(acc.email)
    return { ok: true, message: `Code sent: ${code}` } // message only for demo visibility
  },

  '[POST]/api/auth/resend': ({ data }) => {
    const { email } = data
    const acc = accounts.find(a => a.email.toLowerCase() === String(email).toLowerCase())
    if (!acc) return { ok: false, message: 'Email not found' }
    const code = issue(acc.email)
    return { ok: true, message: `Code resent: ${code}` }
  },

  '[POST]/api/auth/verify': ({ data }) => {
    const { email, code } = data
    const real = codeStore[String(email).toLowerCase()]
    if (!real) return { ok: false, message: 'No code issued for this email' }
    if (String(code) !== real) return { ok: false, message: 'Invalid code' }
    return { ok: true }
  },

  '[POST]/api/auth/register': ({ data }) => {
    const { fullName, email, password } = data
    const exists = accounts.some(a => a.email.toLowerCase() === String(email).toLowerCase())
    if (exists) return { ok: false, message: 'Email already registered' }
    const id = `u${accounts.length + 1}`
    const acc = { id, name: fullName, email, password, role: 'Member' } as Account
    accounts.push(acc)
    const onlyCustom = accounts.filter(a =>
      a.id.startsWith('u') && !['u1', 'u2', 'u3'].includes(a.id)
    )
    save(onlyCustom)
    return { ok: true, token: `mock-token-${id}` }
  }
})

