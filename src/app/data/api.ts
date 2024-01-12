//Rudimentary stores
export const Logs: any[] = []
export async function getTableData(table: string, currentPage: number = 1) {

  const params = new URLSearchParams({
    page: currentPage.toString(),
  });
  
  const res = await fetch(process.env.NEXT_PUBLIC_API + "/" + table + "?" + params.toString());

  const json: any = await res.json()
  for (const log of json.log)
  {
    Logs.push(log)
  }
  return json
}

export interface UserInfo {
  colo: string
  colo_lat: number
  colo_long: number
  colo_latency: number,
  colo_name: string,
  country: string,
  continent: string,
  region: string,
  city: string,
  lat: number,
  long: number
}

export async function getUserInfo(): Promise<UserInfo> {

  const start = performance.now();
  const res = await fetch(process.env.NEXT_PUBLIC_API + "/user");
  const end = performance.now();

  const json = await res.json<UserInfo>()
  json.colo_latency = end - start

  return json
}

export interface NodeInfo {
  city: string
  country: string
  state: string
  lat: number
  long: number
  latency: number
}

export interface DbInfo {
  nearest: string
  nodes: Record<string, NodeInfo>;
}

export async function getDbInfo() : Promise<DbInfo>  {

  const res = await fetch(process.env.NEXT_PUBLIC_API + "/db");

  const json = await res.json<DbInfo>()
  return json
}