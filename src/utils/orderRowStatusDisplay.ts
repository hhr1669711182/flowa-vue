/** 列表 Actions 列：只读状态文案（勿与「打开详情」混用为同一按钮） */
export function orderRowStatusText(row: { status?: string; stage?: string }) {
  const s = String(row?.status || row?.stage || "").trim();
  return s || "—";
}

export function orderRowStatusIsAlert(row: { status?: string; stage?: string }) {
  return /cancelled|blocked|exception/i.test(String(row?.status || row?.stage || ""));
}

export function orderRowStatusTagClass(row: { status?: string; stage?: string }) {
  return orderRowStatusIsAlert(row)
    ? "!rounded-lg !px-2 !py-1 !border-none !bg-[#FCE8E6] !text-[#D93025]"
    : "!rounded-lg !px-2 !py-1 !border-none !bg-[#EEF2FF] !text-[#1D4ED8]";
}
