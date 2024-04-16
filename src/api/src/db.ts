import { Client } from 'pg';
import { pgEdgeLocations } from './pgedge';
import { Env } from '.';
import { parseJwt } from '@cfworker/jwt';

async function query(client: Client, queryLog: any[], query: string, params?: any[]) {
	const start = performance.now();
	const res = await client.query(query, params);
	const end = performance.now();
	queryLog.push({ query: query, results: res.rowCount, executionTime: Math.round(end - start) });
	return res;
}

export async function getTableData(
	db: string,
	table: string,
	currentPage: number | null = null,
	rowsPerPage: number | null = null,
	orderBy: string | null = null,
	orderDirection: 'asc' | 'desc' = 'asc',
	singleItemId: string | null = null,
) {
	const queryLog: any[] = [];
	const client = new Client({
		connectionString: db,
		statement_timeout: 1000,
		query_timeout: 1000,
		connectionTimeoutMillis: 1000,
	});
	await client.connect();

	if (singleItemId) {
		const dataRes = await query(client, queryLog, `SELECT * FROM ${table} WHERE supplier_id = $1`, [singleItemId]);
		client.end();
		return { data: dataRes.rows[0], log: queryLog };
	} else {
		const countRes = await query(client, queryLog, `SELECT COUNT(*) FROM ${table}`);
		const offset = (currentPage - 1) * rowsPerPage;

		let orderByClause = '';
		if (orderBy) {
			orderByClause = `ORDER BY ${orderBy} ${orderDirection}`;
		}
		const dataRes = await query(client, queryLog, `SELECT * FROM ${table} ${orderByClause} LIMIT $1 OFFSET $2`, [rowsPerPage, offset]);
		client.end();

		return { data: dataRes.rows, count: countRes.rows[0].count, log: queryLog };
	}
}

export async function getOrders(db: string, currentPage: number = 1, rowsPerPage: number = 20) {
	const queryLog: any[] = [];
	const client = new Client({
		connectionString: db,
		statement_timeout: 1000,
		query_timeout: 1000,
		connectionTimeoutMillis: 1000,
	});
	await client.connect();

	const countRes = await query(client, queryLog, `SELECT COUNT(*) FROM orders`);
	const offset = (currentPage - 1) * rowsPerPage;
	const dataRes = await query(
		client,
		queryLog,
		`SELECT 
		SUM(od.unit_price * od.discount * od.quantity) AS total_discount, 
		SUM(od.unit_price * od.quantity) AS total_price, 
		SUM(od.quantity) AS total_quantity, 
		COUNT(od.order_id) AS total_products, 
		o.* 
		FROM orders o, order_details od 
		WHERE od.order_id = o.order_id 
		GROUP BY o.order_id LIMIT $1::integer OFFSET $2::integer`,
		[rowsPerPage, offset],
	);
	client.end();

	return { data: dataRes.rows, count: countRes.rows[0].count, log: queryLog };
}

export async function recordUser(db: string, userData: any) {
	const queryLog: any[] = [];
	const client = new Client({
		connectionString: db,
		statement_timeout: 1000,
		query_timeout: 1000,
		connectionTimeoutMillis: 1000,
	});
	await client.connect();

	const res = await query(
		client,
		queryLog,
		`INSERT into sessions (id, created_at, user_data) VALUES ($1::uuid, $2::timestamp, $3::jsonb)`,
		[crypto.randomUUID(), new Date(), userData],
	);
	client.end();

	return res.rowCount;
}

export async function createSupplier(connectionString: string, data: any) {
	const queryLog: any[] = [];
	const client = new Client({
		connectionString,
		statement_timeout: 1000,
		query_timeout: 1000,
		connectionTimeoutMillis: 1000,
	});
	await client.connect();

	const { company_name, contact_name, contact_title, address, city, region, postal_code, country, phone, fax, homepage } = data;

	// Get the maximum supplier_id from the suppliers table
	const maxSupplierIdRes = await query(client, queryLog, 'SELECT MAX(supplier_id) FROM suppliers');
	const maxSupplierId = maxSupplierIdRes.rows[0].max || 0;
	const newSupplierId = maxSupplierId + 1;

	const res = await query(
		client,
		queryLog,
		`INSERT INTO suppliers (
		supplier_id,
		company_name,
		contact_name,
		contact_title,
		address,
		city,
		region,
		postal_code,
		country,
		phone,
		fax,
		homepage
	  ) VALUES (
		$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
	  ) RETURNING supplier_id;`,
		[newSupplierId, company_name, contact_name, contact_title, address, city, region, postal_code, country, phone, fax, homepage],
	);

	client.end();

	return { supplier_id: res.rows[0].supplier_id, log: queryLog };
}

