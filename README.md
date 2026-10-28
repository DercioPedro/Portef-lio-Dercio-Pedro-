# Portfólio Dercio Pedro Luis

Site estático com painel privado. Funciona no GitHub Pages e no Vercel sem build.

## Porque dava 404

O repositório só tinha as pastas `backend/` e `frontend/`.
O Vercel e o GitHub Pages procuram `index.html` na RAIZ.
Por isso aparecia "This page doesn't exist".

## Como publicar (obrigatório)

Envia estes ficheiros para a RAIZ do repositório, não para dentro de `frontend/` nem `backend/`:

- `index.html`
- `admin.html`
- `css/`
- `js/`
- `data/`
- `uploads/`
- `.nojekyll`
- `vercel.json`

No GitHub: Add file -> Upload files -> arrasta estes itens para a raiz -> Commit.

Depois, no Vercel, clica Redeploy.

## Painel

Abre `admin.html`

- Utilizador: `dercio`
- Palavra-passe: `Dercio@2026`

Os projectos que adicionares ficam guardados neste browser.
