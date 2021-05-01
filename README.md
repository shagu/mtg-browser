# mtg-browser

A small node.js project that allows to export scans of your [Magic: The Gathering](https://magic.wizards.com) card collection to plain images and a simple and responsive html-site to browse, filter and search for specific cards. One of the goals is, to make it easier to build decks out of your local collection and to keep track of your cards. This is the successor of [delver-export](https://github.com/shagu/delverexport) and a partial rewrite from [Lua](https://www.lua.org) to [Node.js](https://nodejs.org). Please bear with me, you will see many bad coding habits, I'm a JS novice and learning by doing.

## Preview

To see the mtg-browser frontend in action, visit the **[MTG Browser Demo Website](https://shagu.github.io/mtg-browser-demo/)**. The page is showcasing an example output of the `make www` command, using a subset of some of my legacy cards, that was then uploaded to GitHub Pages.

[![preview.jpg](preview.jpg)](https://shagu.github.io/mtg-browser-demo/)

## How-To-Use

1. Scan your cards with [DelverLens](https://www.delverlab.com)
2. Inside the app, export your collection ("Create Backup File")
3. On your PC, Install `mtg-browser`:

```
git clone https://github.com/shagu/mtg-browser
cd mtg-browser
npm install
```

4. Now place the backup file and the latest [DelverLens APK](https://apps.evozi.com/apk-downloader/?id=delverlab.delverlens) into the "`input`" directory
5. To run the mtg-browser tool, type:

```
make
```

6. Open the `index.html`, **done!**

### Make targets
Possible `make` targets are:

```
make            - Runs update, clean and core
make update     - Download MTGJSON data, extract Delver's built-in database and prepares your backup
make core       - Only run the main programm
make clean      - Clean the `./collection` folder
make distclean  - Clean the `./collection` folder and reset everything done by `make update`
make www        - Runs update, clean, core and copies website related files into the `www/` folder
```

### Supported Card Scanners

  - [DelverLens](https://www.delverlab.com) - MTG Card Scanner

## Thanks

- **Delver Lens**
It's by far the best card scanner and organizer out there - even without being opensource (maybe one day?). If you have an Android-Phone and no card scanner yet, get it now! I have tried many apps, but delver lens stands out for its good organized interface, the card detection algorithm and especially the clean sqlite-export of collections.
