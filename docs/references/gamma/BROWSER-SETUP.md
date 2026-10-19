# Verified managed-environment browser setup

On 19 October 2026, publication made https://gamma.app reachable (HTTP 200). No environment_status tool was exposed in this session; readiness is based on actual HTTP and browser operations, not assumed configuration state.

REA launch mode did not inherit an effective browser proxy. A separately owned Chromium launched through Playwright with `proxy.server` from HTTPS_PROXY/HTTP_PROXY reached the destination, but initially rejected its certificate. A workspace-local browser HOME and NSS database fixed trust without disabling TLS:

```sh
mkdir -p /workspace/scratch/browser-home/.pki/nssdb
certutil -N -d sql:/workspace/scratch/browser-home/.pki/nssdb --empty-password
for cert in /usr/local/share/ca-certificates/*.crt; do
  certutil -A -d sql:/workspace/scratch/browser-home/.pki/nssdb -n "$(basename "$cert")" -t 'C,,' -i "$cert"
done
```

The executed harness is retained at evidence/browser-harness.cjs. It uses the existing Playwright install, supplied CA trust, inherited proxy and scratch files. No passwords, cookies or login storage are supplied. It starts its own headless Chromium with loopback CDP9333, selects the Gamma page target, then runs REA in connect mode. REA disconnects from the externally owned browser, and the harness closes that browser in finally. Ensure port9333 is free before using it. It does not attach to the user's personal browser.

Requests/results retain exact page URLs, CDP target identifiers, Evidence IDs, complete DOM and accessibility captures. No target account or paid operation was created. Initial failed launch-mode evidence remains preserved alongside the successful connect-mode captures. Reproduce only the needed target/question; do not repeat all captures without a meaningful change.
