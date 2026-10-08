# ITU course scheduler

Browse ITU course sections and arrange a weekly schedule before registration. The calendar displays overlapping courses, highlights mandatory courses, and keeps selections and notes in your browser.

[Open the live app](https://ituscheduler.omerdikyol.com/)

## Use the planner

- Browse course sections fetched from ITU’s course information pages.
- Add courses to the weekly calendar and inspect conflicting time blocks.
- Attach notes to courses; middle-click a course to remove it.
- Export a plan as JSON and import it later or in another browser.

The app helps plan a schedule. It does not register you for classes. Course fetching depends on the upstream pages and their current format; confirm final details with ITU.

## Run locally

The checked-in manifest uses **Next.js 16**, React, TypeScript, and Tailwind CSS. Use Node.js 20.9 or newer, following the [Next.js system requirements](https://nextjs.org/docs/app/getting-started/installation#system-requirements).

```sh
git clone https://github.com/omerdikyol/itu-scheduler-app.git
cd itu-scheduler-app
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000).

```sh
npm run build
npm run lint
```

## Code map

- [Course API routes](src/app/api/courses): fetching and parsing upstream course data.
- [Scheduler](src/components/Scheduler/index.tsx): planner state and interactions.
- [CalendarGrid](src/components/Scheduler/CalendarGrid.tsx): weekly calendar UI.
- [Scheduler utilities](src/components/Scheduler/scheduler.utils.ts): time parsing and overlapping-block layout.
