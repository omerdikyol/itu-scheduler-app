import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronUp, Plus, Search, Loader2, BookOpen, Filter, AlertCircle, CheckCircle2, Clock, User } from 'lucide-react';
import { Course } from './scheduler.types';
import { cn, dayNames, dayMap, processCourses } from './scheduler.utils';

interface SidebarProps {
    courses: Course[];
    selectedCrns: string[];
    conflicts: Set<unknown>;
    onAddCourses: (newCourses: Course[]) => void;
    onToggleCourse: (crn: string) => void;
    onClearAll: () => void;
    onEditNote: (crn: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    courses,
    selectedCrns,
    conflicts,
    onAddCourses,
    onToggleCourse,
    onClearAll,
    onEditNote
}) => {
    // API State
    const [branches, setBranches] = useState<{ bransKoduId: number, dersBransKodu: string }[]>([]);
    const [selectedBranchId, setSelectedBranchId] = useState<string>('');
    const [isLoadingBranches, setIsLoadingBranches] = useState(false);
    const [isFetchingCourses, setIsFetchingCourses] = useState(false);
    const [selectedLevel, setSelectedLevel] = useState<'LS' | 'LU'>('LS');

    // Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [dayFilters, setDayFilters] = useState([0, 1, 2, 3, 4, 5]);
    const [instructorFilterMode, setInstructorFilterMode] = useState('none');
    const [instructorFilters, setInstructorFilters] = useState<string[]>([]);

    // Fetch Branches on Mount/Level Change
    useEffect(() => {
        setIsLoadingBranches(true);
        setSelectedBranchId('');

        fetch(`/api/courses/branches?level=${selectedLevel}`)
            .then(res => res.json())
            .then(data => {
                setBranches(data);
                setIsLoadingBranches(false);
            })
            .catch(err => {
                console.error(err);
                setIsLoadingBranches(false);
            });
    }, [selectedLevel]);

    const handleFetchCourses = async () => {
        if (!selectedBranchId) return;

        setIsFetchingCourses(true);
        try {
            console.log(`[Scheduler] Fetching branchId: ${selectedBranchId}, Level: ${selectedLevel}`);
            const res = await fetch(`/api/courses/schedule?branchId=${selectedBranchId}&level=${selectedLevel}`);
            if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);

            const newCoursesRaw = await res.json();
            if (!Array.isArray(newCoursesRaw)) throw new Error('Response is not an array');

            const processedNew = processCourses(newCoursesRaw);

            if (newCoursesRaw.length > 0 && processedNew.length === 0) {
                alert('Courses found but could not be parsed.');
            } else if (newCoursesRaw.length === 0) {
                console.log('[Scheduler] API returned empty list.');
            }

            onAddCourses(processedNew);

        } catch (error) {
            console.error('[Scheduler] Error:', error);
            alert(`Failed to load courses. ${error}`);
        } finally {
            setIsFetchingCourses(false);
        }
    };


    // Derived State
    const allInstructors = useMemo(() => [...new Set(courses.map(c => c.instructor))].sort(), [courses]);

    const filteredCourses = useMemo(() => {
        return courses.filter(course => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = course.code.toLowerCase().includes(searchLower) ||
                course.instructor.toLowerCase().includes(searchLower) ||
                course.name.toLowerCase().includes(searchLower);

            const matchesDay = dayFilters.includes(course.dayIndex);

            let matchesInstructor = true;
            if (instructorFilterMode === 'whitelist') {
                matchesInstructor = instructorFilters.includes(course.instructor);
            } else if (instructorFilterMode === 'blacklist') {
                matchesInstructor = !instructorFilters.includes(course.instructor);
            }

            return matchesSearch && matchesDay && matchesInstructor;
        });
    }, [courses, searchTerm, dayFilters, instructorFilterMode, instructorFilters]);


    return (
        <aside className="w-96 bg-white border-r border-gray-200 flex flex-col z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
            {/* API Fetcher Section */}
            <div className="p-4 bg-indigo-50/50 border-b border-indigo-100 flex flex-col gap-2">
                <div className="text-xs font-semibold text-indigo-900 uppercase tracking-wide">Add Courses</div>
                <div className="flex gap-2">
                    {/* Level Toggle */}
                    <div className="flex bg-gray-100 p-1 rounded-lg shrink-0">
                        <button
                            onClick={() => setSelectedLevel('LS')}
                            className={cn(
                                "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                                selectedLevel === 'LS' ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            Undergrad
                        </button>
                        <button
                            onClick={() => setSelectedLevel('LU')}
                            className={cn(
                                "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                                selectedLevel === 'LU' ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            Graduate
                        </button>
                    </div>

                    <div className="relative flex-1">
                        <select
                            className="w-full pl-2 pr-8 py-2 bg-white border border-indigo-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={selectedBranchId}
                            onChange={(e) => setSelectedBranchId(e.target.value)}
                            disabled={isLoadingBranches}
                        >
                            <option value="">Select Code...</option>
                            {branches.map(b => (
                                <option key={b.bransKoduId} value={b.bransKoduId}>{b.dersBransKodu}</option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-2.5 pointer-events-none text-indigo-400">
                            <ChevronDown size={14} />
                        </div>
                    </div>
                    <button
                        onClick={handleFetchCourses}
                        disabled={!selectedBranchId || isFetchingCourses}
                        className="bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[3rem]"
                    >
                        {isFetchingCourses ? <Loader2 size={16} className="animate-spin" /> : <Plus size={18} />}
                    </button>
                </div>
            </div>

            {/* Search & Filter Controls */}
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col gap-3">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search code, name, or instructor..."
                        className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <BookOpen size={16} className="absolute left-3 top-2.5 text-gray-400" />
                </div>

                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={cn(
                        "flex items-center justify-between px-3 py-2 text-xs font-medium rounded border transition-colors",
                        showFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    )}
                >
                    <div className="flex items-center gap-2">
                        <Filter size={14} />
                        <span>Filter Options</span>
                        {(instructorFilterMode !== 'none' || dayFilters.length < 5) && (
                            <span className="flex h-2 w-2 rounded-full bg-indigo-500"></span>
                        )}
                    </div>
                    {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {/* Filter Panel */}
                {showFilters && (
                    <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* Day Filter */}
                        <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Days</h4>
                            <div className="flex gap-1">
                                {dayNames.map((day, idx) => (
                                    <button
                                        key={day}
                                        onClick={() => setDayFilters(prev => prev.includes(idx) ? prev.filter(d => d !== idx) : [...prev, idx])}
                                        className={cn(
                                            "flex-1 py-1.5 text-[10px] font-bold rounded transition-colors",
                                            dayFilters.includes(idx) ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                        )}
                                    >
                                        {day}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Instructor Filter */}
                        <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Instructors</h4>
                            <div className="flex bg-gray-100 p-1 rounded-md mb-2">
                                {['none', 'whitelist', 'blacklist'].map(mode => (
                                    <button
                                        key={mode}
                                        onClick={() => setInstructorFilterMode(mode)}
                                        className={cn(
                                            "flex-1 py-1 text-[10px] font-medium rounded capitalize transition-all",
                                            instructorFilterMode === mode ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                        )}
                                    >
                                        {mode === 'none' ? 'All' : mode}
                                    </button>
                                ))}
                            </div>

                            {instructorFilterMode !== 'none' && (
                                <div className="max-h-32 overflow-y-auto custom-scrollbar border border-gray-200 rounded p-1 space-y-0.5">
                                    {allInstructors.map(inst => (
                                        <label key={inst} className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={instructorFilters.includes(inst)}
                                                onChange={() => setInstructorFilters(prev => prev.includes(inst) ? prev.filter(i => i !== inst) : [...prev, inst])}
                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-3 w-3"
                                            />
                                            <span className="text-xs text-gray-700 truncate">{inst}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Course List header with clear option */}
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-500">{filteredCourses.length} loaded</span>
                {courses.length > 0 && (
                    <button onClick={onClearAll} className="text-[10px] text-red-500 hover:text-red-700 hover:underline">
                        Clear All
                    </button>
                )}
            </div>

            {/* Course List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {filteredCourses.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 flex flex-col items-center gap-2">
                        <Search size={24} className="opacity-20" />
                        <p className="text-sm">No courses found.</p>
                        {courses.length === 0 && (
                            <p className="text-xs opacity-70">Select a course code above to fetch data.</p>
                        )}
                    </div>
                ) : filteredCourses.map((course, i) => {
                    const isSelected = selectedCrns.includes(course.crn);
                    const hasConflict = conflicts.has(course.crn);

                    let containerClasses = "bg-white border-transparent hover:border-gray-200 hover:bg-gray-50 hover:shadow-sm";
                    let textClasses = "text-gray-900";

                    if (isSelected) {
                        if (hasConflict) {
                            containerClasses = "bg-red-50 border-red-200 ring-1 ring-red-200";
                            textClasses = "text-red-700";
                        } else if (course.isMandatory) {
                            containerClasses = "bg-amber-50 border-amber-200 ring-1 ring-amber-200";
                            textClasses = "text-amber-800";
                        } else {
                            containerClasses = "bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200";
                            textClasses = "text-indigo-700";
                        }
                    } else if (course.isMandatory) {
                        containerClasses = "bg-amber-50/30 border-amber-100 hover:bg-amber-50 hover:border-amber-200";
                    }

                    return (
                        <div
                            key={`${course.crn}-${i}`}
                            onClick={() => onToggleCourse(course.crn)}
                            className={cn(
                                "group relative p-3 rounded-lg border cursor-pointer transition-all duration-200",
                                containerClasses
                            )}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <span className={cn("font-bold text-sm truncate", textClasses)}>
                                        {course.code}
                                    </span>
                                    {course.isMandatory && (
                                        <span className="shrink-0 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium border border-amber-200">
                                            Mandatory
                                        </span>
                                    )}
                                </div>
                                {isSelected ? (
                                    hasConflict ? <AlertCircle size={16} className="text-red-500 shrink-0" /> : <CheckCircle2 size={16} className={cn("shrink-0", course.isMandatory ? "text-amber-500" : "text-indigo-500")} />
                                ) : (
                                    <div className={cn(
                                        "shrink-0 w-4 h-4 rounded-full border-2",
                                        course.isMandatory ? "border-amber-200 group-hover:border-amber-400" : "border-gray-300 group-hover:border-indigo-400"
                                    )} />
                                )}
                            </div>

                            <h3 className="text-xs font-medium text-gray-700 leading-snug mb-2 line-clamp-2">
                                {course.name}
                            </h3>

                            <div className="flex items-center justify-between text-[11px] text-gray-500 border-t border-gray-100 pt-2 mt-2 group-hover:border-gray-200">
                                <span className="flex items-center gap-1 font-medium text-gray-600 shrink-0">
                                    <Clock size={12} />
                                    {dayNames[course.dayIndex]} {course.time}
                                </span>
                                <span className="flex items-center gap-1 truncate max-w-[140px] text-right" title={course.instructor}>
                                    <User size={10} className="shrink-0" />
                                    {course.instructor}
                                </span>
                            </div>
                            <div className="mt-1 flex items-center gap-1 text-[10px] text-gray-400">
                                <span>Cap: {course.enrolled}/{course.capacity}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </aside>
    );
};
