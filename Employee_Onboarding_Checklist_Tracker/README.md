# Employee Onboarding Checklist Tracker

A simple full-stack project based on Node_Final.pdf. HR creates employee accounts, assigns onboarding tasks, and monitors progress. Employees sign in to complete their own tasks.

Built with Node.js, Express, MongoDB/Mongoose, JWT, React, and Vite. The backend uses models, middleware, and routes with direct database queries. There are no code comments or extra service layers.

## Run locally

You need Node.js 22.12 or newer and either a running local MongoDB server or a MongoDB Atlas database.

1. Install dependencies from this project folder:

   ```bash
   npm install
   npm --prefix frontend install
   ```

2. Create the environment files if they do not exist:

   ```bash
   cp .env.example .env
   cp frontend/.env.example frontend/.env
   ```

   Set `JWT_SECRET` in `.env` to a long random value. You can generate one with:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   The local database is `mongodb://127.0.0.1:27017/employee_onboarding`. The API uses port **5050**, and the frontend uses **5179**. A local `.env` with a generated secret has already been prepared in this workspace; it is ignored by Git.

3. Start MongoDB if it is not already running, then add sample accounts:

   ```bash
   npm run seed
   ```

4. Start the API:

   ```bash
   npm run dev
   ```

5. In another terminal, start the frontend:

   ```bash
   npm run dev:frontend
   ```

6. Open **http://localhost:5179**.

| Role | Email | Password |
| --- | --- | --- |
| HR | hr@example.com | Welcome123! |
| Employee | aanya@example.com | Welcome123! |
| Employee | arjun@example.com | Welcome123! |
| Employee | sara@example.com | Welcome123! |

The seed script keeps existing accounts and nonempty checklists unchanged. These credentials are for local demonstration. HR creates employee accounts from the dashboard and shares the initial password with the employee. There is no public registration or user-selectable HR role. This assignment does not include password reset, email delivery, or account administration.

## Using the app

- HR: sign in, select **Add employee**, enter account details, and add tasks with due dates.
- HR: open an employee from **Your people** to view progress, add tasks, or edit/delete tasks assigned by that HR account.
- Employee: sign in and check off tasks in **My Checklist**. Unchecking a task marks it pending again.
- Search the dashboard by employee name, email, or department. Filter checklists by All tasks, To do, or Completed.

The API calculates completion percentages. An empty checklist has 0% progress. JWT sessions last one day and are stored in browser session storage.

## API

Base URL: `http://localhost:5050/api`

Authenticated requests use `Authorization: Bearer <token>`.

| Method | Endpoint | Access |
| --- | --- | --- |
| GET | /health | Public |
| POST | /auth/login | Public |
| GET | /auth/me | Signed-in user |
| GET | /employees | HR |
| POST | /employees | HR |
| GET | /employees/:id/checklist | HR or that employee |
| POST | /employees/:id/checklist | HR |
| GET | /employees/:id/onboarding-progress | HR or that employee |
| PATCH | /tasks/:id | Assigned HR |
| DELETE | /tasks/:id | Assigned HR |
| PATCH | /tasks/:id/complete | Assigned HR or that employee |

HR can view progress across all employees. HR can only edit, delete, or complete tasks assigned by their own HR account. Other employees cannot read or change someone else's checklist.

Login body:

```json
{ "email": "hr@example.com", "password": "Welcome123!" }
```

Create employee body:

```json
{ "name": "New Hire", "email": "new@example.com", "password": "Welcome123!", "department": "Engineering" }
```

Assign checklist body (between 1 and 50 tasks):

```json
{
  "tasks": [
    { "taskName": "Collect laptop", "dueDate": "2026-11-01" },
    { "taskName": "Attend orientation", "dueDate": "2026-11-02" }
  ]
}
```

Edit a task with `taskName`, `dueDate`, or both. Mark complete with `{ "completed": true }`, and reopen with `{ "completed": false }`. An empty completion body also marks the task complete.

Import `postman/Onboarding.postman_collection.json` into Postman. Run the collection in order after seeding. It logs in as HR, creates a test employee, assigns and edits a task, signs in as that employee, checks permissions, and deletes the test task. It automatically stores tokens and IDs in collection variables. The created test employee remains in the database.

## MongoDB Atlas

Create an Atlas cluster and database user, allow your development machine or backend host in the project's network access settings, and set the database connection string in the backend environment:

```text
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/employee_onboarding
```

Replace the placeholders and URL-encode special characters in the database password. Never put the database URI or JWT secret in the frontend environment.

## Tests and production build

```bash
npm test
npm run build
```

Tests use a disposable MongoDB instance through `mongodb-memory-server`; they do not use your application database. The first test run may download a MongoDB binary. To use an installed binary on this Mac:

```bash
MONGOMS_SYSTEM_BINARY=/opt/homebrew/bin/mongod MONGOMS_SYSTEM_BINARY_VERSION_CHECK=false npm test
```

The API tests cover authentication, role escalation prevention, account creation, checklist CRUD, ownership, invalid input, and persisted progress. The frontend production output is `frontend/dist`.

## Deployment

For Render or Railway, use this project directory as the backend root, `npm ci --omit=dev` as the build command, and `npm start` as the start command. Configure `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, and the host-provided `PORT`. `CLIENT_URL` should be your exact frontend origin with no trailing slash; multiple origins can be separated with commas.

For Vercel or Netlify, use `frontend` as the project root, `npm run build` as the build command, and `dist` as the output directory. Set `VITE_API_URL` to `https://YOUR-BACKEND/api` before building. The frontend uses a single page with state-based navigation, so no custom route rewrites are needed. Deployment requires your own hosting and Atlas accounts; this project has not been published.

## Project structure

```text
models/         Employee and OnboardingTask schemas
middleware/     Authentication, role, ownership, and task validation
routes/         Login, employees, checklists, and tasks
app.js          Express setup and error responses
server.js       MongoDB connection and server startup
progress.js     Backend progress calculation
seed.js         Sample accounts and checklists
tests/          API integration tests
frontend/src/   React screens and CSS
postman/        Importable API collection
```
