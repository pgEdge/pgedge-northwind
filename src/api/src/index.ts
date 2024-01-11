import { Router } from '@tsndr/cloudflare-worker-router'
import { getTableData, getDbNodes } from './db'

// Env Types
export type Var<T = string> = T
export type Secret<T = string> = T

export type Env = {
    ENVIRONMENT: Var<'dev' | 'prod'>

	DB: Secret<string>
	NODELIST: Secret<string>
}

// Request Extension
export type ExtReq = {
    //userId?: number
}

// Context Extension
export type ExtCtx = {
    //sentry?: Toucan
}

// Initialize Router
const router = new Router<Env>()

// Enabling build in CORS support
router.cors()

router.get('/user', ({ req }) => {
    return Response.json({
		colo: req.cf?.colo,
		country: req.cf?.country,
		continent: req.cf?.continent,
		region: req.cf?.region,
		city: req.cf?.city
	})
})

router.get('/db', async ({ env }) => {
	return Response.json(await getDbNodes(env.DB, env.NODELIST.split(",")));
})

router.get('/suppliers', async ({ req, env }) => {
	const currentPage: number = Number(req.query?.page ?? 1)
	const rowsPerPage: number = 20
	const { data, count } = await getTableData(env.DB, "suppliers", currentPage, rowsPerPage)

    return Response.json({
		data: data,
		count: count
	})
})

router.get('/products', async ({ req, env }) => {
	const currentPage: number = Number(req.query?.page ?? 1)
	const rowsPerPage: number = 20
	const { data, count } = await getTableData(env.DB, "products", currentPage, rowsPerPage)

    return Response.json({
		data: data,
		count: count
	})
})

// Listen Cloudflare Workers Fetch Event
export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext) {
        return router.handle(request, env, ctx)
    }
}
