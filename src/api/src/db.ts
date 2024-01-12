import { Client, QueryResult } from 'pg';
import { pgEdgeLocations } from './pgedge';

async function query(client: Client, queryLog: any[], query: string, params?: any[]) {
    const start = performance.now();
    const res = await client.query(query, params)
    const end = performance.now();
    queryLog.push({query: query, results: res.rowCount, executionTime: end - start})
    return res
}

export async function getTableData(db: string, table: string, currentPage: number = 1, rowsPerPage: number = 20) {
    const queryLog: any[] = []
    const client = new Client(db);
    await client.connect();

    const countRes = await query(client, queryLog, `SELECT COUNT(*) FROM ${table}`);
    const offset = (currentPage - 1) * rowsPerPage
    const dataRes = await query(client, queryLog, `SELECT * FROM ${table} LIMIT $1::integer OFFSET $2::integer`, [rowsPerPage, offset]);
    client.end()

    return { data: dataRes.rows, count: countRes.rows[0].count, log: queryLog }
}

export async function getDbNodes(db: string, nodeList: string[]) {
    const nearestClient = new Client(db);
    const nearestIP = await getNodeIP(nearestClient.host)

    let nearestLocation = ""
    let nodeLocations: any = {}

    const nodeClients: Client[] = []
    let connectPromises: Promise<void>[] = []
    for (const node of nodeList) {
        const nodeDB = db.replace(nearestClient.host, node)
        const nodeClient = new Client(nodeDB)
        nodeClients.push(nodeClient);
        connectPromises.push(nodeClient.connect())
    }

    await Promise.all(connectPromises);

    for (const nodeClient of nodeClients) {
        const nodeIP = await getNodeIP(nodeClient.host)
        const nodeLocation = getNodeLocation(nodeClient.host)
        const nodeInfo = pgEdgeLocations[nodeLocation]
        const start = performance.now();
        await nodeClient.query("SELECT 1")
        const end = performance.now();
        nodeClient.end()

        nodeInfo["latency"] = end - start
        nodeLocations[nodeLocation] = nodeInfo
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