# JRTunes

A premium, Spotify-styled music app: plays every audio file already on your
phone/SD card, plus a legal online catalog (Creative-Commons tracks +
podcasts) you can search, stream, and download for offline use. Synced
lyrics via lrclib.net.

## Features
- **Local Library** — scans the entire device (internal storage + any SD
  card) for audio files and merges them into one searchable list.
- **Discover (online)** — search & download Creative-Commons licensed
  tracks from Jamendo — free to download legally.
- **Podcasts** — search shows via iTunes' free directory, stream/download
  episodes straight from their public RSS feeds.
- **Downloads** — everything you've saved for offline playback.
- **Player** — background playback, lock-screen controls, synced lyrics
  panel (lrclib.net, free & open, attributed in-app).

## One-time setup
1. `npm install`
2. Get a free Jamendo client ID at https://developer.jamendo.com and paste
   it into `src/services/JamendoService.js` (`CLIENT_ID`).
3. Push this repo to GitHub.

## Building the APK
This repo includes `.github/workflows/build-apk.yml`. On every push to
`main`, GitHub Actions builds a release APK and attaches it as a downloadable
workflow artifact (Actions tab → latest run → Artifacts → `JRTunes-apk`).

To build locally instead:
```
npm install
cd android && ./gradlew assembleRelease
```
The APK will be at `android/app/build/outputs/apk/release/app-release.apk`.

### Signing for real release / Play Store
The workflow currently signs with the Android debug key, which is fine for
sideloading/testing but not for Play Store. To ship for real:
1. Generate a keystore: `keytool -genkeypair -v -keystore release.keystore -alias jrtunes -keyalg RSA -keysize 2048 -validity 10000`
2. Add it as a GitHub Actions secret (base64-encoded) and update
   `android/app/build.gradle`'s `signingConfigs.release` to use it instead
   of the debug config.

## Legal notes
- The Discover tab only surfaces Creative-Commons licensed tracks
  (Jamendo), which explicitly permit free download — this keeps the
  "download for offline" feature on solid legal ground.
- Podcasts are fetched from each show's own public RSS feed, exactly how
  every podcast app works.
- This app intentionally does **not** include a "search and rip audio from
  arbitrary websites/streaming services" feature — that would enable
  copyright infringement and isn't something this project supports.
- Lyrics come from lrclib.net, a free community lyrics database; it's
  in-app attributed and coverage may be incomplete for less popular tracks.

## Tech stack
React Native 0.74 · react-native-track-player · react-native-fs ·
react-navigation · react-native-permissions
