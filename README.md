# Advanced Heading

Create advanced headings with title, subtitle and separator controls — a Gutenberg block by [WPDeveloper](https://wpdeveloper.com), part of the [Essential Blocks](https://essential-blocks.com) family.

The subtitle and separator can each be toggled on or off. The separator supports two styles, line and icon, with 100+ icons available. Margin, padding, background and border of the heading wrapper are all customisable with responsive options.

## Requirements

| | Minimum | Tested up to |
|---|---|---|
| WordPress | 6.0 | 7.0 |
| PHP | 7.4 | 8.5 |

## Development

This repository uses git submodules for the shared `controls` and `lib/style-handler` packages. Clone with them, or initialise after the fact:

```bash
git clone --recurse-submodules git@github.com:EssentialBlocks/advanced-heading.git
# or, in an existing checkout:
git submodule update --init --recursive
```

Install dependencies and build:

```bash
npm ci
npm run build      # production build -> dist/
npm start          # watch mode
```

Note that `npm run build` only builds the block entry (`src/index.js`). The `dist/modules.*` and `dist/frontend.*` bundles are produced by a separate build inside the `controls` submodule.

To package a distribution zip (respects `.distignore`):

```bash
wp dist-archive . ../advanced-heading.zip
```

## Branches

| Branch | Purpose |
|---|---|
| `master` | Stable, mirrors what is released |
| `latest` | Current release line; PRs land here before promotion to `master` |
| `dev` | Active development |

## Contributors

- [@RahatSheikhLeon](https://github.com/RahatSheikhLeon)

See the `Contributors:` field in [`readme.txt`](readme.txt) for the full WordPress.org contributor list.

## License

GPL-3.0-or-later. See [LICENSE](LICENSE).
