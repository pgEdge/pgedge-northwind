import { Router } from '@tsndr/cloudflare-worker-router';
import { getTableData, getDbNodes, recordUser, getOrders, createSupplier, updateSupplier, isValidJwt } from './db';
import { cfLocations } from './cloudflare';

// Env Types
export type Var<T = string> = T;
export type Secret<T = string> = T;

export type Env = {
	ENVIRONMENT: Var<'dev' | 'prod'>;

	DB: Secret<string>;
	NODELIST: Secret<string>;

	KTY: Secret<string>;
	USE: Secret<string>;
	N: Secret<string>;
	E: Secret<string>;
	KID: Secret<string>;
	X5T: Secret<string>;
	X5C: Secret<string>;
};

// Initialize Router
const router = new Router<Env>();

const getConnectionString = (env: Env, nodeName?: string): string => {
	const defaultConnectionString = env.DB?.toString() || '';
	const connectionStringParts = defaultConnectionString.split('@');
	const credentialsPart = connectionStringParts[0];
	const [username, password] = credentialsPart.split('://')[1].split(':');
	const databasePart = connectionStringParts[1].split('/')[1];
	const databaseName = databasePart.split('?')[0];
	const defaultNodeAddress = connectionStringParts[1].split('/')[0];
	const domainPart = defaultNodeAddress.split('.')[0];

	if (nodeName) {
		const nodeAddress = `${domainPart}-${nodeName}.a1.pgedge.io`;
		return `postgresql://${username}:${password}@${nodeAddress}/${databaseName}?sslmode=require`;
	}

	return defaultConnectionString;
};

// Enabling build in CORS support
router.cors({
	allowOrigin: '*',
	allowMethods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
	allowHeaders: 'Content-Type,Authorization',
	allowCredentials: true,
});

router.get('/user', async ({ ctx, req, env }) => {
	const nodeAddress = req.query.nodeAddress as string | undefined;
	const user = {
		colo: req.cf?.colo,
		colo_lat: cfLocations[req.cf?.colo || ''].lat,
		colo_long: cfLocations[req.cf?.colo || ''].lon,
		colo_name: cfLocations[req.cf?.colo || ''].name,
		country: req.cf?.country,
		continent: req.cf?.continent,
		region: req.cf?.region,
		city: req.cf?.city,
		lat: Number(req.cf?.latitude),
		long: Number(req.cf?.longitude),
		pgedge_nearest_node: '',
	};

	const recordUserInfo = async () => {
		const dbInfo = await getDbNodes(getConnectionString(env, nodeAddress), env.NODELIST.split(','));
		user.pgedge_nearest_node = dbInfo.nearest;
		return recordUser(getConnectionString(env, nodeAddress), user);
	};

	ctx?.waitUntil(recordUserInfo());
	const response = Response.json(user);
	response.headers.append('Cache-Control', 'max-age=3600;');
	return response;
});

router.get('/db', async ({ env, req }) => {
	const nodeAddress = req.query.nodeAddress as string | undefined;
	return Response.json(await getDbNodes(getConnectionString(env, nodeAddress), env.NODELIST.split(',')));
});

router.get('/sessions', async ({ req, env }) => {
	const nodeAddress = req.query.nodeAddress as string | undefined;
	const currentPage: number = 1;
	const rowsPerPage: number = 100;
	const { data, count, log } = await getTableData(
		getConnectionString(env, nodeAddress),
		'sessions',
		currentPage,
		rowsPerPage,
		'created_at',
		'desc',
	);

	return Response.json({
		data: data,
		count: count,
		log: log,
	});
});

router.get('/suppliers', async ({ req, env }) => {
	const nodeAddress = req.query.nodeAddress as string | undefined;
	const currentPage: number = Number(req.query?.page ?? 1);
	const rowsPerPage: number = 20;
	const { data, count, log } = await getTableData(
		getConnectionString(env, nodeAddress),
		'suppliers',
		currentPage,
		rowsPerPage,
		'supplier_id',
		'desc',
	);

	return Response.json({
		data: data,
		count: count,
		log: log,
	});
});

