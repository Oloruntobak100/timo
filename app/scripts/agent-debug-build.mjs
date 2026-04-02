// #region agent log
fetch('http://127.0.0.1:7850/ingest/ba32117c-009f-42d2-a4b7-bacccd5fb380', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Debug-Session-Id': 'ba714e',
  },
  body: JSON.stringify({
    sessionId: 'ba714e',
    runId: 'pre-fix-local',
    hypothesisId: 'H1',
    location: 'app/scripts/agent-debug-build.mjs',
    message: 'prebuild: npm run build entry',
    data: { cwd: process.cwd() },
    timestamp: Date.now(),
  }),
}).catch(() => {});
// #endregion
