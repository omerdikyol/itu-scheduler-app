import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Course, LayoutCourse } from "./scheduler.types";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const mandatoryCodes = [
    "BLG 503E", "BLG 503", "BLG 507E", "BLG 514E", "BLG 517E",
    "BLG 521E", "BLG 527E", "BLG 545E", "BLG 549E", "BLG 557E", "BLG 560E"
];

export const dayMap: Record<string, number> = {
    "Pazartesi": 0, "Salı": 1, "Çarşamba": 2, "Perşembe": 3, "Cuma": 4,
    "Monday": 0, "Tuesday": 1, "Wednesday": 2, "Thursday": 3, "Friday": 4
};

export const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export const timeToMinutes = (timeStr: string) => {
    if (!timeStr) return 0;
    const parts = timeStr.split('/');
    if (parts.length < 2) return 0;

    const [h, m] = parts[0].split(':').map(Number);
    return h * 60 + m;
};

export const processCourses = (rawCourses: any[]): Course[] => {
    return rawCourses
        // Remove strict filter to debug what's coming in. Only filter totally empty/useless entries.
        .filter(c => c.crn && c.code)
        .map(c => {
            let sMin = 0, eMin = 0;
            if (c.time && c.time.includes('/')) {
                const [s, e] = c.time.split('/');
                const [sh, sm] = s.split(':').map(Number);
                const [eh, em] = e.split(':').map(Number);
                sMin = sh * 60 + sm;
                eMin = eh * 60 + em;
            }

            const isKnownDay = dayMap[c.day] !== undefined;
            const dIndex = isKnownDay ? dayMap[c.day]! : 5;

            return {
                ...c,
                dayIndex: dIndex,
                startMin: sMin,
                endMin: eMin,
                duration: eMin - sMin,
                isMandatory: mandatoryCodes.includes(c.code)
            };
        })
        .sort((a, b) => {
            if (a.isMandatory && !b.isMandatory) return -1;
            if (!a.isMandatory && b.isMandatory) return 1;
            return a.code.localeCompare(b.code);
        });
};

const COURSE_COLORS = [
    "bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200",
    "bg-green-100 border-green-300 text-green-800 hover:bg-green-200",
    "bg-purple-100 border-purple-300 text-purple-800 hover:bg-purple-200",
    "bg-rose-100 border-rose-300 text-rose-800 hover:bg-rose-200",
    "bg-indigo-100 border-indigo-300 text-indigo-800 hover:bg-indigo-200",
    "bg-teal-100 border-teal-300 text-teal-800 hover:bg-teal-200",
    "bg-orange-100 border-orange-300 text-orange-800 hover:bg-orange-200",
    "bg-cyan-100 border-cyan-300 text-cyan-800 hover:bg-cyan-200",
];

export const getCourseColor = (code: string) => {
    let hash = 0;
    for (let i = 0; i < code.length; i++) {
        hash = code.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % COURSE_COLORS.length;
    return COURSE_COLORS[index];
};

export const layoutDayCourses = (courses: Course[]): LayoutCourse[] => {
    if (courses.length === 0) return [];

    // 1. Sort by start time, then duration (desc)
    const sorted = [...courses].sort((a, b) => {
        if (a.startMin !== b.startMin) return a.startMin - b.startMin;
        return b.duration - a.duration;
    });

    const columns: LayoutCourse[][] = [];

    // 2. Assign columns greedy
    for (const course of sorted) {
        let placed = false;
        for (const col of columns) {
            const last = col[col.length - 1];
            // If this column's last course ends before current course starts, we can put it here
            if (last.endMin <= course.startMin) {
                col.push(course);
                placed = true;
                break;
            }
        }
        if (!placed) {
            columns.push([course]);
        }
    }

    // This greedy packing is suboptimal for visual "groups", but ensures no overlap.
    // However, user wants "show both courses". 
    // If we have 2 cols, width should be 50%.
    // To make it look "grouped", we should check collisions per time slice.

    // Better Approach: Group overlapping clusters
    // A cluster is a set of courses where each overlaps with at least one other in the cluster (transitive)

    const clusters: LayoutCourse[][] = [];
    let currentCluster: LayoutCourse[] = [];
    let clusterEnd = -1;

    for (const course of sorted) {
        if (currentCluster.length === 0) {
            currentCluster.push(course);
            clusterEnd = course.endMin;
        } else {
            if (course.startMin < clusterEnd) {
                // Overlaps with the current cluster
                currentCluster.push(course);
                clusterEnd = Math.max(clusterEnd, course.endMin);
            } else {
                // New cluster
                clusters.push(currentCluster);
                currentCluster = [course];
                clusterEnd = course.endMin;
            }
        }
    }
    if (currentCluster.length > 0) clusters.push(currentCluster);

    // Process clusters
    const result: LayoutCourse[] = [];

    for (const cluster of clusters) {
        // Simple column assignment within cluster
        // Everything in a cluster shares the width.
        // We can just assign columns 0..N-1 based on greedy packing within the cluster.

        const clusterCols: LayoutCourse[][] = [];
        for (const course of cluster) {
            let placed = false;
            for (let i = 0; i < clusterCols.length; i++) {
                const col = clusterCols[i];
                const last = col[col.length - 1];
                if (last.endMin <= course.startMin) {
                    col.push(course);
                    // We need to track which column index this course got
                    (course as any)._colIndex = i;
                    placed = true;
                    break;
                }
            }
            if (!placed) {
                clusterCols.push([course]);
                (course as any)._colIndex = clusterCols.length - 1;
            }
        }

        const widthPct = 100 / clusterCols.length;

        for (const course of cluster) {
            const colIndex = (course as any)._colIndex;
            result.push({
                ...course,
                style: {
                    width: `${widthPct}%`,
                    left: `${colIndex * widthPct}%`
                }
            });
        }
    }

    return result;
};
