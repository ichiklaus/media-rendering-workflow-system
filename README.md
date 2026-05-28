````md
# Configure Environment

> [!IMPORTANT]
> For the app to work correctly you need:
>
> - Node.js
> - MySQL
> - A Chrome configuration change

---

## Install Dependencies

1. Open a terminal in the project root folder

2. Run:

```bash
npm install
```

3. Wait for the dependencies to finish installing

---

## Configure Chrome

> [!WARNING]
> Chrome blocks some required local network behavior by default.
> This setting must be disabled before using the app.

1. Open Google Chrome

2. Open the following URL:

```text
chrome://flags/#local-network-access-check
```

3. Change the dropdown value to:

```text
Disabled
```

4. Restart Chrome

---

## Start the App

1. Locate:

```text
run-dev-preview.bat
```

2. Double-click the file

3. Wait for the servers to start

> [!TIP]
> Keep the terminal windows open while using the application.

---

## Render Videos

1. Start the servers

2. Open:

```text
http://localhost:3000
```

3. Select the campaign

4. You will see recipients with available recordings

5. Click:

```text
Render
```

6. Wait a few minutes, then click:

```text
Refresh Status
```

to verify whether the videos rendered successfully.

---

# Web App Usage Guide

This guide explains two usage contexts:

1. Developer workflow
2. End-user workflow on a local computer

# Remotion Render Configuration Guide

This project supports **two rendering quality modes**:

- **CRF mode**: better when you want more consistent quality control
- **Bitrate mode**: required when using hardware acceleration

You must use **only one mode at a time**.

### 1. Main environment variables

Add or update these values in your `.env` file:

```env
VIDEO_RENDER_AUDIO_CODEC=aac
VIDEO_RENDER_VIDEO_CODEC=h264
VIDEO_RENDER_CONCURRENCY=5
VIDEO_RENDER_TIMEOUT_MS=30000
VIDEO_RENDER_IMAGE_FORMAT=png
VIDEO_RENDER_HARDWARE_ACCELERATION=disabled
VIDEO_RENDER_JPEG_QUALITY=95
VIDEO_RENDER_CRF=18
VIDEO_RENDER_BITRATE=3000k
VIDEO_RENDER_COLOR_SPACE=bt709
VIDEO_RENDER_QUALITY_MODE=crf
```

---

### 2. Choose one render mode

#### Option A: CRF mode
Use this when you want better quality control and are **not** using hardware acceleration.

```env
VIDEO_RENDER_QUALITY_MODE=crf
VIDEO_RENDER_HARDWARE_ACCELERATION=disabled
VIDEO_RENDER_CRF=18
```

Notes:
- `VIDEO_RENDER_BITRATE` can stay in the file, but it will be ignored in CRF mode.
- Good default: `VIDEO_RENDER_CRF=18`

---

#### Option B: Bitrate mode
Use this when you want to use hardware acceleration or explicitly control bitrate.

```env
VIDEO_RENDER_QUALITY_MODE=bitrate
VIDEO_RENDER_HARDWARE_ACCELERATION=if-possible
VIDEO_RENDER_BITRATE=3000k
```

Notes:
- `VIDEO_RENDER_CRF` can stay in the file, but it will be ignored in bitrate mode.
- Increase bitrate if video quality looks too compressed.

---

### 3. Image format recommendation

Recommended default:

```env
VIDEO_RENDER_IMAGE_FORMAT=png
VIDEO_RENDER_COLOR_SPACE=bt709
```

Use `png` when you want better preservation of light textures and cleaner frame rendering.

If you switch to JPEG:

```env
VIDEO_RENDER_IMAGE_FORMAT=jpeg
VIDEO_RENDER_JPEG_QUALITY=95
```

---

### 4. Important rules

- Do **not** use `VIDEO_RENDER_QUALITY_MODE=crf` together with hardware acceleration enabled
- Do **not** try to pass both CRF and bitrate at the same time
- `VIDEO_RENDER_JPEG_QUALITY` only matters when `VIDEO_RENDER_IMAGE_FORMAT=jpeg`

---

### 5. Quick setup examples

#### Quality-first setup
```env
VIDEO_RENDER_QUALITY_MODE=crf
VIDEO_RENDER_HARDWARE_ACCELERATION=disabled
VIDEO_RENDER_CRF=18
VIDEO_RENDER_IMAGE_FORMAT=png
VIDEO_RENDER_COLOR_SPACE=bt709
```

#### Faster setup
```env
VIDEO_RENDER_QUALITY_MODE=bitrate
VIDEO_RENDER_HARDWARE_ACCELERATION=if-possible
VIDEO_RENDER_BITRATE=3000k
VIDEO_RENDER_IMAGE_FORMAT=png
VIDEO_RENDER_COLOR_SPACE=bt709
```

---

### 6. If you get this error

```txt
"crf" and "videoBitrate" can not both be set. Choose one of either.
```

Check:
- `VIDEO_RENDER_QUALITY_MODE`
- `VIDEO_RENDER_HARDWARE_ACCELERATION`

Most likely fixes:
- set `VIDEO_RENDER_QUALITY_MODE=crf` and `VIDEO_RENDER_HARDWARE_ACCELERATION=disabled`
- or set `VIDEO_RENDER_QUALITY_MODE=bitrate`

````

# Overview

This project is a local monorepo application with:

