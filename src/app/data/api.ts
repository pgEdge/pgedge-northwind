export async function getTableData(table: string, currentPage: number = 1) {

  const params = new URLSearchParams({
    page: currentPage.toString(),
  });

  const url = process.env.API + "/" + table + "?" + params.toString()
  const res = await fetch(url, {
    headers: {
      "X-Source": "Cloudflare-Workers",
    },
  });

  const json = await res.json()

  return json
}

export async function getUser() {

  const res = await fetch(process.env.API + "/user", {
    headers: {
      "X-Source": "Cloudflare-Workers",
    },
  });

  const json = await res.json()

  return json
}

export async function getDbInfo() {

  const res = await fetch(process.env.API + "/db", {
    headers: {
      "X-Source": "Cloudflare-Workers",
    },
  });

  const json = await res.json()

  return json
}