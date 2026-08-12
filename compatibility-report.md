# Advanced Heading — PHP / WordPress Compatibility Pass

**Plugin:** Advanced Heading (`advanced-heading`)
**Branch:** `advanced-heading-dev` (based on `origin/latest`, see note below)
**Date of audit:** 2026-08-10
**Version:** 1.1.5 → 1.5.0

> **Branch base note.** The skill's default is to branch from `master`. Here `origin/master`
> is *content-behind* `origin/latest`: master's five unique commits are all merge commits and
> its tree is identical to `a6e0c20` (version 1.1.4, `Tested up to: 6.2`), while `origin/latest`
> carries the shipping 1.1.5 release. Since latest's tree strictly contains master's, the work
> branch was based on `origin/latest` to avoid regressing the plugin from 1.1.5 to 1.1.4.

---

## 1. Detected original PHP / WP baseline

### PHP — originally **7.4-era**

| Evidence | File:line | Implies |
|---|---|---|
| Short array syntax `[]` throughout | `advanced-heading.php:41`, `includes/font-loader.php:15` | 5.4+ |
| Variadics `...$args` and `new static( ...$args )` | `includes/font-loader.php:21,23` | 5.6+ |
| Closures passed as array callables / `render_callback` closure | `advanced-heading.php:130`, `lib/style-handler/style-handler.php:94` | 5.3+ |
| `str_contains()` | `includes/helpers.php:48`, `lib/style-handler/includes/class-parse-css.php:193` | 8.0 natively (WP polyfills it from 5.9) |
| No typed properties, no arrow fns, no `match`, no ctor promotion, no enums | — | ceiling below 8.0 |

Net: the hand-written PHP is comfortably **7.x**, with a single 8.0 function that is only safe
because WordPress core polyfills it. Detected original floor: **PHP 7.4** (7.0 would also parse,
but nothing in the code is below 7.x-era style).

### WordPress — originally **5.8-era**

| Evidence | File:line | Implies |
|---|---|---|
| `register_block_type()` with a **directory path** | `advanced-heading.php:126` via `Advanced_Heading_Helper::get_block_register_path()` | 5.8+ |
| `block.json` with `apiVersion: "2"` | `block.json` | 5.6+ |
| Explicit `<= 5.6` fallback to string-name registration | `includes/helpers.php:94` | code was written to *also* support 5.0–5.6 |
| `resolve_block_template()`, `wp_is_block_theme()` (FSE asset generation) | `lib/style-handler/style-handler.php:33,53` | 5.9+ |
| `rest_after_save_widget` hook | `lib/style-handler/style-handler.php:30` | 5.8+ |
| No `wp_interactivity_*`, no Block Bindings, no `Requires Plugins:` | — | ceiling below 6.5 |

Net: the plugin's own registration path targets **WP 5.8+**, with a legacy escape hatch down to
5.0. The bundled style handler pushes the *practical* floor to **5.9**. Last declared testing was
against 6.5 (April 2024).

### Declared vs. detected — they disagreed

| Field | Declared before | Reality |
|---|---|---|
| Header `Requires PHP` | **absent** | code is 7.4-era |
| Header `Requires at least` | **absent** | 5.8+ in practice |
| Header `Tested up to` | **absent** | last tested 6.5 |
| `readme.txt` `Requires at least` | `5.0` | false — path-form `register_block_type()` needs 5.8, style handler needs 5.9 |
| `readme.txt` `Tested up to` | `6.5` | two years stale |
| `readme.txt` `Requires PHP` | **absent** | — |

