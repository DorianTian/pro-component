/**
 * Render an inline error page when all fallback sources fail
 * and the app cannot bootstrap.
 *
 * The error page is self-contained HTML/CSS injected into document.body.
 * It includes a retry button and diagnostic info.
 */

export interface ErrorDiagnostics {
  appId: string
  userId: string
  failedSources: string[]
  timestamp: string
  userAgent: string
}

/** Escape HTML special characters to prevent XSS in diagnostic output */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Build the inline CSS styles for the error page container */
function buildErrorPageStyles(): string {
  return `
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  margin: 0;
  padding: 20px;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f5f5f5;
  color: #333;`
}

/** Build the main content (heading, message, retry button) */
function buildErrorPageContent(): string {
  return `
    <div style="font-size: 48px; margin-bottom: 16px;">&#9888;&#65039;</div>
    <h1 style="font-size: 20px; font-weight: 600; margin: 0 0 8px;">
      Application Failed to Load
    </h1>
    <p style="font-size: 14px; color: #666; margin: 0 0 24px; line-height: 1.6;">
      We were unable to load the required resources. This may be a temporary network issue.
    </p>
    <button id="pro-error-retry" style="
      display: inline-block; padding: 10px 32px; background-color: #409eff;
      color: #fff; border: none; border-radius: 4px; font-size: 14px;
      cursor: pointer; transition: background-color 0.2s;
    " onmouseover="this.style.backgroundColor='#337ecc'"
       onmouseout="this.style.backgroundColor='#409eff'">
      Retry
    </button>`
}

/** Build the diagnostic details section */
function buildErrorPageDiagnostics(error: Error, diagnostics: ErrorDiagnostics): string {
  const data = escapeHtml(
    JSON.stringify(
      {
        error: error.message,
        appId: diagnostics.appId,
        userId: diagnostics.userId,
        failedSources: diagnostics.failedSources,
        timestamp: diagnostics.timestamp,
        userAgent: diagnostics.userAgent,
      },
      null,
      2,
    ),
  )

  return `
    <details style="margin-top: 24px; text-align: left; font-size: 12px; color: #999;">
      <summary style="cursor: pointer; margin-bottom: 8px;">Diagnostic Info</summary>
      <pre style="
        background: #f9f9f9; padding: 12px; border-radius: 4px; overflow-x: auto;
        white-space: pre-wrap; word-break: break-all;
        font-family: 'SF Mono', Monaco, Consolas, monospace;
        font-size: 11px; line-height: 1.5;
      ">${data}</pre>
    </details>`
}

/**
 * Build self-contained error page HTML.
 * No external dependencies -- all CSS is inline.
 * Composed from helper functions to keep each under 50 lines.
 */
export function buildErrorPageHtml(error: Error, diagnostics: ErrorDiagnostics): string {
  const styles = buildErrorPageStyles()
  const content = buildErrorPageContent()
  const diag = buildErrorPageDiagnostics(error, diagnostics)

  return `
<div id="pro-error-container" style="${styles}">
  <div style="
    max-width: 520px; width: 100%; background: #fff; border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08); padding: 40px 32px; text-align: center;
  ">
    ${content}
    ${diag}
  </div>
</div>`
}

/**
 * Render error page into document body and bind retry button.
 */
export function renderErrorPage(error: Error, diagnostics: ErrorDiagnostics): void {
  const html = buildErrorPageHtml(error, diagnostics)
  document.body.innerHTML = html

  // Bind retry button
  const retryBtn = document.getElementById('pro-error-retry')
  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      window.location.reload()
    })
  }
}
