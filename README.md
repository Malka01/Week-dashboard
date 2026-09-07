# Week Dashboard

Week Dashboard is a full-stack weekly reporting platform for team members and administrators. Team members submit weekly reports, while administrators review reports, monitor compliance, explore analytics, and use an AI assistant to analyze team activity.

## Features

- User registration and authentication
- Role-based access for administrators and team members
- Weekly report creation, editing, submission, and history
- Project management
- Administrative report review and correction requests
- Team compliance monitoring
- Dashboard analytics for report status, workload, task completion, and time by task type
- AI assistant backed by team report data

## Tech Stack

- Frontend: React 19, Vite, React Router, Tailwind CSS, Recharts
- Backend: Node.js, Express, Mongoose
- Database: MongoDB
- Authentication: JWT
- AI services: OpenAI and Pinecone

## Project Structure

```text
client/   React/Vite frontend
server/   Express API and MongoDB backend
```

## Requirements

- Node.js 18 or newer
- npm
- MongoDB, either local or hosted
- OpenAI and Pinecone credentials for the AI assistant

## Setup

### 1. Install dependencies

From the project root:

```bash
cd client
npm install

cd ../server
npm install
```

### 2. Configure the server

Create `server/.env`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/week-dashboard
JWT_SECRET=replace-with-a-long-random-secret
PORT=5000

# Required for AI features
OPENAI_API_KEY=your-openai-api-key
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_INDEX_NAME=your-pinecone-index-name
```

The API uses MongoDB for application data. The AI variables are only needed when using the AI assistant or report indexing features.

### 3. Seed data

Run these commands from the `server` directory:

```bash
npm run seed:admin
npm run seed
```

The admin seed creates:

```text
Email:    example.com
Password: example
```

The sample team-member seed uses `Member123!` for the seeded member accounts. Change seeded or development credentials before using the application in a shared or production environment.

### 4. Start the application

Start the API in one terminal:

```bash
cd server
npm run dev
```

Start the frontend in another terminal:

```bash
cd client
npm run dev
```

The frontend is available at `http://localhost:5173` and the API runs at `http://localhost:5000`.

## Available Scripts

### Client

```bash
npm run dev      # Start the Vite development server
npm run build    # Create a production build
npm run lint     # Run ESLint
npm run preview  # Preview the production build
```

### Server

```bash
npm run dev        # Start the API with nodemon
npm start          # Start the API normally
npm run seed:admin # Create the default admin account
npm run seed       # Insert sample users, projects, and reports
```

## API Overview

The backend exposes routes under `/api`:

- `/api/auth` - authentication and registration
- `/api/reports` - team-member reports
- `/api/projects` - projects
- `/api/admin/reports` - administrative report review
- `/api/admin/users` - user administration
- `/api/admin/team` - team administration
- `/api/admin/analytics` - dashboard analytics
- `/api/admin/ai` - AI assistant functionality
- `/api/health` - API health check

Check the API status with:

```text
http://localhost:5000/api/health
```

## Development Notes

- The frontend API client currently uses `http://localhost:5000/api` as its base URL.
- The server CORS configuration allows the Vite development origin `http://localhost:5173`.
- Keep `.env` files out of source control. They are ignored by the repository configuration.
- Build output is generated in `client/dist`.