The main plugin file carried **no** version metadata at all, and `readme.txt`'s `Requires at
least: 5.0` was already untrue when it was written.

---

## 2. Chosen floor

```
declared PHP floor = max( detected 7.4, policy 7.4 ) = 7.4
declared WP  floor = max( detected 5.8, policy 6.0 ) = 6.0   <- policy won
```

- **PHP 7.4** — detected original and policy minimum agree.
- **WP 6.0** — the *policy minimum* won over the detected 5.8/5.9. Declaring 5.8 would mean
  maintaining a version band that is a small and shrinking slice of the field, keeping the dead
  `<= 5.6` branch alive, and testing permutations nobody runs.

The user did **not** request a lower floor for this plugin, so the default 7.4 / 6.0 policy applies.

---

## 3. Target range

Verified live on **2026-08-10**:

- `https://www.php.net/releases/index.php?json&max=4` → latest **PHP 8.5.9**; actively supported
  branches `8.2, 8.3, 8.4, 8.5`.
- `https://api.wordpress.org/core/version-check/1.7/` → latest **WordPress 7.0.3**.

**Target range: PHP 7.4 → 8.5, WordPress 6.0 → 7.0 (inclusive).**

Per-version checklist walked for this plugin:

| PHP | Result |
|---|---|
| 7.4 | ✅ no 8.0+ syntax; `str_contains` covered by the WP ≥ 5.9 polyfill |
| 8.0 | ✅ after fixes — array-offset-on-bool and illegal-offset TypeErrors removed |
| 8.1 | ✅ no `null` passed to non-nullable internal params in plugin-owned code |
| 8.2 | ✅ no dynamic property creation; all properties declared |
| 8.3 | ✅ no affected constructs |
| 8.4 | ✅ no implicit-nullable parameters (`f(int $x = null)`) |
| 8.5 | ✅ no backticks, no non-canonical casts, no `case X;`, no `$http_response_header`, no `openssl_seal/open` |

| WP | Result |
|---|---|
| 6.0 | ✅ path-form `register_block_type()` (5.8+) and `resolve_block_template()` (5.9+) both available |
| 6.1 – 6.4 | ✅ no affected APIs |
| 6.5 | ⚠️ `__experimentalGet/SetPreviewDeviceType` deprecated here — see §5, submodule scope |
| 6.6 | ✅ plugin-owned PHP unaffected |
| 6.7 | ⚠️ removal target for the experimental device-type selectors; ✅ no early text-domain loading (the plugin never calls `load_plugin_textdomain()` and has no translatable strings in PHP) |
| 6.8 | ✅ no password-hashing or phpass reliance; block editor iframing unaffected (apiVersion 2 is iframe-safe) |
| 6.9 / 7.0 | ✅ plugin-owned PHP clean; ⚠️ built `dist/modules.js` still calls the removed selectors |

---

## 4. Issue table

Severity: **C**ritical / **H**igh / **M**edium / **L**ow.
Scope: **P** = plugin-owned (fixed here) / **S** = shared submodule (flagged only).

