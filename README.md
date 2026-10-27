# Movie / Series Tracker

React + Express + local MongoDB Community Server application with signup, login, protected movie data, search, filters, sorting, and CRUD operations.

## Project structure

```text
25070521036/
├── client/   # React + Vite frontend
└── server/   # Node.js + Express + Mongoose backend
```

## Requirements

- Node.js 18 or newer
- MongoDB Community Server running locally
- MongoDB Compass is optional and can be used to inspect the database

Compass alone does not run MongoDB. Start the MongoDB server before starting the backend.

## First-time setup

From the project root:

```bash
npm install --prefix server
npm install --prefix client
cp server/.env.example server/.env
```

The default local backend configuration uses:

```text
mongodb://127.0.0.1:27017/movieTracker
```

If your MongoDB executable is installed manually, start it with your own local path:

```bash
mkdir -p "$HOME/mongodb-data/db"
/path/to/mongodb/bin/mongod --dbpath "$HOME/mongodb-data/db" --bind_ip 127.0.0.1 --port 27017
```

You can connect MongoDB Compass with:

```text
mongodb://127.0.0.1:27017
```

## Run the application

Use two terminals from the project root.

Terminal 1:

```bash
npm run dev:backend
```

Terminal 2:

```bash
npm run dev:frontend
```

Open the frontend URL printed by Vite, normally `http://localhost:5173`.

The backend runs on `http://localhost:5001`. The first account created receives the sample movie library. Each account has its own protected movie collection.

## Authentication

- Signup: `POST /api/auth/signup`
- Login: `POST /api/auth/login`
- Current user: `GET /api/auth/me`

Passwords are hashed with bcrypt and sessions use JWT tokens. Movie endpoints require a valid bearer token.

## Verify before submitting

```bash
npm run build
```

Do not commit `server/.env`, passwords, JWT secrets, `node_modules`, or build output. Commit `server/.env.example` instead.
