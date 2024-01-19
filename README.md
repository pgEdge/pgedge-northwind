# pgEdge Northwind Demo

This repo has the code for https://northwind.pgedge.com/, which a demo of the Northwind dataset, running on Cloudflare Workers® and pgEdge Cloud, a fully-distributed PostgreSQL database, deployable across multiple cloud regions or data centers.

This code is inspired by the [Cloudflare D1 Northwind Demo](https://github.com/cloudflare/d1-northwind)

## Built With

- [Cloudflare Pages](https://pages.cloudflare.com/) & [Cloudflare Workers](https://developers.cloudflare.com/workers/) for compute
- [pgEdge Cloud](https://www.pgedge.com/products/pgedge-cloud) for database
- [Typescript](https://www.typescriptlang.org/) for stronger types
- [React](https://react.dev/) for UI Framework
- [NextJS](https://nextjs.org/) for React Framework
- [Mantine](https://mantine.dev/) for UI Components
- [cloudflare-worker-router](https://github.com/tsndr/cloudflare-worker-router) for API routing
- [node-postgres](https://github.com/brianc/node-postgres) for DB Client Connections
- [cloudflare-colo-list](https://github.com/Netrvin/cloudflare-colo-list) for Cloudflare Colocation Data
- [mapbox-gl](https://github.com/mapbox/mapbox-gl-js) for plotting user sessions on a map

## Setup

You will need a:

* Cloudflare Account
* pgEdge Cloud Account
* NodeJS installed with npm + npx


### Clone this repo

```
git clone https://github.com/pgedge/pgedge-northwind
```

This repo contains two components - an `api` Cloudflare worker, and a Cloudflare pages `app`. The `api` worker is setup in a separate npm workspace, which can be accessed using `npm -w api <command>`

### Install packages

```
npm install
```

### Setup the pgEdge Database

Login to pgEdge Cloud, and create a database, and select "Install Northwind Database" during setup. 

Once your database is deployed, connect to it using the provided details, and add one additional table:

```
CREATE TABLE sessions
  (
     id         UUID,
     created_at TIMESTAMP,
     user_data  JSONB,
     PRIMARY KEY (id)
  ) ;
```

Once added, click "Start Replication" in the UI to ensure all tables are available on all nodes.

### Configure the API Worker

Next, create a `.dev.vars` file under `src/api` with the following contents:

```
DB=<Connection String from the Nearest Node tab under "Connect to your database">
NODELIST=<Comma separated list of Node Domains, copied from each tab (n1, n2, etc) under "Connect to your database">
```

### Run the api locally

Run the API worker locally:

```
npm run dev -w api
```

Confirm access to the database is working by navigating to `http://localhost:8787/customers`, which should return some information. 


### Run the app locally

Create a `.env.development.local` file in the root of the repository, and provide it with configuration details:

```
NEXT_PUBLIC_API=http://localhost:8787
NEXT_PUBLIC_MAPBOX_TOKEN=<Optional Mapbox Token, if you want the map to display>
```

Once this is configured, run `npm run dev` from a separate shell, and the UI should be accessible at http://localhost:3000, and use your local api for requests.

### Deploy the api

If you want to deploy the API into a Cloudflare Worker, you can use the following command to do so via Wrangler:

```
npm run deploy -w api
```

Once the worker is deployed, you'll need to provide it with the `DB` and `NODELIST` secrets that you configured locally. You can use wrangler to set these:

```
 npx -w api wrangler secret put DB
 npx -w api wrangler secret put NODELIST
```

Provide the values via direct input. You may need to redeploy the worker afterwards for it to begin utilizing the secrets.

Once your worker deploy is complete, you should be provided a URL which you can use to deploy the app, or to configure your local app instance to utilize (rather than running the api locally)

### Deploy the app

The app runs on Cloudflare Pages via next-on-pages, a CLI tool to help build and deploy NextJS applications on Cloudflare.

A [guide](https://github.com/cloudflare/next-on-pages/tree/main/packages/next-on-pages#cloudflarenext-on-pages) is provided for how to deploy an app like this to Cloudflare Pages.

You'll want to use the "Local Development" approach rather than the Git integration. The guide goes into more detail, but this roughly involves:

1. Creating a `.env.production.local` file which contains environment variables required during build. You will want to set `NEXT_PUBLIC_API` to your deployed API worker URL from the previous step. 
2. Building the app via `next-on-pages` via `npx @cloudflare/next-on-pages`
3. Use wrangler to deploy via `wrangler pages publish .vercel/output/static`. Provide a name for your project and use main for the branch.
4. Go into the Pages project in Cloudflare, and enable the `nodejs_compat` flag under Settings -> Functions -> Compatibiliy Flags. Populate this value for both Production and Preview
5. Navigate to the Pages URL that wrangler provided you, and you should see the app.
