BuildArchitectures: x86_64
Name:          migasfree-play
Version:       5.9
Release:       0
Summary:       GUI for migasfree client
License:       GPLv3
Packager:      Jose Antonio Chavarría
Vendor:        migasfree team
Source0:       %{name}-%{version}.tar.gz
URL:           https://github.com/migasfree/migasfree-play
Requires:      migasfree-client >= 4.20, sudo, bash, cronie, curl, nodejs >= 18
BuildRoot:     %{_tmppath}/%{name}-%{version}

%description
migasfree play is a GUI for migasfree client

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
* Thu, 19 Sep 2024 Jose Antonio Chavarría <jachavar@gmail.com> - 5.9-0
- feat: added nsis and msi properties
- fix: added 'ignore-certificate-errors' to electron app to avoid ERR_CERT_AUTHORITY_INVALID
- fix: notifyInfo icon
- fix: removed core-js component (build issue)

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
