# PrintSync3D

Web application for centralized management of 3D printers via a Raspberry Pi and local server website.

**Authors:** *Alan Burić, Filipa Bebek, Boris Vujica*

# Hardware

This application is intended for a stronger Raspberry Pi computer with network access and ability to connect via serial
ports to the old Prusa 3D printers, e.g. Prusa i3 MK2S.

# Usage guide

Firstly, in the `backend` directory define your `.env` by making a copy next to and from the `.env.example` file.

Currently, the way of using the application is to start both the backend and frontend server.

## Setup

We usually use the latest Node.js and NPM versions. Simply run `npm run setup` in the root directory.

## Development

Use the `dev` scripts defined in both directory `package.json` files to launch one of the servers, or `npm run dev` in
the root directory to launch both at once.

The `-r` flag is required for `concurrently` because the console log and color control doesn't let the backend start up.

## Deployment

### Option 1. Fully reliable deployment

1. Install the latest version of Node.js and NPM on your target device.
2. Copy the project onto the device.
3. Run `npm run setup`.
4. Run `npm run build`.
5. Run `npm run start`, or create a custom setup for that utilizes each directory's `start` script, e.g. via services or
   shells.

### Option 2. Minimized file size deployment

1. Install the latest version of Node.js and optionally NPM on your computer.
2. Run the `build:esbuild` scripts for the two `package.json` files, producing a `dist` build directory with a single
   JavaScript file.
3. Copy the file to your target device into a directory.
4. Run `npm install serialport --no-save --no-package-lock` in the same directory or possibly copy it over
   from another computer. The latter might not work.
5. Run `node <filename>.js` for both JavaScript files in two different shells or also install `concurrently` use it
   similarly as the root directory's `package.json` scripts. 