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

Run commands from the repository root: the folder containing `package.json`, `app.json`, and `eas.json`. In an existing clone, pull the latest changes first. For a fresh checkout:

```sh
git clone https://github.com/Hira2003/Haru-Shoko-Haru.git
cd Haru-Shoko-Haru
npm ci
npx eas-cli@latest login
npx eas-cli@latest project:info
npm run build:apk
```

Log in with the Expo account that can access owner `haruna2003`. The repository already links to project ID `9431a435-7f9c-4bef-accd-ad9650768434`; do not create a second project or run `init` routinely. `project:info` verifies the existing link. If Expo reports a slug mismatch, compare its project slug with `expo.slug` in `app.json` and use the existing project's actual slug. The GitHub repository name and Expo display name do not have to match.

On the first interactive build, let Expo generate an Android keystore if it asks. Keep using the same project and signing credentials for future updates.

`eas.json` includes a `preview` profile with `android.buildType: "apk"`. Download the resulting APK from the build page and install it on Android. No Play Store account is needed for direct APK installation. Both preview and production profiles build an APK for direct installation. For a future Play Store release, use a separate profile with android.buildType set to "app-bundle".

### Build from GitHub Actions

The workflow is at `.github/workflows/build-apk.yml` and uses Node 22. It is manual so commits do not automatically consume builds.

1. Complete the first interactive build above to configure Android signing credentials. Non-interactive CI cannot answer first-time credential prompts.
2. Create an Expo access token at https://expo.dev/accounts/haruna2003/settings/access-tokens.
3. In this GitHub repository, open **Settings → Secrets and variables → Actions → New repository secret**. Name it `EXPO_TOKEN` and paste the token as its value. Never put the token in a file or commit.
4. Open **Actions → Build Android APK → Run workflow**, select `main`, and start it.
5. Open the Expo build link in the **Build APK** step to download the finished APK. The APK is hosted by Expo, not uploaded as a GitHub Actions artifact.

### Common command errors

- **Failed to read package.json / ENOENT:** you are likely outside the project folder. Run `pwd` (or `cd` on Windows) and list the files. Change into the directory containing `package.json`. For Expo's GitHub integration, the app base directory is the repository root, not `workflows/` or another nested folder.
- **eas: command not found:** use `npx eas-cli@latest <command>` rather than bare `eas`. `npm run build:apk` already does this.
- **Unsupported Node engine:** use Node 22.13+ in the Node 22 line, or another version supported by the installed React Native. Use Codespaces if your computer cannot run modern Node.
- **Expo project access or slug error:** run `npx eas-cli@latest whoami` and `npx eas-cli@latest project:info`; verify the account and existing project before editing `app.json`.

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

## Level 7 special chocolates

Levels 1–6 keep the original 8×8 board. From level 7, the board is 9×9 with a compact header and wider layout. Match four same-color chocolates to earn a bar with a randomly assigned row (↔) or column (↕) direction. Match five or more connected chocolates (including T/L matches) to earn a jar. Include a special in a same-color match to activate it: bars clear their line, jars clear a centered 3×3 area, clipped at edges. Blasts trigger other specials. Newly created specials survive their creation cascade and fall with gravity.

A tutorial appears at level 7; later levels show rotating tips. The ? button reopens the rules. The game still allows 30 moves per level.
