BuildArchitectures: x86_64
Name:          migasfree-play
Version:       5.2
Release:       0
Summary:       GUI for migasfree client
License:       GPLv3
Packager:      Jose Antonio Chavarría
Vendor:        migasfree team
Source0:       %{name}-%{version}.tar.gz
URL:           https://github.com/jact/migasfree-play
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
* Mon, 20 Mar 2023 Jose Antonio Chavarría <jachavar@gmail.com> - 5.0-0
- App rewritten in Vue and Quasar frameworks.

* Fri, 24 Mar 2023 Jose Antonio Chavarría <jachavar@gmail.com> - 5.1-0
- fix: stopApp value false at the begining
- feat: added retry button if app stopped
- fix: launch express sever before mainWindow
- fix: await launch express app

* Thu, 30 Mar 2023 Jose Antonio Chavarría <jachavar@gmail.com> - 5.2-0
- fix: redirect to details page if no show apps setting
- feat(settings): added MFP_EXECUTIONS_LIMIT (5 by default)
- fix: usage of Reflect.ownkeys in addExecution function
