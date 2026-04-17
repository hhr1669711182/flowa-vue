export const OMS_API = '/api/method/upsystem.upsystem.api_oms_ui'

const envApiBase = ((import.meta as any).env?.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '')

export const withApiBase = (path: string) => (envApiBase ? `${envApiBase}${path}` : path)

export const OMS_API_FETCH = withApiBase(OMS_API)

