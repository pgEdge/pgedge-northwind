import { Router } from '@tsndr/cloudflare-worker-router';
import { getTableData, getDbNodes, recordUser, getOrders } from './db';
import { cfLocations } from './cloudflare';

// Env Types
export type Var<T = string> = T;
export type Secret<T = string> = T;

export type Env = {
	ENVIRONMENT: Var<'dev' | 'prod'>;

	DB: Secret<string>;
	NODELIST: Secret<string>;
};

// Initialize Router
const router = new Router<Env>();

// Enabling build in CORS support
router.cors();

router.get('/user', async ({ ctx, req, env }) => {
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
		const dbInfo = await getDbNodes(env.DB, env.NODELIST.split(','));
		user.pgedge_nearest_node = dbInfo.nearest;
		return recordUser(env.DB, user);
	};

	ctx?.waitUntil(recordUserInfo());
	const response = Response.json(user);
	response.headers.append('Cache-Control', 'max-age=3600;');
	return response;
});

router.get('/db', async ({ env }) => {
	return Response.json(await getDbNodes(env.DB, env.NODELIST.split(',')));
});

router.get('/sessions', async ({ req, env }) => {
	const currentPage: number = 1;
	const rowsPerPage: number = 100;
	const { data, count, log } = await getTableData(env.DB, 'sessions', currentPage, rowsPerPage);

	return Response.json({
		data: data,
		count: count,
		log: log,
	});
});

router.get('/suppliers', async ({ req, env }) => {
	const currentPage: number = Number(req.query?.page ?? 1);
	const rowsPerPage: number = 20;
	const { data, count, log } = await getTableData(env.DB, 'suppliers', currentPage, rowsPerPage);

	return Response.json({
		data: data,
		count: count,
		log: log,
	});
});

router.get('/products', async ({ req, env }) => {
	const currentPage: number = Number(req.query?.page ?? 1);
	const rowsPerPage: number = 20;
	const { data, count, log } = await getTableData(env.DB, 'products', currentPage, rowsPerPage);

	return Response.json({
		data: data,
		count: count,
		log: log,
	});
});

router.get('/orders', async ({ req, env }) => {
	const currentPage: number = Number(req.query?.page ?? 1);
	const rowsPerPage: number = 20;
	const { data, count, log } = await getOrders(env.DB, currentPage, rowsPerPage);

	return Response.json({
		data: data,
		count: count,
		log: log,
	});
});

router.get('/employees', async ({ req, env }) => {
	const currentPage: number = Number(req.query?.page ?? 1);
	const rowsPerPage: number = 20;
	const { data, count, log } = await getTableData(env.DB, 'employees', currentPage, rowsPerPage);

	return Response.json({
		data: data,
		count: count,
		log: log,
	});
});

router.get('/customers', async ({ req, env }) => {
	const currentPage: number = Number(req.query?.page ?? 1);
	const rowsPerPage: number = 20;
	const { data, count, log } = await getTableData(env.DB, 'customers', currentPage, rowsPerPage);

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
