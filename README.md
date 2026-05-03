# Team Task Manager

A production-ready team task manager for managing projects, assigning tasks, and tracking progress with role-based access control (Admin/Member).

## Features
- JWT authentication with httpOnly cookies
- Projects with members and role-based permissions
- Task Kanban board with drag-and-drop updates
- Dashboard with task summary and quick status updates
- Inline validation and consistent API error responses
- Toast notifications and loading skeletons
- Fully responsive UI with Tailwind CSS

## Tech Stack
- Backend: Node.js, Express.js, Prisma ORM
- Database: PostgreSQL
- Auth: JWT stored in httpOnly cookies
- Frontend: React (Vite), Tailwind CSS
- Deployment: Railway

## Local Setup
1. Clone the repository and open the workspace.
2. Install backend dependencies:
   - `cd backend`
   - `npm install`
3. Create a PostgreSQL database and copy the connection string.
4. Create `.env` in `backend/` from `.env.example` and update values.
5. Run migrations and seed data:
   - `npx prisma migrate dev --name init`
   - `npm run seed`
6. Start the backend:
   - `npm run dev`
7. Install frontend dependencies:
   - `cd ../frontend`
   - `npm install`
8. Create a `.env` in `frontend/` with `VITE_API_URL=http://localhost:4000`.
9. Start the frontend:
   - `npm run dev`

## Environment Variables

### Backend (`backend/.env`)
| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for signing JWTs |
| `NODE_ENV` | `development` or `production` |
| `PORT` | API port (Railway provides `PORT`) |
| `FRONTEND_URL` | Frontend origin URL for CORS (Railway frontend URL) |

### Frontend (`frontend/.env`)
| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Backend URL (example: `https://api.up.railway.app`) |

## API Documentation

### Auth
- `POST /api/auth/register` (public)
  - Body: `{ "name": "Jane", "email": "jane@acme.com", "password": "password123" }`
  - Response: `{ success: true, token, user }`
- `POST /api/auth/login` (public)
  - Body: `{ "email": "jane@acme.com", "password": "password123" }`
  - Response: `{ success: true, token, user }`
- `GET /api/auth/me` (auth)
  - Response: `{ success: true, user }`

### Projects
- `GET /api/projects` (auth)
  - Response: `{ success: true, projects }`
- `POST /api/projects` (auth)
  - Body: `{ "name": "Website", "description": "Launch v2" }`
  - Response: `{ success: true, project }`
- `GET /api/projects/:id` (auth)
  - Response: `{ success: true, project }`
- `PUT /api/projects/:id` (admin)
  - Body: `{ "name": "Updated" }`
  - Response: `{ success: true, project }`
- `DELETE /api/projects/:id` (admin)
  - Response: `{ success: true, message }`
- `POST /api/projects/:id/members` (admin)
  - Body: `{ "email": "member@acme.com", "role": "MEMBER" }`
  - Response: `{ success: true, member }`
- `DELETE /api/projects/:id/members/:userId` (admin)
  - Response: `{ success: true, message }`

### Tasks
- `GET /api/projects/:projectId/tasks` (auth)
  - Query: `status`, `assignedTo`, `priority`, `sort`
  - Response: `{ success: true, tasks }`
- `POST /api/projects/:projectId/tasks` (admin)
  - Body: `{ "title": "Design", "assignedTo": "userId", "priority": "HIGH", "dueDate": "2026-05-10" }`
  - Response: `{ success: true, task }`
- `PUT /api/tasks/:id` (admin/member)
  - Admin can update any field. Members can update status if assigned.
  - Response: `{ success: true, task }`
- `DELETE /api/tasks/:id` (admin)
  - Response: `{ success: true, message }`
- `GET /api/tasks/:id` (auth)
  - Response: `{ success: true, task }`
- `GET /api/tasks/my-tasks` (auth)
  - Response: `{ success: true, tasks }`

## Railway Deployment
1. Create a new Railway project from this repository.
2. Add two services in Railway:
   - `backend` (root: `backend`)
   - `frontend` (root: `frontend`)
3. Add environment variables:
   - Backend: `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`, `FRONTEND_URL`, `PORT` (Railway)
   - Frontend: `VITE_API_URL` (backend service URL)
4. Deploy. Railway will run `railway.toml` to build each service.
5. Run migrations in the backend service: `npx prisma migrate deploy`.

## Screenshots
- Add screenshots here.

## Known Limitations / Future Improvements
- Add task comments and file attachments
- Add notifications and email reminders
- Add audit logs per project
- Add team-wide analytics dashboard