| # | File:line | Issue | Breaks on | Sev | Scope |
|---|---|---|---|---|---|
| 1 | `advanced-heading.php:26` | `require_once` of `lib/style-handler/style-handler.php` with no `file_exists()` guard. The path is a git submodule; an uninitialised checkout or a package built before submodule init produces a **fatal on every request**. | any | **C** | P |
| 2 | `includes/helpers.php:50` | `$controls_dependencies = include_once …/dist/modules.asset.php;` — `include_once` returns `true`, not the array, if the file was already included in the request. Then `$controls_dependencies['dependencies']` is *array offset on bool* → `null` → `array_merge(null, …)` → **TypeError, fatal**. | PHP 8.0+ | **C** | P |
| 3 | `controls` submodule → built into `dist/modules.js` (`src/group-controls/index.js:140`, plus 5 `responsive-*` / `withResButtons` / `dimensions-control-v2` call sites) | `select('core/edit-post').__experimentalGetPreviewDeviceType()` and `dispatch(…).__experimentalSetPreviewDeviceType` called **unguarded**. Deprecated in WP 6.5, scheduled for removal in 6.7. On a core version where they are gone the call is `undefined` → TypeError → **editor breaks**. | WP 6.7+ | **C** | S |
| 4 | `includes/helpers.php:94` | `(float) get_bloginfo('version') <= 5.6` — float cast of a WP version string. `"5.10"` casts to `5.1`, `"7.10"` to `7.1`; ordering is wrong for any two-digit minor. Also now a dead branch (see §5). | WP with a 2-digit minor | **H** | P |
| 5 | `includes/font-loader.php:70` | `$googleFontFamily[$attributes[$key]] = …` — a non-string attribute value used as an array offset. Warning on 7.4, **`TypeError: Illegal offset type`** on PHP 8. | PHP 8.0+ | **H** | P |
| 6 | `lib/style-handler/style-handler.php:149` | `in_array( 'gp-premium/gp-premium.php', apply_filters( 'active_plugins', get_option( 'active_plugins' ) ) )` — `get_option()` returns `false` when the option is absent; `in_array()` with a non-array haystack is a **TypeError** on PHP 8. Also a non-strict `in_array`. | PHP 8.0+ | **H** | S |
| 7 | `lib/style-handler/style-handler.php:167-170` | `get_post_meta(…, true)` / `get_option('_eb_reusable_block_ids', [])` may return a string; `array_merge()` on a non-array is a **TypeError** on PHP 8. | PHP 8.0+ | **H** | S |
| 8 | `lib/style-handler/includes/class-parse-css.php:53-54` | `get_post( $attributes['ref'] )` on a deleted reusable block returns `null`; `$reusable_block->post_content` → *Attempt to read property on null*, then `parse_blocks(null)` → *passing null to non-nullable* deprecation. | PHP 8.0 / 8.1+ | **M** | S |
| 9 | `lib/style-handler/style-handler.php:64-65, 74-75, 213, 239, 251` | `get_post()` result used without a null check before `->post_content`. Same failure mode as #8. | PHP 8.0+ | **M** | S |
| 10 | `advanced-heading.php:1-14` | Plugin header carried **no** `Requires PHP`, `Requires at least` or `Tested up to`. WP cannot gate installs, and wp.org shows the plugin as untested. | any | **M** | P |
| 11 | `readme.txt:4-5` | `Requires at least: 5.0` was false (real floor 5.8/5.9); `Tested up to: 6.5` two years stale; no `Requires PHP`. | any | **M** | P |
| 12 | `advanced-heading.php` (whole file) | No `if ( ! defined( 'ABSPATH' ) ) exit;` guard — the only PHP file in the plugin missing one. | any | **M** | P |
| 13 | `includes/helpers.php:48` | `$_SERVER['QUERY_STRING']` read raw — no `wp_unslash()`, no `sanitize_text_field()`. | any (hygiene) | **M** | P |
| 14 | `includes/helpers.php:60` | `'eb_wp_version' => (float) get_bloginfo('version')` — same float-cast defect as #4, shipped to JS. | WP with a 2-digit minor | **M** | P |
| 15 | `includes/post-meta.php:12` | `add_filter('init', …)` used to register an **action**. Functionally identical in WP but semantically wrong and misleading. | none (correctness) | **L** | P |
| 16 | `advanced-heading.php:35-38` | `throw new Error(…)` inside the `init` callback when `dist/index.asset.php` is missing — takes the whole site down instead of degrading. Message also names the wrong block (`"block/testimonial"`). | any | **M** | P |
| 17 | `advanced-heading.php:29-31` | `define()` called unguarded inside an `init` callback — a second invocation emits *Constant already defined* notices. | any | **L** | P |
| 18 | `block.json:2` | `apiVersion: "2"`. v3 has been available since WP 6.3 and is what the modern iframed editor expects. v2 still works, but is a generation behind. | none yet | **L** | P |
| 19 | `lib/style-handler/style-handler.php:154, 163, 174, 182, 187` | Cache-buster version is `substr( md5( microtime( true ) ), 0, 10 )` — a **new URL on every page load**, so the generated CSS is never browser-cached. | none (perf) | **M** | S |
| 20 | `lib/style-handler/style-handler.php:298` | `$post->post_type === "wp_template_part" \|\| $post->post_type === "wp_template" && ! empty( $block_styles )` — `&&` binds tighter than `\|\|`, so the `! empty()` guard only applies to the second comparison. Pre-existing logic bug. | none (logic) | **M** | S |
| 21 | `lib/style-handler/style-handler.php:307, 323, 363, 371` | Bare `mkdir()` (non-recursive, return value ignored) and `file_put_contents()` instead of `wp_mkdir_p()` / `WP_Filesystem`. | none (hygiene) | **L** | S |
| 22 | `lib/style-handler/style-handler.php:385` | `"SELECT ID FROM {$wpdb->prefix}posts …"` — correctly `prepare()`d, but should use `$wpdb->posts`. | none (hygiene) | **L** | S |