export async function updateSupplier(connectionString: string, data: any, supplierId: number) {
	console.log('connectionString', connectionString);
	const queryLog: any[] = [];
	const client = new Client({
		connectionString,
		statement_timeout: 1000,
		query_timeout: 1000,
		connectionTimeoutMillis: 1000,
	});
	await client.connect();

	const { company_name, contact_name, contact_title, address, city, region, postal_code, country, phone, fax, homepage } = data;

	const res = await query(
		client,
		queryLog,
		`UPDATE suppliers SET
		company_name = $1,
		contact_name = $2,
		contact_title = $3,
		address = $4,
		city = $5,
		region = $6,
		postal_code = $7,
		country = $8,
		phone = $9,
		fax = $10,
		homepage = $11
	  WHERE supplier_id = $12
	  RETURNING supplier_id;`,
		[company_name, contact_name, contact_title, address, city, region, postal_code, country, phone, fax, homepage, supplierId],
	);

	client.end();

	console.log(res.rows, 'queryLog');

	return { supplier_id: res.rows[0].supplier_id, log: queryLog };
}

export async function isValidJwt(token: string, env: Env) {
	return await parseJwt(token, env.AUTH0_ISSUER_BASE_URL, env.AUTH0_AUDIENCE);
}

export async function getDbNodes(db: string, nodeList: string[]) {
	const nearestClient = new Client({
		connectionString: db,
		statement_timeout: 1000,
		query_timeout: 1000,
		connectionTimeoutMillis: 1000,
	});
	const nearestIP = await getNodeIP(nearestClient.host);
	let nearestLocation = '';

	let nodeLocations: any = {};

	const nodeClients: Client[] = [];
	let connectPromises: Promise<void>[] = [];

	const TIMEOUT_DURATION = 1000;

	for (const node of nodeList) {
		const nodeDB = db.replace(nearestClient.host, node);
		const nodeClient = new Client({
			connectionString: nodeDB,
			statement_timeout: 1000,
			query_timeout: 1000,
			connectionTimeoutMillis: 1000,
		});
		nodeClients.push(nodeClient);

		const connectPromise = new Promise<void>((resolve, reject) => {
			const timeout = setTimeout(() => {
				nodeClient.end();
				reject(new Error(`Connection timed out for node ${node}`));
			}, TIMEOUT_DURATION);

			nodeClient.connect((err) => {
				clearTimeout(timeout);
				if (err) {
					nodeClient.end();
					reject(err);
				} else {
					resolve();
				}
			});
		});

		connectPromises.push(connectPromise);
	}

	const connectedNodes = await Promise.allSettled(connectPromises);

	for (const [index, result] of connectedNodes.entries()) {
		const nodeClient = nodeClients[index];

		const nodeIP = await getNodeIP(nodeClient.host);
		const nodeLocation = getNodeLocation(nodeClient.host);
		const nodeInfo = pgEdgeLocations[nodeLocation];
		nodeInfo['status'] = false;

		const start = performance.now();
		try {
			if (result.status === 'fulfilled') {
				// Measure latency only if the connection was successful
				await nodeClient.query('SELECT 1');
				const end = performance.now();
				const queryLatency = end - start;

				nodeInfo['latency'] = Math.round(queryLatency);
				nodeInfo['status'] = queryLatency <= 500;
			} else {
				console.error(result.reason);
			}

			if (nodeIP === nearestIP) {
				nearestLocation = nodeLocation;
			}
		} catch (err) {
			console.error(`Error querying node ${nodeClient.host}:`, err);
		} finally {
			nodeClient.end();
		}

		nodeLocations[nodeLocation] = nodeInfo;
	}

	return {
		nearest: nearestLocation,
		nodes: nodeLocations,
	};
}

async function getNodeIP(host: string) {
	const response = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(host)}&ct=application/dns-json`, {
		headers: {
			accept: 'application/dns-json',
		},
	});

	const responseObj = await response.json();
	return responseObj.Answer[0].data;
}

function getNodeLocation(host: string) {
	return host.split('.')[0].split('-')[3];
}
