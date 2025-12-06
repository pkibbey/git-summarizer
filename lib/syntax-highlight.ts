import { codeToHtml } from 'shiki';

export async function highlightCode(code: string, language: string = 'typescript'): Promise<string> {
  try {
    const html = await codeToHtml(code, {
      lang: language,
      theme: 'github-dark',
    });
    return html;
  } catch {
    // Fallback to plain code if highlighting fails
    return `<pre><code>${escapeHtml(code)}</code></pre>`;
  }
}

function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

export function detectLanguage(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase();
  const languageMap: { [key: string]: string } = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    py: 'python',
    json: 'json',
    css: 'css',
    html: 'html',
    sh: 'bash',
    sql: 'sql',
    yaml: 'yaml',
    yml: 'yaml',
  };
  return languageMap[ext || ''] || 'plaintext';
}

export function truncateDiff(diff: string, maxLines: number = 50): { truncated: string; isTruncated: boolean } {
  const lines = diff.split('\n');
  const isTruncated = lines.length > maxLines;
  return {
    truncated: lines.slice(0, maxLines).join('\n'),
    isTruncated,
  };
}
