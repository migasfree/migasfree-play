BuildArchitectures: x86_64
Name:          migasfree-play
Version:       5.14
Release:       0
Summary:       Desktop graphical interface for Migasfree
License:       GPLv3
Packager:      Jose Antonio Chavarría
Vendor:        migasfree team
Source0:       %{name}-%{version}.tar.gz
URL:           https://github.com/migasfree/migasfree-play
Requires:      migasfree-client >= 4.20, sudo, bash, cronie, curl, util-linux, nodejs >= 18
BuildRoot:     %{_tmppath}/%{name}-%{version}

%description
Desktop graphical interface for Migasfree. Enables end-users to securely manage software catalogs, devices, and client synchronization.

%prep
%setup -q
rm -rf %{buildroot}
mkdir -p %{buildroot}
cp -r * %{buildroot}

%files
%defattr(-,root,root)
%define _unpackaged_files_terminate_build 0
%define _missing_doc_files_terminate_build 0
%attr(755,root,root) /usr/bin/*
/usr/share/*
%attr(440,root,root) /etc/sudoers.d/*
%attr(755,root,root) /etc/xdg/autostart/*

%config
/etc/sudoers.d/*
/etc/xdg/autostart/*

%doc

%clean
rm -rf %{buildroot}

%post
# SUID chrome-sandbox for Electron 5+
chmod 4755 /usr/share/migasfree-play/chrome-sandbox || true

%changelog
* Fri, 10 Jul 2026 Jose Antonio Chavarría <jachavar@gmail.com> - 5.14-0
- feat(theme): implement system-aware 3-way theme selector
- feat(apps): implement multi-state status filtering
- feat(ui): replace locked app concept with not available status and list missing packages
- feat(build): migrate renderer build system from Webpack to Vite
- fix(executions): prevent duplicate log output by clearing IPC listeners
- fix(executions): normalize raw commands to friendly titles and icons
- feat(security): implement strict input validation for IPC handlers
- feat(store): trigger success toast on preference changes
- feat(ui): implement WCAG 2.1 AA accessibility guidelines
- refactor(stores): separate client-version and server-version logic
- refactor(electron): add v4 client guards to all IPC handlers
- perf(electron): memoize version and config CLI commands
- refactor(packaging): deploy to Program Files with unified shim on Windows
- fix(packages): reload installed packages using catalog list after execution
- fix(devices): map both feature and capability properties for v4 capabilities
- feat(devices): fallback to local capabilities for v4 servers
- feat(ui): auto-load apps, devices, and tags on demand when sections are enabled
- feat(executions): restore smart autoscroll and manual scroll lock in terminal
- fix(autoupdate): implement continuous low-frequency background update polling
- feat(devices): delegate logical device assignment and default setting to CLI on client v5
- feat(ipc): decouple Electron handlers from Python internals using native CLI subcommands
- feat(ui): add attributes grid and JSON export in computer info
- feat(executions): track manual cancellations and allow copy in terminal
- feat(client): implement hybrid v4/v5 execution model
- feat(ui): add registration banner and computer registration status
- feat(auth): enable transparent mTLS and make credentials innocuous on client v5
- feat(ui): integrate structured JSON output for execution stages
- refactor(executions): migrate safety timeouts to main process
- refactor(executions): implement persistent process manager and robust JSON handling
- refactor(stores): eliminate circular dependencies and state re-exports
- perf(stores): optimize data fetching and prevent redundant API calls
- fix(packaging): allow 301, 401, 403 status codes on startup check
- fix(deps): upgrade core dependencies
- fix(ipc): use --password instead of --pwd for migasfree register command

* Wed, 25 Mar 2026 Jose Antonio Chavarría <jachavar@gmail.com> - 5.13-0
- feat(auto-update): implement event-driven background update detection
- feat(i18n): add translations for the updated restart dialog in ES, FR, GL, CA, and EU
- fix(packaging): remove 'set -e' from wrapper script to prevent silent failures in cron environments

* Mon, 16 Mar 2026 Jose Antonio Chavarría <jachavar@gmail.com> - 5.12-0
- feat(ui): complete redesign aligned with migasfree-frontend
- feat(ui): implement glassmorphism and premium aesthetics
- feat(ui): integrate xterm.js for professional terminal output
- feat(ui): redesign computer label for 80x50mm thermal printers
- feat(ux): add copy to clipboard in error dialog and terminal
- feat(sync): implement headless trigger to allow background synchronization from secondary instances
- feat(a11y): implement Phase 2 of accessibility audit (WCAG 2.1 AA compliance)
- feat(i18n): complete translations for ES, FR, CA, EU, and GL
- fix(ui): improve scroll behavior and auto-scrolling during executions
- fix(sync): resolve race conditions and JSON parsing errors during store initialization
- style(ui): improve notifications and dialog aesthetics with glassmorphism
- refactor(ui): centralize icon management in a dedicated composable
- refactor: improve server info retrieval for better v4/v5 compatibility
- test(qa): implement edge case testing and robust mapping for hardware and product icons

* Tue, 10 Feb 2026 Jose Antonio Chavarría <jachavar@gmail.com> - 5.11-0
- feat: upgraded several components (node >= 22.12)
- fix: avoid multiple crontab writing
- feat: added util-linux dependency (flock usage)
- refactor: api operations
- feat: added wayland support
- feat: get computerData after sync
- fix: only get categories if showApps
- fix: chip vertical align
- feat: added PageHeader component
- fix: run on exit with code !== 0
- feat: added automated retry connection
- feat: added cancel button and spinner during execution
- feat: added fr_FR to translations
- feat: added new composables (usePagination, usePageSync)
- refactor: typeface* replaced by @fontsource/*
- refactor: ipc usage to improved app security
- refactor: replaced electronRemote by window.electronAPI
- refactor: replaced QR component
- fix: sensible files reading
- feat: separate python code from javascript code
- refactor: express removed
- fix: devices page
- feat: added debug file
- fix: getLogicalDevice url
- fix: possible devices duplication (v4)
- refactor(auth): separate token management into single-responsibility functions
- refactor(program): optimize auth flow to validate before requesting
- feat(ui): redesign app splash screen with timeline and error card
- feat(ui): redesign identity card and implement dedicated print view
- fix(token): implement robust ssl ca discovery and crash handling

* Fri, 5 Sep 2025 Jose Antonio Chavarría <jachavar@gmail.com> - 5.10-0
- fix: app initial values
- fix: window height (when < 800)
- fix: replaced sleep function by waitForServer (loop)
- feat: upgraded several components (node >= 20.19)

* Thu, 30 Jan 2025 Jose Antonio Chavarría <jachavar@gmail.com> - 5.9-0
- feat: added nsis and msi properties
- fix: added 'ignore-certificate-errors' to electron app to avoid ERR_CERT_AUTHORITY_INVALID
- fix: notifyInfo icon
- fix: removed core-js component (build issue)
- feat: Quasar upgraded to 2.17 (node >= 18)
- feat: one icon to rule them all
- feat: added search feature in software inventory
- feat: added icons to toggle buttons to improve UX
- feat: upgraded vue3-gettext component
- feat: added page scroller
- refactor: device info
- feat: added /manage-devices endpoint
- refactor: changed notifyInfo properties
- feat: added BannerInfo component
- fix: changed electron-packager by @electron/packager
- fix: added resolutions key to avoid express errors after build project

* Mon, 3 Jun 2024 Jose Antonio Chavarría <jachavar@gmail.com> - 5.8-0
- feat: call computerId after sync if operation has launched autoregister
- feat: added notify info after sync command
- feat: tag actions must be executed with privileged user

* Fri, 12 Jan 2024 Jose Antonio Chavarría <jachavar@gmail.com> - 5.7-0
- feat: improved readibility in replaceColors function (spaces and tabs at the beginning of the lines)
- feat: show execution error if exists
- fix: only execute actions if has been set in preferences (init function)
- feat: added trimEndSpaces function
- feat: starts minimized with sync argument

* Fri, 3 Nov 2023 Jose Antonio Chavarría <jachavar@gmail.com> - 5.6-0
- feat: added packages in install and uninstall tooltips
- fix: verify if server has been configured
- feat: added natural scroll down thanks to scroll observer component

* Tue, 20 Jun 2023 Jose Antonio Chavarría <jachavar@gmail.com> - 5.5-0
- feat: minimum node version to 14
- feat: upgraded several components
- fix: id route
- feat: added register route
- feat: added register component
- refactor: increased max rateLimit
- feat: updated translations

* Tue, 16 May 2023 Jose Antonio Chavarría <jachavar@gmail.com> - 5.4-0
- feat: added software inventory info
- feat: updated translations
- feat: upgraded several components

* Fri, 21 Apr 2023 Jose Antonio Chavarría <jachavar@gmail.com> - 5.3-0
- feat: added update preferences action
- feat(design): changed project icon
- feat: combine multiple arguments in any order (sync and debug)
- feat: upgraded several components
- feat(i18n): added Name and Comment entries in ca, eu and gl
- fix: set env process too in python shell options (if not, fails in windows)
- fix: changed browserslist (to build in windows)
- fix: ensure synchronization execution every 24 hours

* Thu, 30 Mar 2023 Jose Antonio Chavarría <jachavar@gmail.com> - 5.2-0
- fix: redirect to details page if no show apps setting
- feat(settings): added MFP_EXECUTIONS_LIMIT (5 by default)
- fix: usage of Reflect.ownkeys in addExecution function

* Fri, 24 Mar 2023 Jose Antonio Chavarría <jachavar@gmail.com> - 5.1-0
- fix: stopApp value false at the begining
- feat: added retry button if app stopped
- fix: launch express sever before mainWindow
- fix: await launch express app

* Mon, 20 Mar 2023 Jose Antonio Chavarría <jachavar@gmail.com> - 5.0-0
- App rewritten in Vue and Quasar frameworks.
