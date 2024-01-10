'use server'
import { Client } from 'pg';

export async function getTableData(table: string, currentPage: number = 1, rowsPerPage: number = 20) {
 
	const client = new Client(process.env.DB);
	await client.connect();

  const countRes = await client.query(`SELECT COUNT(*) FROM ${table}`);
  const offset = (currentPage - 1) * rowsPerPage
  const dataRes = await client.query(`SELECT * FROM ${table} LIMIT $1::integer OFFSET $2::integer`, [rowsPerPage, offset]);
	client.end()
  return { data: dataRes.rows, count: countRes.rows[0].count }
}