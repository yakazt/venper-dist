# venper-dist

Published builds of [Venper](https://github.com/yakazt/venper), the client mod for Yapper. This repo holds build output only. The source lives in `yakazt/venper`.

| File | What it is |
|---|---|
| [`venper.user.js`](venper.user.js) | The userscript. Open its raw link with Tampermonkey or Violentmonkey installed to install it. |
| `venper.meta.js` | Just the userscript's header. Userscript managers read it to check for updates. |
| `VenperSetup.exe` | Venper Setup for Windows (per-user install, no admin prompt). |
| `latest.json` | Current versions plus the size and SHA-256 of each file. |

Install link: <https://raw.githubusercontent.com/yakazt/venper-dist/main/venper.user.js>

To check a download against `latest.json`:

```powershell
Get-FileHash .\VenperSetup.exe -Algorithm SHA256
```

```sh
sha256sum venper.user.js
```

Builds are made with `tools/publish-dist.mjs` from the source repo, which refuses to publish a Setup that doesn't embed the same client version.
