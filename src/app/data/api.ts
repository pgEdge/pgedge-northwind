//Rudimentary stores
export const Logs: any[] = []
export async function getTableData(table: string, currentPage: number = 1) {

  const params = new URLSearchParams({
    page: currentPage.toString(),
  });
  
  const url = process.env.NEXT_PUBLIC_API + "/" + table + "?" + params.toString()
  const res = await fetch(url, {
    headers: {
      "X-Source": "Cloudflare-Workers",
    },
  });

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
  country: string,
  continent: string,
  region: string,
  city: string,
  lat: number,
  long: number
}

export async function getUser(): Promise<UserInfo> {

  const res = await fetch(process.env.NEXT_PUBLIC_API + "/user", {
    headers: {
      "X-Source": "Cloudflare-Workers",
    },
  });

  const json = await res.json<UserInfo>()

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

  const res = await fetch(process.env.NEXT_PUBLIC_API + "/db", {
    headers: {
      "X-Source": "Cloudflare-Workers",
    },
  });

  const json = await res.json<DbInfo>()
  return json
}