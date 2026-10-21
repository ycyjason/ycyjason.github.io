const SEPARATOR = ' ▪ '

// Joins the non-empty parts of a card or detail-page meta line (company, date, ...).
export const joinMeta = (parts) => parts.filter(Boolean).join(SEPARATOR)
