BuildArchitectures: x86_64
Name:          migasfree-play
Version:       5.5
Release:       0
Summary:       GUI for migasfree client
License:       GPLv3
Packager:      Jose Antonio Chavarría
Vendor:        migasfree team
Source0:       %{name}-%{version}.tar.gz
URL:           https://github.com/migasfree/migasfree-play
Requires:      migasfree-client >= 4.20, sudo, bash, cronie, curl, nodejs >= 12
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
