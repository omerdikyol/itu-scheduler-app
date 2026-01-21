import React from 'react';
import { AlertCircle, Star, User, Clock, Edit, X } from 'lucide-react';
import { Course } from './scheduler.types';
import { cn, getCourseColor } from './scheduler.utils';

interface CourseBlockProps {
    course: Course;
    conflicts: boolean;
    note?: string;
    onDelete: (crn: string) => void;
    onEditNote: (crn: string) => void;
    style?: React.CSSProperties;
}

export const CourseBlock: React.FC<CourseBlockProps> = ({
    course,
    conflicts,
    note,
    onDelete,
    onEditNote,
    style
}) => {
    const topOffset = (course.startMin - 8 * 60); // Start from 08:00
    const height = course.duration;

    // Styling logic
    let bgColor = getCourseColor(course.code); // Dynamic pastel color
    let zIndex = 10;

    if (course.isMandatory) {
        bgColor = "bg-amber-100 border-amber-300 text-amber-900 hover:bg-amber-200";
    }

    if (conflicts) {
        bgColor = "bg-red-100 border-red-300 text-red-800 hover:bg-red-200 opacity-90";
        zIndex = 20;
    }

    return (
        <div
            className={cn(
                "absolute w-full border-l-4 p-1.5 text-xs rounded shadow-sm transition-all cursor-pointer group flex flex-col justify-between",
                bgColor
            )}
            style={{
                top: `${topOffset}px`,
                height: `${height}px`,
                zIndex: zIndex,
                ...style // Apply layout styles (width, left)
            }}
            onMouseUp={(e) => {
                if (e.button === 1) { // Middle click
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete(course.crn);
                }
            }}
            title={`${course.code} - ${course.name}\n${course.instructor}\n${course.time}\nFill: ${course.enrolled}/${course.capacity}`}
        >
            <div onClick={() => onEditNote(course.crn)} className="flex-1 h-full">
                <div className="flex items-center gap-1">
                    <div className="font-bold truncate">{course.code}</div>
                    {conflicts && <AlertCircle size={10} className="text-red-600 fill-red-100" />}
                    {course.isMandatory && !conflicts && <Star size={10} className="fill-amber-600 text-amber-600" />}
                </div>
                <div className="truncate leading-tight opacity-75">{course.name}</div>
                <div className="flex items-center gap-1 opacity-70 text-[10px] mt-0.5">
                    <User size={10} />
                    <span className="truncate">{course.instructor}</span>
                </div>
                <div className="mt-0.5 flex items-center gap-1 opacity-60 text-[10px]">
                    <Clock size={10} />
                    {course.time}
                </div>
                {note && (
                    <div className="mt-1 text-[9px] bg-white/50 dark:bg-black/50 p-0.5 rounded italic opacity-90 break-words leading-tight whitespace-pre-wrap">
                        {note}
                    </div>
                )}
            </div>

            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white/30 rounded-full p-0.5 backdrop-blur-[1px]">
                <button
                    onClick={(e) => { e.stopPropagation(); onEditNote(course.crn); }}
                    className="hover:bg-white rounded-full p-0.5 transition-colors"
                    title="Edit Note"
                >
                    <Edit size={10} />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(course.crn); }}
                    className="hover:bg-white rounded-full p-0.5 text-red-600 transition-colors"
                    title="Remove"
                >
                    <X size={10} />
                </button>
            </div>
        </div>
    );
};
