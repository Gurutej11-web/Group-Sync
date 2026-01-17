# GroupSync – Smart Group Project Manager

Collaborate better. Track smarter. Never miss a task.

## Overview
GroupSync is a web app that helps teams manage projects, tasks, roles, and contributions with real-time updates and gamified motivation.

## Features
- Authentication (Firebase email/password)
- Google OAuth login
- Projects: create, roles, members, dashboard
- Tasks: add/edit/status, priority, deadlines
- Comments: threaded per-task with realtime updates
- Activity Feed: instant timeline of project events
- Leaderboard: points + badges for contributions
- Responsive UI with Tailwind
- Drag-and-drop Kanban board
- Project invite codes and email invitations
- Task filters and search
- CSV export of tasks

## Tech Stack
- React + Vite
- Tailwind CSS
- Firebase (Auth + Firestore)

## Local Setup
1. Create Firebase project and enable Email/Password Auth.
2. Create Firestore database in test mode.
3. Copy `.env.local.example` to `.env.local` and fill your Firebase values.

### Install & Run
```powershell
# From the project root
cd "groupsync"
npm install
npm run dev
```
Open the dev server URL (Vite default is http://localhost:5173).

## Firestore Collections
- `users`: profile, points per project
- `projects`: title, description, members, roles
- `tasks`: per-project tasks with status
- `activityFeed`: project activity timeline
- `comments`: threaded comments per task

## Notes
- Drag-and-drop board can be added later; status buttons provide a fast workflow.
- Bonus points are granted for finishing before the deadline.
- Invite members either via email (existing users) or using an invite code.
- Use the Join page to enter an invite code.

## Hackathon Submission
See the Devpost-ready sections: Inspiration, Problem, Solution, How we built it, Challenges, Future Improvements. Host via Firebase Hosting for a live demo.

### Judging Criteria Highlights
- Creativity: Gamified leaderboard, badges, invite codes, and smooth DnD.
- Practicality: Firebase-backed realtime UI, simple onboarding via email/code.
- Presentation: Clean UI, toast notifications, CSV export for reporting.
- Technical Complexity: Snapshot listeners, DnD state sync, points logic.
- Design: Tailwind components, color-coded priorities, responsive layouts.
