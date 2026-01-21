# ITU Course Scheduler

A web application for ITU students to browse course schedules, plan their semester, and export their weekly plan.

## Features

- **Live Data**: Fetches real-time course data from ITU OBS (sis.itu.edu.tr).
- **Interactive Calendar**:
  - Visual time blocks for courses.
  - Conflict detection (red highlights).
  - Mandatory course highlighting (orange).
  - Middle-click to remove courses.
- **Persistence**: automatically saves your selected courses and notes to your browser.
- **Export/Import**:
  - Export your schedule as a JSON file.
  - Import previously saved JSON schedules.
- **Course Notes**: Add personal notes to any course directly on the calendar.

## Tech Stack

- **Next.js 14** (App Router)
- **React**
- **TailwindCSS**
- **Lucide Icons**

## Getting Started

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Run the development server**:
    ```bash
    npm run dev
    ```

3.  **Open the app**:
    Navigate to [http://localhost:3000](http://localhost:3000)
