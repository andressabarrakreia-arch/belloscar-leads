import type { Dataset } from "./types";

const TOKEN_KEY = "belloscar_gh_token";

export const GITHUB_DEFAULTS = {
  owner: import.meta.env.VITE_GITHUB_OWNER || "andressabarrakreia-arch",
  repo: import.meta.env.VITE_GITHUB_REPO || "belloscar-leads",
  path: import.meta.env.VITE_GITHUB_DATA_PATH || "public/data/dataset.json",
  branch: import.meta.env.VITE_GITHUB_BRANCH || "main",
};

export function getStoredToken(): string {
  return sessionStorage.getItem(TOKEN_KEY) || "";
}

export function setStoredToken(token: string) {
  if (token.trim()) sessionStorage.setItem(TOKEN_KEY, token.trim());
  else sessionStorage.removeItem(TOKEN_KEY);
}

function toBase64Utf8(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
  return btoa(binary);
}

async function githubFetch(path: string, token: string, init?: RequestInit) {
  const res = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.headers || {}),
    },
  });
  return res;
}

export type PublishResult = {
  commitSha: string;
  commitUrl: string;
  htmlUrl: string;
};

/**
 * Atualiza public/data/dataset.json no repositório (agrega via conteúdo já mergeado).
 * Não substitui o histórico: o caller deve passar o dataset já mergeado+deduplicado.
 */
export async function publishDatasetToGitHub(
  dataset: Dataset,
  token: string,
  message?: string
): Promise<PublishResult> {
  const { owner, repo, path, branch } = GITHUB_DEFAULTS;
  if (!token.trim()) throw new Error("Informe o token do GitHub (PAT) para publicar.");

  const getRes = await githubFetch(
    `/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
    token
  );

  let sha: string | undefined;
  if (getRes.status === 200) {
    const current = (await getRes.json()) as { sha: string };
    sha = current.sha;
  } else if (getRes.status !== 404) {
    const err = await getRes.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string }).message ||
        `Não foi possível ler o arquivo no GitHub (${getRes.status})`
    );
  }

  const content = toBase64Utf8(JSON.stringify(dataset, null, 2));
  const body = {
    message:
      message ||
      `Atualiza dataset de leads (${dataset.leads.length} leads) — ${new Date().toISOString()}`,
    content,
    branch,
    ...(sha ? { sha } : {}),
  };

  const putRes = await githubFetch(`/repos/${owner}/${repo}/contents/${path}`, token, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!putRes.ok) {
    const err = await putRes.json().catch(() => ({}));
    const msg = (err as { message?: string }).message || `Falha ao publicar (${putRes.status})`;
    if (putRes.status === 401 || putRes.status === 403) {
      throw new Error(
        `${msg}. Verifique o token: precisa de permissão Contents (leitura e escrita) no repo ${owner}/${repo}.`
      );
    }
    throw new Error(msg);
  }

  const data = (await putRes.json()) as {
    commit: { sha: string; html_url: string };
    content: { html_url: string };
  };

  return {
    commitSha: data.commit.sha,
    commitUrl: data.commit.html_url,
    htmlUrl: data.content.html_url,
  };
}
