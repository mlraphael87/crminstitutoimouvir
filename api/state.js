import { neon } from "@neondatabase/serverless";
import { initialData } from "../src/storage.js";

const id = "main";

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

async function ensure(sql) {
  await sql`
    create table if not exists crm_state (
      id text primary key,
      data jsonb not null,
      updated_at timestamptz not null default now()
    )
  `;
}

export default async function handler(req, res) {
  if (!process.env.DATABASE_URL) {
    return json(res, 200, { data: initialData, storage: "local-fallback" });
  }

  const sql = neon(process.env.DATABASE_URL);
  await ensure(sql);

  if (req.method === "GET") {
    const rows = await sql`select data from crm_state where id = ${id}`;
    if (!rows.length) {
      await sql`insert into crm_state (id, data) values (${id}, ${JSON.stringify(initialData)}::jsonb)`;
      return json(res, 200, { data: initialData, storage: "neon" });
    }
    return json(res, 200, { data: rows[0].data, storage: "neon" });
  }

  if (req.method === "PUT") {
    const payload = req.body?.data;
    if (!payload || typeof payload !== "object") {
      return json(res, 400, { error: "Payload inválido." });
    }
    await sql`
      insert into crm_state (id, data, updated_at)
      values (${id}, ${JSON.stringify(payload)}::jsonb, now())
      on conflict (id) do update set data = excluded.data, updated_at = now()
    `;
    return json(res, 200, { ok: true });
  }

  res.setHeader("Allow", "GET, PUT");
  return json(res, 405, { error: "Método não permitido." });
}
