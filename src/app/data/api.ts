//Rudimentary stores
export const Logs: LogEntry[] = [];

export interface LogEntry {
  query: string;
  results: number;
  execution_time: number;
}

export interface DataResponse<T> {
  data: T[];
  count: number;
  log: LogEntry[];
}

export interface UserInfo {
  colo: string;
  colo_lat: number;
  colo_long: number;
  colo_latency: number;
  colo_name: string;
  country: string;
  continent: string;
  region: string;
  city: string;
  lat: number;
  long: number;
  pgedge_nearest_node: string;
}

export interface Session {
  id: string;
  created_at: Date;
  user_data: UserInfo;
}

export interface NodeInfo {
  city: string;
  country: string;
  state: string;
  lat: number;
  long: number;
  latency: number;
}

export interface DbInfo {
  nearest: string;
  nodes: Record<string, NodeInfo>;
}

export async function getTableData(
  table: string,
  currentPage: number = 1,
): Promise<DataResponse<any>> {
  const params = new URLSearchParams({
    page: currentPage.toString(),
  });

  const res = await fetch(
    process.env.NEXT_PUBLIC_API + "/" + table + "?" + params.toString() + `${sessionStorage.getItem('selectedNode') ? "&nodeAddress=" + sessionStorage.getItem('selectedNode') : ""}`)

  const json: any = await res.json<DataResponse<any>>();
  for (const log of json.log) {
    Logs.unshift(log);
  }
  return json;
}

export async function getUserInfo(): Promise<UserInfo> {
  const start = performance.now();
  const res = await fetch(process.env.NEXT_PUBLIC_API + "/user" + `${sessionStorage.getItem('selectedNode') ? "?nodeAddress=" + sessionStorage.getItem('selectedNode') : ""}`);
  const end = performance.now();

  const json = await res.json<UserInfo>();
  json.colo_latency = Math.round(end - start);

  return json;
}

export async function getRecentSessions(): Promise<DataResponse<Session>> {
  const res = await fetch(process.env.NEXT_PUBLIC_API + "/sessions" + `${sessionStorage.getItem('selectedNode') ? "?nodeAddress=" + sessionStorage.getItem('selectedNode') : ""}`);
  const json = await res.json<DataResponse<Session>>();
  for (const log of json.log) {
    Logs.unshift(log);
  }
  return json;
}

export async function getDbInfo(): Promise<DbInfo> {
  const res = await fetch(process.env.NEXT_PUBLIC_API + "/db" + `${sessionStorage.getItem('selectedNode') ? "?nodeAddress=" + sessionStorage.getItem('selectedNode') : ""}`);

  const json = await res.json<DbInfo>();
  return json;
}