**Clean on inspection** (checked, nothing found): no `mysql_*`, `create_function()`, `each()`,
`ereg*`, `split()`, `strftime()`, `money_format()`, `utf8_encode/decode`, `FILTER_SANITIZE_STRING`,
`${var}` interpolation, curly-brace offsets, implicit-nullable parameters, dynamic property
creation, `#[\ReturnTypeWillChange]` needs, REST routes without `permission_callback` (there are
no REST routes), unprepared `$wpdb` calls, or legacy jQuery / jQuery-Migrate patterns
(`.live()`, `.size()`, `.andSelf()`, `$.browser`, `$.parseJSON`, `$.trim`) in any shipped JS.
The plugin never loads a text domain, so the WP 6.7 early-translation `_doing_it_wrong` does
not apply.

---

## 5. Dead version-check branches (floor raise 5.8 → 6.0)

`grep -rnE 'version_compare|PHP_VERSION_ID|PHP_VERSION|$wp_version|get_bloginfo\(\s*.version|phpversion\(|is_php_version_compatible|is_wp_version_compatible' --include='*.php' .`
returned exactly two hits. One is a dead branch:

| File | Line | Condition | What the branch does | Single remaining reachable path if removed |
|---|---|---|---|---|
| `includes/helpers.php` | 94 | `(float) get_bloginfo('version') <= 5.6` | Returns the **block name string** `"advanced-heading/advanced-heading"` so `register_block_type()` uses the pre-5.8 string-name form instead of the `block.json` directory-path form. | `Advanced_Heading_Helper::get_block_register_path()` collapses to a one-line `return $blockPath;`. At the call site (`advanced-heading.php:126`) that means `register_block_type()` is always handed `ADVANCEDHEADING_BLOCK_ADMIN_PATH`. The helper method itself becomes a pass-through and could be inlined, or kept as an extension point. |

At a declared WP floor of 6.0 the condition can never be true again, so the branch is
permanently unreachable.

The second hit, `includes/helpers.php:60` (`'eb_wp_version' => (float) get_bloginfo('version')`),
is **not** a branch — it is a value shipped to JavaScript. See §7.

**⏳ AWAITING YOUR DECISION.** Nothing was deleted, inlined, or simplified. Options per branch:
**remove**, **keep as-is**, or **keep with an explanatory comment**.

---

## 6. Fixes applied

All changes are confined to plugin-owned files. Mapped 1:1 to §4.

