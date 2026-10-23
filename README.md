# DMWright Solutions — Website Prototype

Static, visuals-only prototype of the new DMWright Solutions website
(the production version is the WordPress theme `dmwright-theme.zip`).

## Deploy on Cloudflare Pages (from GitHub)

1. Push this folder's contents to the root of a GitHub repository.
2. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git → pick the repo.
3. Build settings:
   - Framework preset: **None**
   - Build command: *(leave empty)*
   - Build output directory: **/**
4. Save and Deploy. Every push to the main branch redeploys automatically.

`_headers` keeps the prototype out of search results and caches images.
The consultation form is disabled in the prototype.
