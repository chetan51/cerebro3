# Cerebro 3

Demo for Cerebro 3 (a web-based visualization platform for Neural Networks).

## Usage

(Requires [Git LFS](https://git-lfs.github.com) to be installed.)

1. Enter demo directory: `cd demo`
2. Start server (with Python 3): `python -m http.server`
3. Open page: `http://localhost:8000`.

## Development

(Requires [Watchify](https://github.com/browserify/watchify) to be installed.)

1. Run `watchify src/main.js -o js/bundle.js` (edits to JavaScript source files will now be bundled into the output webapp).
2. Start server (with Python 3): `python -m http.server`
3. Open page: `http://localhost:8000`.
