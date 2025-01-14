# PrintSync3D

Web application for centralized management of 3D printers via a Raspberry Pi and local server website.

**Authors:** *Alan Burić, Filipa Bebek, Boris Vujica*

# Hardware

This application is intended for a stronger Raspberry Pi computer with network access and ability to connect via serial
ports to the old Prusa 3D printers, e.g. Prusa i3 MK2S.

# Usage guide

Firstly, in the `backend` directory define your `.env` by making a copy next to and from the `.env.example` file.

Currently, the way of using the application is to start both the backend and frontend server.

## Installation

We usually use the latest Node.js and NPM versions.

```
cd backend
npm ci
cd ../frontend
npm ci
```

## Development

Use the `dev` scripts defined in both directory `package.json` files.

## Deployment

### Option 1. Fully reliable deployment

1. Install the latest version of Node.js and NPM on your target device.
2. Copy the source code onto the device.
3. Run the usual `build` scripts for the two `package.json` files, producing a `dist` build directory.
4. Run the usual `start` scripts for the two `package.json` files, preferably in separate shells or using the ability to
   run multiple commands at once by separating them with the `&` symbol, or installing via NPM a package such as
   `concurrently` and configuring a script to run both.

### Option 2. Minimized file size deployment

1. Install the latest version of Node.js and NPM on your computer.
2. Run the `build:esbuild` scripts for the two `package.json` files, producing a `dist` build directory with a single
   JavaScript file.
3. Copy the file to your target device into a directory.
4. Run `npm install serialport --no-save --no-package-lock` in the same directory.
5. Run `node <filename>.js` for both JavaScript files, concurrently as described in the previous option.