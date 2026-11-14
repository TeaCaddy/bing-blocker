# Third-party notices

## tldts

This extension bundles tldts 7.5.2 in `vendor/tldts.js`. The tldts library is licensed under MIT.

Source: https://github.com/remusao/tldts

The license is included in `vendor/tldts-LICENSE`. The runtime is fully bundled; no remote scripts are loaded.

## Public Suffix List

tldts includes compiled lookup data derived from the Public Suffix List. The upstream list is provided under the Mozilla Public License 2.0, independently of the project's MIT license.

- Upstream list and license notice: https://publicsuffix.org/list/public_suffix_list.dat
- License: https://mozilla.org/MPL/2.0/
- Corresponding dependency source, generated lookup data, and upstream submodule history: https://github.com/remusao/tldts (version 7.5.2)

The list embedded in this extension is the one distributed with the pinned tldts version, not a live download of the current list. No list is downloaded at runtime.

## Development tools

Playwright 1.65.0 is used for testing under the Apache-2.0 license. It is installed via npm and is not shipped as extension runtime code. Its license is included in its npm package: https://github.com/microsoft/playwright/blob/main/LICENSE . Transitive dependency versions and package sources are recorded in `package-lock.json`.
