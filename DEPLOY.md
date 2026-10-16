# Deploy no GitHub Pages

## 1. Login no GitHub CLI (uma vez)

```powershell
gh auth login
```

Escolha: GitHub.com → HTTPS → Login with browser.

## 2. Criar repo público e enviar o código

Na pasta `belloscar-leads`:

```powershell
gh repo create belloscar-leads --public --source=. --remote=origin --push
```

Se o repo já existir:

```powershell
git remote add origin https://github.com/SEU_USUARIO/belloscar-leads.git
git push -u origin main
```

## 3. Ativar Pages

1. Abra o repositório no GitHub  
2. **Settings → Pages**  
3. **Source:** GitHub Actions  
4. Aguarde o workflow **Deploy GitHub Pages** ficar verde  

URL: `https://SEU_USUARIO.github.io/belloscar-leads/`

## 4. Atualizar dados depois

1. `npm run dev` → `/admin` → PIN (`belloscar` por padrão, ou o do `.env`)  
2. Envie a planilha → baixe `dataset.json`  
3. Substitua `public/data/dataset.json`  
4. `git add public/data/dataset.json && git commit -m "Update leads dataset" && git push`  