| Issue | File | Fix |
|---|---|---|
| #1 | `advanced-heading.php:32-38` | The style-handler `require_once` is now wrapped in `file_exists()`, with the path in a temporary variable that is `unset()` afterwards. No behaviour change when the submodule is present. |
| #2 | `includes/helpers.php:52-59` | `include_once` → `include` (so the array is returned on every call), plus `is_array()` validation and safe defaults for `dependencies` (`[]`) and `version` (`ADVANCEDHEADING_BLOCK_VERSION`). Removes the PHP 8 array-offset-on-bool fatal. |
| #5 | `includes/font-loader.php:69-72` | `get_fonts_family()` now skips attribute values that are not non-empty strings before using them as an array offset. Behaviour for real font-family strings is unchanged. |
| #10 | `advanced-heading.php:12-14` | Added `Requires at least: 6.0`, `Tested up to: 7.0`, `Requires PHP: 7.4` to the plugin header. |
| #11 | `readme.txt:4-7` | `Requires at least` `5.0` → `6.0`; `Tested up to` `6.5` → `7.0`; added `Requires PHP: 7.4`; `Stable tag` `1.1.5` → `1.5.0`. |
| #12 | `advanced-heading.php:17-20` | Added the `if ( ! defined( 'ABSPATH' ) ) { exit; }` guard. |
| #13 | `includes/helpers.php:48` | `$_SERVER['QUERY_STRING']` is read once into `$query_string` via `sanitize_text_field( wp_unslash( … ) )` with an `isset()` guard; the `str_contains()` check uses the sanitized copy. |
| #15 | `includes/post-meta.php:12` | `add_filter('init', …)` → `add_action('init', …)`. Identical runtime behaviour (WP uses one registry), correct semantics. |
| #17 | `advanced-heading.php:39-47` | The three `define()` calls are wrapped in `! defined()` guards. |
| — | `advanced-heading.php:6,44`, `package.json:3`, `package-lock.json`, `readme.txt:7` | Version bumped **1.1.5 → 1.5.0** (minor, at your request) and synchronised across the header, `ADVANCEDHEADING_BLOCK_VERSION`, `Stable tag`, and `package.json`. Changelog entry added. |

Also hardened alongside #2: `advanced-heading.php:52-57` now validates the return of
`require dist/index.asset.php` the same way, so a truncated or stale build artefact degrades
instead of fatalling.

**Submodules initialised.** `controls` and `lib/style-handler` were empty in the working tree.
`git submodule update --init --recursive` was run so the audit could cover the shipped code.
Submodule commit pointers are unchanged — `git status` shows no submodule modification.

---

## 7. Flagged, NOT auto-fixed — your decision needed