* **Renderer backend**: Node.js/Express app in `apps/renderer`
* **Web frontend**: Next.js app in `apps/web`
* **Shared packages**: reusable code in `packages/*`
* **MySQL**: required for database-backed features
* **Storage**: local assets and render outputs in `/storage`

The app is intended to run on a **local machine**, not on a hosted production server.

---

# For Developers

## Prerequisites

Install these first:

* **Node.js** and **npm**
* **MySQL** with the Windows service name `MySQL80`
* Project dependencies installed from the monorepo root

## First-time setup

From the repository root:

```bash
npm install
```

Make sure MySQL is installed and the `MySQL80` service exists.

## Development mode

To run both apps in development mode:

```bash
npm run dev
```

Or run them separately:

```bash
npm run dev:renderer
npm run dev:web
```

### What these do

* `dev:renderer` starts the backend with hot-reload/dev tooling
* `dev:web` starts the Next.js frontend in development mode

## Build for local production

When testing the local production version:

```bash
npm run build:prod
```

This runs:

* TypeScript project build for shared packages and backend
* Next.js production build for the frontend

## Start local production mode

After building:

```bash
npm run start:renderer
npm run start:web
```

Or use the provided batch scripts on Windows.

## Recommended developer batch files

### Rebuild and start everything

Use this when code changed and you want a fresh local production run:

* `run-build-start.bat`

### Start already-built app

Use this when the code has already been built:

* `run-start.bat`

## Developer notes

* Shared packages are consumed as workspace packages, not by importing folder paths directly
* Imports should use package names such as:

  * `@mrws-core/db`
  * `@mrws-core/config`
  * `@mrws-core/templates`
* TypeScript builds are handled with `tsc -b`
* The frontend runs on port `3000`
* The backend runs on port `4000`

## Troubleshooting

### Package import errors

Make sure:

* `npm install` was run from the repo root
* package names in imports match the `name` field in each package's `package.json`
* the package exports the required symbol from its main `index.ts`

### Node built-in module type errors

If `path`, `process`, `fs`, or similar fail in TypeScript, verify that the package/app `tsconfig.json` includes:

```json
"types": ["node"]
```

### Backend does not start

Check that:

* MySQL is running
* the database connection settings are correct
* `npm run build:prod` completed successfully

### Frontend does not start

Check that:

* the backend started first
* port `3000` is free
* `next build` completed successfully

---

# For End Users

## What this app does

This app runs locally on your computer and opens two parts behind the scenes:

* the backend service
* the web interface

You do not need to start each one manually.

## Before using the app

Make sure:

* the application files are already installed on your computer
* MySQL is installed and available on the machine
* the app has already been built by the developer, or you were given the batch files that rebuild it automatically

## Easiest way to use it

Double-click:

* `run-build-start.bat`

Use this when the developer gave you a new version or after updates were made.

## Faster startup option

Double-click:

* `run-start.bat`

Use this when the app was already built and no code changes were made.

## What happens when you run the batch file

The launcher will:

1. Start MySQL
2. Start the backend service
3. Wait until the backend is ready
4. Start the web app

## How to open the app

After startup, open this in your browser:

```text
http://127.0.0.1:3000
```

## Important notes for end users

* Keep the command windows open while using the app
* Closing those windows will stop the app
* The app is meant to run only on this computer unless a developer changes the setup

## Common issues

### Nothing opens in the browser

Wait a few more seconds, then open:

```text
http://127.0.0.1:3000
```

### A command window shows errors

Send the error text or a screenshot to the developer.

### The app worked before but not now

Try this:

1. Close all app windows
2. Run `run-build-start.bat` again

### MySQL permission popup appears

This can happen because the script may request elevated permissions to start the MySQL service.

---

# Recommended Windows Batch Files

## Rebuild and start local production

* `run-build-start.bat`

Use when:

* code changed
* a new version was received
* you want the safest restart path

## Start local production without rebuilding

* `run-start.bat`

Use when:

* the current build is already up to date
* you only want to relaunch the app

---

# Recommended Daily Usage

## Developer

* use `npm run dev` during active development
* use `run-build-start.bat` for local production testing

## End user

* use `run-start.bat` for normal daily use
* use `run-build-start.bat` after updates or when instructed

---

# Ports

Default local ports:

* Frontend: `3000`
* Backend: `4000`

Frontend URL:

```text
http://127.0.0.1:3000
```

---

# Support Checklist

Before reporting an issue, confirm:

* MySQL is running
* the batch file was launched successfully
* the command windows remain open
* the browser was opened at `http://127.0.0.1:3000`

If an error appears, capture the full message and share it with the developer.

---

# About Video Fragments

## 1. Fragment Characteristics

* All fragments will have the same FPS.
* Fragments will likely have the same resolution, but this is not fully guaranteed yet. Clarification is needed regarding how differing resolutions should be handled.
* Regarding the question "Can fragments be missing?":
  If one fragment is missing, the current render should fail rather than generating an incomplete output. However, the render queue and worker process itself should continue running normally.
* Regarding the question "Is order guaranteed or inferred?":
  If this refers to whether the order of fragments in the provided array already represents their correct timeline order, then yes — the array order should be treated as the playback order.

## 2. Fragment Source

* Fragments will be created during each campaign session.

Please clarify whether this sufficiently answers the question:

* "Are fragments preprocessed or raw uploads?"

If not, additional clarification on the question would help.

## 3. Failure Tolerance

* If a fragment is missing, the current render should fail.
* However:

  * the render queue should continue operating
  * the worker process itself should not crash or stop


