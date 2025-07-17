# DiscordGym - Repository Split Guide

## Option 1: Monorepo beibehalten (EMPFOHLEN)
```bash
# Aktueller Zustand - perfekt für Abgabe
DiscordGym/
├── client/     # Angular Frontend
├── server/     # NestJS Backend  
├── README.md   # Gemeinsame Dokumentation
└── start.bat   # Ein-Befehl Start
```

## Option 2: Repositories trennen
```bash
# Separate Repositories erstellen
git subtree push --prefix=client origin client-repo
git subtree push --prefix=server origin server-repo

# Oder neue Repos:
mkdir ../DiscordGym-Frontend
mkdir ../DiscordGym-Backend
cp -r client/* ../DiscordGym-Frontend/
cp -r server/* ../DiscordGym-Backend/
```

## Warum Monorepo für dieses Projekt?
✅ Ein `git clone` für Professor
✅ Ein `npm start` für alles  
✅ Synchronized Versioning
✅ Einfachere CI/CD
✅ Atomic Commits für Full-Stack Features
✅ Moderne Best Practice

## Wann separate Repos?
- Verschiedene Teams
- Unabhängige Deployment-Zyklen  
- Sehr große Projekte (>100k LOC)
- Unterschiedliche Technologie-Stacks
