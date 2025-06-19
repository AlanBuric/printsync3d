# PrintSync3D

Web application for centralized management of 3D printers via a Raspberry Pi and local server website.

**Authors:** _Alan Burić, Filipa Bebek, Boris Vujica_

## Features

- **Printers:**
  - connect via serial ports
  - detect them in the web application
  - give names to printers
- **Printer controls:**
  - auto home
  - mesh bed leveling
  - reset XYZ
  - load filament, unload filament
  - preheat for PLA, ABS, PET filament types
  - cool down temperature
  - pause, resume, cancel
  - move up, down, left, right, forward, backward (XYZ +/-)
  - print uploaded model
- **Models:**
  - upload models onto the server
  - rename models
  - delete models
  - print uploaded models

## Hardware

This application is intended for a computer with network access and ability to connect via serial ports to Prusa 3D printers. The applications were developed against the Prusa i3 MK2S printers.

## Development phase

**Prerequisites:** Node.js, NPM

In the `backend` directory define your `.env` by making a copy of the `.env.example` file.

Then, install the NPM packages:

```
cd backend
npm ci
```

```
cd frontend
npm ci
```

If `npm ci` is causing issues, try using `npm i` instead.

Then, you can run the backend and frontend services in two separate terminals:

```
cd backend
npm run dev
```

```
cd frontend
npm run dev
```

That's it, the website should be available at http://localhost:3000 by default, and the changes you make to the backend and frontend cause the services to restart upon save.

## Build phase

Building is usually only used for deployment, but it's important to check that your backend and frontend services properly compile after you've made code changes.
You can use the build scripts in the `frontend` and `backend` directories for that, e.g. `npm run build`.
You can even start the built files using `npm run start`.

## Deployment using Ansible

**Prerequisites:** Ansible, Docker

### Ansible

Ansible automates the deployment and environment setup of whatever computers you specify in an `inventory.yml` file.
It doesn't work on Windows, but does in e.g. WSL.
Install Python3, pipx and finally Ansible. [Here](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html#installing-and-upgrading-ansible) is the documentation in greater detail.

### Docker

Docker containerizes and isolates the application's services.
You'll need it to build the images, while the control node will need Docker engine to run them.
If you wish to override the pre-defined environment varibles in `compose.yml`, create an `.env` file next to it.

### Build and deployment steps

1. Build the Docker images locally in the root directory: `docker compose build`.
2. Save the Docker images to .tar files:

   ```
   docker save -o frontend.tar printsync3d-frontend
   docker save -o backend.tar printsync3d-backend
   ```

3. Configure Ansible `inventory.yml` with your target computers for deployment, locally adapt `ansible/deployment-example.yml` if needed.
4. Run `ansible-playbook -i ansible/inventory.yml ansible/deployment-example.yml`.
5. Once done, both services should be deployed and started. To test, you can access the IP address of the target computer in your browser to see the website.
