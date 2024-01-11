import { Client } from 'pg';

export async function getDbNodes(db: string, nodeList: string[]) {
    const nearestClient = new Client(db);
    const nearestIP = await getNodeIP(nearestClient.host)

    let nearestLocation = ""
    let nodeLocations: string[] = []

    for (const node of nodeList) {
        const dbNode = db.replace(nearestClient.host, node)
        const nodeClient = new Client(dbNode);
        const nodeIP = await getNodeIP(nodeClient.host)
        const nodeLocation = getNodeLocation(node)
        nodeLocations.push(nodeLocation)
        if (nodeIP == nearestIP) {
            nearestLocation = nodeLocation;
        }
    }

    return {
        nearest: nearestLocation,
        nodes: nodeLocations
    }

}

async function getNodeIP(host: string) {
    const response = await fetch(
        `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(host)}&ct=application/dns-json`
        , {
            headers: {
                "accept": "application/dns-json",
            },
        });


    const responseObj = await response.json()
    return responseObj.Answer[0].data;
}

function getNodeLocation(host: string) {
    return host.split(".")[0].split("-")[3]
}

export async function getTableData(db: string, table: string, currentPage: number = 1, rowsPerPage: number = 20) {
    const client = new Client(db);
    await client.connect();

    const countRes = await client.query(`SELECT COUNT(*) FROM ${table}`);
    const offset = (currentPage - 1) * rowsPerPage
    const dataRes = await client.query(`SELECT * FROM ${table} LIMIT $1::integer OFFSET $2::integer`, [rowsPerPage, offset]);
    client.end()
    return { data: dataRes.rows, count: countRes.rows[0].count }
}