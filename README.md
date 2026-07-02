# crminstitutoimouvir

CRM React para operação de agendamento, acompanhamento, pedidos e emissão de termos do Instituto Maçônico Ouvir - IMOUVIR.

## Rodar localmente

```bash
npm install
npm run dev
```

## Produção

```bash
npm run build
```

O projeto está pronto para deploy na Vercel no repositório `https://github.com/mlraphael87/crminstitutoimouvir`. A camada atual persiste os dados no navegador via `localStorage`, com exportação/importação JSON. Para Neon, use o arquivo `database/schema.sql` como base do banco e substitua o adaptador em `src/storage.js` por chamadas API.
