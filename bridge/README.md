# Claude Code bridge (Max plan)

Run translations through your **Claude Max** subscription instead of paid API
credits. The phone app sends a page image to this little server on your laptop,
which runs **Claude Code headless** (`claude -p`) — authenticated by your Max
plan — to read the image and return the structured lesson.

No API key. No per-token billing. Draws on your Max usage limits.

## Requirements
- The `claude` CLI installed and signed in (i.e. Claude Code already works in
  your terminal).
- Node.js (any recent version).
- Phone and laptop on the **same Wi-Fi**.

## Run it
From the project root:

```bash
node bridge/server.mjs
```

It prints a URL like `http://192.168.1.20:8788`. In the app:
**Settings → Translation source → Local Claude Code (Max)** → paste that URL →
**Save & test connection**. Then scan as usual.

Keep the terminal window open while you scan. `Ctrl+C` to stop. Set a custom port
with `PORT=9000 node bridge/server.mjs`.

## Notes
- **Personal use.** This routes *your* scans through *your* Max subscription on
  *your* machine. Don't point other people's installs at your laptop — that
  shares your entitlement, which isn't allowed.
- **Reading is offline.** Only *new* scans need the laptop; already-processed
  pages live on the phone.
- The server only enables Claude Code's `Read` tool (to look at the page image),
  nothing else.
- Away from your laptop? Switch the app to **Anthropic API key** instead.