router.get('/suppliers/:supplierId', async ({ req, env }) => {
	const nodeAddress = req.query.nodeAddress as string | undefined;
	const supplierId = req.params.supplierId;

	const { data, log } = await getTableData(getConnectionString(env, nodeAddress), 'suppliers', null, null, null, 'asc', supplierId);

	if (data) {
		return Response.json({
			data: data,
			log: log,
		});
	} else {
		return Response.json(
			{
				message: 'Supplier not found',
				log: log,
			},
			{ status: 404 },
		);
	}
});

router.post('/suppliers', async ({ req, env }) => {
	const token = req.headers.get('Authorization');
	const nodeAddress = req.query.nodeAddress as string | undefined;
	const data = await req.json();

	try {
		if (!token) {
			return Response.json({ error: 'No token provided' }, { status: 401 });
		}
		const tokenVerified = await isValidJwt(token.replace('Bearer ', ''), env);
		if (!tokenVerified) {
			return Response.json({ error: 'Invalid token' }, { status: 401 });
		}

		const connectionString = getConnectionString(env, nodeAddress);
		const result = await createSupplier(connectionString, data);
		return Response.json(result);
	} catch (error: any) {
		return Response.json({ error: error.message }, { status: 500 });
	}
});

router.put('/suppliers/:supplierId', async ({ req, env }) => {
	const token = req.headers.get('Authorization');
	if (!token) {
		return Response.json({ error: 'No token provided' }, { status: 401 });
	}
	const tokenVerified = await isValidJwt(token.replace('Bearer ', ''), env);
	if (!tokenVerified) {
		return Response.json({ error: 'Invalid token' }, { status: 401 });
	}

	const nodeAddress = req.query.nodeAddress as string | undefined;
	const supplierId = parseInt(req.params.supplierId, 10);
	const data = await req.json();

	try {
		const connectionString = getConnectionString(env, nodeAddress);
		const result = await updateSupplier(connectionString, data, supplierId);
		return Response.json(result);
	} catch (error: any) {
		return Response.json({ error: error.message }, { status: 500 });
	}
});

router.get('/products', async ({ req, env }) => {
	const nodeAddress = req.query.nodeAddress as string | undefined;
	const currentPage: number = Number(req.query?.page ?? 1);
	const rowsPerPage: number = 20;
	const { data, count, log } = await getTableData(getConnectionString(env, nodeAddress), 'products', currentPage, rowsPerPage);

	return Response.json({
		data: data,
		count: count,
		log: log,
	});
});

router.get('/orders', async ({ req, env }) => {
	const nodeAddress = req.query.nodeAddress as string | undefined;
	const currentPage: number = Number(req.query?.page ?? 1);
	const rowsPerPage: number = 20;
	const { data, count, log } = await getOrders(getConnectionString(env, nodeAddress), currentPage, rowsPerPage);

	return Response.json({
		data: data,
		count: count,
		log: log,
	});
});

router.get('/employees', async ({ req, env }) => {
	const nodeAddress = req.query.nodeAddress as string | undefined;
	const currentPage: number = Number(req.query?.page ?? 1);
	const rowsPerPage: number = 20;
	const { data, count, log } = await getTableData(getConnectionString(env, nodeAddress), 'employees', currentPage, rowsPerPage);

	return Response.json({
		data: data,
		count: count,
		log: log,
	});
});

router.get('/customers', async ({ req, env }) => {
	const nodeAddress = req.query.nodeAddress as string | undefined;
	const currentPage: number = Number(req.query?.page ?? 1);
	const rowsPerPage: number = 20;
	const { data, count, log } = await getTableData(getConnectionString(env, nodeAddress), 'customers', currentPage, rowsPerPage);

	return Response.json({
		data: data,
		count: count,
		log: log,
	});
});

// Listen Cloudflare Workers Fetch Event
export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext) {
		return router.handle(request, env, ctx);
	},
};
