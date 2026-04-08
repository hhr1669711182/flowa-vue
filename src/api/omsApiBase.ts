/**
 * OMS 前端（UI）接口统一入口 base path。
 * 所有供 Flowa/OMS 调用的接口均在 upsystem.api_oms_ui 下封装，便于定位与维护。
 */
export const OMS_API = '/api/method/upsystem.upsystem.api_oms_ui'

const envApiBase = ((import.meta as any).env?.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '')

/** 将相对 API 路径补全为可直连地址（生产可指向 localhost）。 */
export const withApiBase = (path: string) => (envApiBase ? `${envApiBase}${path}` : path)

/** 仅用于 fetch 直连场景，避免绕过 VITE_API_BASE_URL。 */
export const OMS_API_FETCH = withApiBase(OMS_API)
