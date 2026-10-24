
const API_PREFIX = "/api/v1";

const withApiPrefix = (url: string): string => {
  const base = url.replace(/\/+$/, "");

  return base.endsWith(API_PREFIX) ? base : `${base}${API_PREFIX}`;
};

export const API_BASE_URL = withApiPrefix(
  process.env.NEXT_PUBLIC_API_URL ||
  "https://spotnest-backend-2026-cqcta0b7ebb6g8dg.indiasouthcentral-01.azurewebsites.net"
);

/** Socket.IO attaches at the server root, so this stays prefix-free. */
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL!;
