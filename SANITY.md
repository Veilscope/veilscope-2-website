# Sanity publishing setup

The website includes an embedded Sanity Studio at `/studio` and reads published `report` documents on `/research`.

## Connect a project

1. Create or select a project in [Sanity Manage](https://www.sanity.io/manage).
2. Copy `.env.example` to `.env.local`.
3. Set `NEXT_PUBLIC_SANITY_PROJECT_ID` and confirm the dataset name.
4. For a private dataset, create a read token and set `SANITY_API_READ_TOKEN`. Never expose this token with a `NEXT_PUBLIC_` prefix.
5. In the Sanity project API settings, add `http://localhost:3000` and the production website origin to CORS. Enable credentials for origins that host the embedded Studio.
6. Restart `npm run dev` and open `http://localhost:3000/studio`.

## Publishing workflow

- Create a **Research report** in Studio.
- Complete the required publication details, overview, data cutoff, and position disclosure.
- Add optional research sections, images, tables, sources, and corrections.
- Generate a slug and publish the document.
- Published reports appear in the `/research` browser and at `/research/[slug]`. Cached results refresh within 60 seconds.

Draft documents are not shown publicly. The Studio uses Sanity authentication; the public website queries the published perspective only.

## Useful commands

- `npm run sanity:dev` starts the standalone Studio development server.
- `npm run sanity:schema` extracts the current schema.
- `npm run sanity:deploy` deploys a standalone hosted Studio if one is preferred over `/studio`.