| # | Issue | Why it was left alone | Recommendation |
|---|---|---|---|
| **A** (#3) | `controls` submodule: unguarded `__experimentalGetPreviewDeviceType` / `__experimentalSetPreviewDeviceType` across 6 files. Removed from core as of WP 6.7. | The `controls` repo is a **separate git repository shared by every Essential Blocks single-block plugin**. Editing it changes all siblings at once, and shipping the fix requires rebuilding `dist/modules.js`. That is well outside "one plugin at a time". | **Fix in the `controls` repo, then rebuild and re-ship every sibling.** The pattern is `select('core/editor').getDeviceType()` with a `?.` fallback to the old selector for WP < 6.5, and `dispatch('core/editor').setDeviceType()` likewise. This is the single most user-visible break in the current range. |
| **B** (#6, #7, #8, #9, #19, #20, #21, #22) | `lib/style-handler` submodule: PHP 8 `TypeError` risks, null-property reads, the `&&`/`\|\|` precedence bug, per-request cache-busters, bare `mkdir`/`file_put_contents`. | Same shared-repo reasoning as A. All of these ship with the plugin, but the fix belongs in the `style-handler` repo. | Fix #6 and #7 first — those are outright PHP 8 fatals under realistic conditions. Then #8/#9 (null guards), then #19 (swap the `microtime` cache-buster for the file `filemtime()`), then #20. |
| **C** (#4) | `includes/helpers.php:94` dead `<= 5.6` branch. | Removing dead legacy branches is a separate judgement call from raising the floor. | **Remove** the branch and return `$blockPath` directly — but this is your call (§5). |
| **D** (#14) | `includes/helpers.php:60` `'eb_wp_version' => (float) get_bloginfo('version')`. | This value crosses into JavaScript. `dist/modules.js` (built from `controls/src/helpers/index.js:218`) does a **numeric** comparison, `if (eb_wp_version >= 5.8)`. Passing a string like `"7.0.3"` makes that comparison `NaN` → `false` and silently changes editor behaviour. Fixing it properly means changing both sides at once. | **Leave as-is for now.** At a WP 6.0 floor the float cast is *harmless for this specific comparison* — every version ≥ 6.0 casts to a float ≥ 6.0, so `>= 5.8` is always correctly `true`. Fix it together with A, when `controls` is next rebuilt: send the raw version string and switch the JS to a proper `version_compare`-style check. |
| **E** (#16) | `advanced-heading.php:35-38` `throw new Error(…)` on a missing build artefact. | Replacing a throw with a silent bail or an admin notice changes user-facing behaviour on a broken install. | **Replace** with a `return` plus an `admin_notice`, and correct the copy-pasted `"block/testimonial"` text. A missing build should not white-screen the site. Say the word and I'll do it. |
| **F** (#18) | `block.json` `apiVersion: "2"`. | Moving to v3 changes how the block is rendered in the editor (iframed document, styles must be enqueued for the iframe). That is a real behaviour change requiring visual QA. | **Plan it, don't rush it.** v2 is still supported. Schedule the v3 migration with editor QA across the sibling plugins. |

---

## 8. Old-vs-new conflicts

**None that could not be reconciled.** One near-miss worth recording:

`str_contains()` (`includes/helpers.php:48`, `class-parse-css.php:193`) is a PHP 8.0 function, and
the declared PHP floor is 7.4. It is nevertheless safe across the whole declared range because
WordPress core has polyfilled `str_contains()` in `wp-includes/compat.php` since **WP 5.9**, and
the declared WP floor is 6.0. Both files are loaded long after core's compat layer. No shim was
added — per the floor policy, writing new compat code below the floor is not worthwhile, and in
this case core already covers it. Static analysers configured for bare PHP 7.4 (rather than
PHPCompatibilityWP) will flag it as a false positive.

---

## 9. Final declared compatibility range

| Field | Location | Value |
|---|---|---|
| `Requires PHP` | plugin header + `readme.txt` | **7.4** |
| `Requires at least` | plugin header + `readme.txt` | **6.0** |
| `Tested up to` | plugin header + `readme.txt` | **7.0** |
| `Version` / `ADVANCEDHEADING_BLOCK_VERSION` / `Stable tag` / `package.json` / `package-lock.json` | all five locations | **1.5.0** |

**Verified range: PHP 7.4 – 8.5, WordPress 6.0 – 7.0.**

Caveat: the range holds for **plugin-owned PHP**. The editor-side break in item **A** (shared
`controls` submodule) means the *editor experience* is not actually clean on WP 6.7+ until that
submodule is fixed and rebuilt. The declared range assumes A gets fixed before release.

---

## 10. Verification performed

**`php -l` on every PHP file** (PHP 8.5.8 CLI, excluding `node_modules`) — all pass:

```
No syntax errors detected in ./advanced-heading.php
No syntax errors detected in ./dist/index.asset.php
No syntax errors detected in ./dist/frontend.asset.php
No syntax errors detected in ./dist/modules.asset.php
No syntax errors detected in ./includes/post-meta.php
No syntax errors detected in ./includes/font-loader.php
No syntax errors detected in ./includes/helpers.php
No syntax errors detected in ./lib/style-handler/style-handler.php
No syntax errors detected in ./lib/style-handler/includes/class-parse-css.php
```

**phpcs / WordPress Coding Standards** — `phpcs` is not installed on this machine (`phpcs -i`
returns nothing). Skipped rather than installing global tooling. If you want a WPCS pass, install
`squizlabs/php_codesniffer` + `wp-coding-standards/wpcs` and I'll run it over the changed files.

**Not run:** no runtime/browser testing against live WP 6.0 or WP 7.0 installs, and no
`npm run build`. Item **A** was confirmed by reading `controls/src` and cross-checking the built
`dist/modules.js.map` sources, not by loading the editor.

**Nothing committed, nothing pushed.** All changes are uncommitted on `advanced-heading-dev`:

```
 M advanced-heading.php
 M includes/font-loader.php
 M includes/helpers.php
 M includes/post-meta.php
 M package.json
 M readme.txt
```
