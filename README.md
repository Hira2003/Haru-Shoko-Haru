# Haru Shoko Haru 🍫

A pastel chocolate match-three game for Android, built with Expo / React Native.

## Play
- An 8 × 8 board uses the five original Haru chocolate PNGs in `assets/`.
- Tap a chocolate, then an adjacent chocolate to swap.
- Match at least three in a row or column. Invalid swaps do not cost a move.
- Every level starts with **30 moves**. Reach the score target to unlock the next level.
- Each removed chocolate earns 10 points, multiplied by the cascade number.
- Level 1 target: 1,800 points; each subsequent level adds 350.
- Free hints, automatic dead-board reshuffles, retry and next-level controls.
- Highest unlocked level is saved on the device. An unfinished round resets when the app closes.
- This first version contains the level screen; a level map, special chocolates and audio are not included yet.

## Run
Use a current Node.js LTS release supported by Expo SDK 58 (Node 22.13+ recommended), or a cloud terminal such as GitHub Codespaces. Windows 7 is not a supported modern Node development environment.

```sh
npm ci
npx expo start
```

## Build an installable APK

```sh
npx eas-cli@latest login
npx eas-cli@latest init
npm run build:apk
```

`init` links the app to your Expo account and writes its real project ID to `app.json`. Commit that change. When asked, let Expo generate an Android keystore. Keep using the same Expo project and signing credentials for future updates.

`eas.json` already includes a `preview` profile with `android.buildType: "apk"`. Download the resulting APK from the build page and install it on Android. No Play Store account is needed for direct APK installation. The production profile builds an AAB for Play Store distribution.

## Home-screen app icon

The launcher icon is already configured in `app.json`:

```json
{
  "expo": {
    "icon": "./assets/icon.png",
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/icon.png",
        "backgroundColor": "#f2e5f8"
      }
    }
  }
}
```

To replace it, supply a square PNG at `assets/icon.png` (1024 × 1024 recommended), keep the important artwork centered, and build a new APK. Installing the APK creates the app's home-screen/app-drawer icon; changing an image alone does not update an already installed APK. The current design uses an opaque lavender background and chocolate artwork.

## Checks

```sh
npm test
npm run lint
npm run typecheck
npx expo export --platform android --platform web
```

Unit tests cover playable starting boards, matching intersections, adjacency, gravity and immutable swaps. Native Android installation must be tested after the signed APK is built.

## Source and assets

`App.js`: level interface and turn animation. `src/game.js`: pure match-three logic. `tests/`: game rules tests. `assets/`: original chocolate artwork and launcher icon.
