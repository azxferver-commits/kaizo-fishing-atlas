# BlueQuest Atlas — App móvil nativa

Proyecto Capacitor para Android e iPhone.

## Estado
- 274 entradas Blue Quest 1–80.
- 159 entradas Blue Quest 80–100.
- 433 entradas empaquetadas para uso offline.
- Búsqueda, filtros, favoritos, progreso y exportación/importación local.
- App ID: `com.kaizo.bluequest`.

## Generar la web nativa
```bash
npm install
npm run prepare:web
```

El script toma la versión estable de `bluequest-mobile-v4/index.html`, copia los dos Atlas completos y adapta los enlaces web para funcionar dentro de la app.

## Android
```bash
npm install
npm run prepare:web
npx cap add android
npx cap sync android
cd android
./gradlew assembleDebug
```

El APK queda en:
`android/app/build/outputs/apk/debug/app-debug.apk`

GitHub Actions también puede construirlo automáticamente.

## iPhone / iOS
En macOS con Xcode:
```bash
npm install
npm run prepare:web
npx cap add ios
npx cap sync ios
npx cap open ios
```

Para instalar en un iPhone físico se necesita firma de Apple. Para TestFlight/App Store se necesita una cuenta Apple Developer.
