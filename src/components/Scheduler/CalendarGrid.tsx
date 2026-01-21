import React, { useMemo } from 'react';
import { Course } from './scheduler.types';
import { dayNames, layoutDayCourses } from './scheduler.utils';
import { CourseBlock } from './CourseBlock';

interface CalendarGridProps {
    selectedCourses: Course[];
    conflicts: Set<unknown>;
    courseNotes: Record<string, string>;
    onDeleteCourse: (crn: string) => void;
    onEditNote: (crn: string) => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
    selectedCourses,
    conflicts,
    courseNotes,
    onDeleteCourse,
    onEditNote
}) => {
    return (
        <main className="flex-1 overflow-y-auto overflow-x-auto relative bg-white custom-scrollbar">
            <div className="min-w-[800px] p-4 md:p-8 pb-20">
                {/* Calendar Header */}
                <div className="grid grid-cols-5 mb-4 sticky top-0 bg-white z-20 pb-2 border-b border-gray-100 ml-14">
                    {dayNames.map((day) => (
                        <div key={day} className="text-center">
                            <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">{day}</span>
                        </div>
                    ))}
                </div>

                {/* Time Grid Container */}
                <div className="flex">
                    {/* Time Labels Column */}
                    <div className="w-12 flex-shrink-0 relative mr-2" style={{ height: '600px' }}>
                        {Array.from({ length: 11 }).map((_, i) => {
                            const top = (i * 60);
                            return (
                                <div key={i} className="absolute w-full text-right text-[10px] text-gray-400 font-medium -translate-y-1/2 pr-1" style={{ top: `${top}px` }}>
                                    {(i + 8).toString().padStart(2, '0')}:00
                                </div>
                            );
                        })}
                    </div>

                    {/* Grid */}
                    <div id="scheduler-grid" className="relative flex-1 border border-gray-200 rounded-xl bg-white overflow-hidden" style={{ height: '600px' }}>
                        {/* Horizontal Hour Lines */}
                        {Array.from({ length: 11 }).map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-full border-b border-gray-200"
                                style={{ top: `${i * 60}px` }}
                            />
                        ))}

                        {/* Vertical Day Lines */}
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div
                                key={i}
                                className="absolute h-full border-r border-gray-200"
                                style={{ left: `${(i + 1) * 20}%` }}
                            />
                        ))}

                        {/* Placed Courses */}
                        {Array.from({ length: 5 }).map((_, dayIndex) => {
                            const dayCourses = selectedCourses.filter(c => c.dayIndex === dayIndex);
                            const layout = layoutDayCourses(dayCourses);

                            return (
                                <div key={dayIndex} className="absolute h-full top-0" style={{ left: `${dayIndex * 20}%`, width: '20%' }}>
                                    {layout.map((course) => (
                                        <CourseBlock
                                            key={course.crn}
                                            course={course}
                                            conflicts={conflicts.has(course.crn)}
                                            note={courseNotes[course.crn]}
                                            onDelete={onDeleteCourse}
                                            onEditNote={onEditNote}
                                            style={course.style}
                                        />
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </main>
    );
};
