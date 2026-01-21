'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Course } from './scheduler.types';
import { processCourses } from './scheduler.utils';
import { Sidebar } from './Sidebar';
import { CalendarGrid } from './CalendarGrid';
import { SchedulerHeader } from './SchedulerHeader';
import { CourseNoteModal } from './CourseNoteModal';

export default function Scheduler() {
    // State
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCrns, setSelectedCrns] = useState<string[]>([]);
    const [courseNotes, setCourseNotes] = useState<Record<string, string>>({});

    // Note Modal State
    const [editingNoteCrn, setEditingNoteCrn] = useState<string | null>(null);
    const [tempNote, setTempNote] = useState('');

    // --- INITIALIZATION & PERSISTENCE ---

    useEffect(() => {
        // Load persisted data
        const savedCrns = localStorage.getItem('itu_scheduler_selected');
        const savedNotes = localStorage.getItem('itu_scheduler_notes');
        const savedCourses = localStorage.getItem('itu_scheduler_pool');

        if (savedCrns) setSelectedCrns(JSON.parse(savedCrns));
        if (savedNotes) setCourseNotes(JSON.parse(savedNotes));
        if (savedCourses) {
            setCourses(processCourses(JSON.parse(savedCourses)));
        }
    }, []);

    // Save to local storage on change
    useEffect(() => {
        const savedCrns = localStorage.getItem('itu_scheduler_selected');
        const savedNotes = localStorage.getItem('itu_scheduler_notes');
        const savedCourses = localStorage.getItem('itu_scheduler_pool');

        if (savedCrns) setSelectedCrns(JSON.parse(savedCrns));
        if (savedNotes) setCourseNotes(JSON.parse(savedNotes));
        if (savedCourses) {
            setCourses(processCourses(JSON.parse(savedCourses)));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('itu_scheduler_pool', JSON.stringify(courses));
    }, [courses]);

    useEffect(() => {
        if (Object.keys(courseNotes).length > 0) {
            localStorage.setItem('itu_scheduler_notes', JSON.stringify(courseNotes));
        }
    }, [courseNotes]);

    useEffect(() => {
        localStorage.setItem('itu_scheduler_selected', JSON.stringify(selectedCrns));
    }, [selectedCrns]);


    // --- HANDLERS ---

    const handleAddCourses = (newCourses: Course[]) => {
        // Merge: Overwrite existing courses with new data (to get Cap/Enrolled updates)
        setCourses(prev => {
            const newCrns = new Set(newCourses.map(c => c.crn));
            const prevFiltered = prev.filter(c => !newCrns.has(c.crn));
            const merged = [...prevFiltered, ...newCourses];
            console.log(`[Scheduler] Merged courses. Total: ${merged.length}`);
            return merged;
        });
    };

    const toggleCourse = (crn: string) => {
        setSelectedCrns(prev =>
            prev.includes(crn) ? prev.filter(id => id !== crn) : [...prev, crn]
        );
    };

    const clearAllCourses = () => {
        if (confirm('Are you sure you want to clear all fetched courses? This will also clear your schedule.')) {
            setCourses([]);
            setSelectedCrns([]);
        }
    };

    const handleEditNote = (crn: string) => {
        setEditingNoteCrn(crn);
        setTempNote(courseNotes[crn] || '');
    };

    const saveNote = () => {
        if (editingNoteCrn) {
            setCourseNotes(prev => ({ ...prev, [editingNoteCrn]: tempNote }));
            setEditingNoteCrn(null);
            setTempNote('');
        }
    };

    const cancelNote = () => {
        setEditingNoteCrn(null);
        setTempNote('');
    };

    const handleExportJSON = () => {
        const data = {
            selectedCourses,
            courseNotes,
            generatedAt: new Date().toISOString(),
            credits: totalCredits
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `itu-schedule-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);

                if (!json.selectedCourses || !Array.isArray(json.selectedCourses)) {
                    throw new Error('Invalid file format: Missing selectedCourses');
                }

                const importedCourses = json.selectedCourses;
                setCourses(prev => {
                    const existingCrns = new Set(prev.map(c => c.crn));
                    const newCourses = importedCourses.filter((c: Course) => !existingCrns.has(c.crn));
                    return [...prev, ...newCourses];
                });

                setSelectedCrns(importedCourses.map((c: Course) => c.crn));

                if (json.courseNotes) {
                    setCourseNotes(json.courseNotes);
                }

                alert('Schedule imported successfully!');
            } catch (err) {
                console.error('Import error:', err);
                alert('Failed to import file. Invalid format.');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    // --- DERIVED STATE ---

    const selectedCourses = useMemo(() => courses.filter(c => selectedCrns.includes(c.crn)), [courses, selectedCrns]);

    const conflicts = useMemo(() => {
        const conflictSet = new Set();
        for (let i = 0; i < selectedCourses.length; i++) {
            for (let j = i + 1; j < selectedCourses.length; j++) {
                const a = selectedCourses[i];
                const b = selectedCourses[j];
                if (a.dayIndex === b.dayIndex) {
                    if (a.startMin < b.endMin && b.startMin < a.endMin) {
                        conflictSet.add(a.crn);
                        conflictSet.add(b.crn);
                    }
                }
            }
        }
        return conflictSet;
    }, [selectedCourses]);

    const totalCredits = selectedCourses.length * 3; // Approx


    return (
        <div className="flex flex-col h-screen bg-white text-slate-800 font-sans overflow-hidden">
            <SchedulerHeader
                courseCount={selectedCourses.length}
                totalCredits={totalCredits}
                hasConflicts={conflicts.size > 0}
                onExportJSON={handleExportJSON}
                onImportJSON={handleImportJSON}
            />

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                <Sidebar
                    courses={courses}
                    selectedCrns={selectedCrns}
                    conflicts={conflicts}
                    onAddCourses={handleAddCourses}
                    onToggleCourse={toggleCourse}
                    onClearAll={clearAllCourses}
                    onEditNote={handleEditNote}
                />

                <CalendarGrid
                    selectedCourses={selectedCourses}
                    conflicts={conflicts}
                    courseNotes={courseNotes}
                    onDeleteCourse={toggleCourse}
                    onEditNote={handleEditNote}
                />
            </div>

            <CourseNoteModal
                isOpen={!!editingNoteCrn}
                note={tempNote}
                onNoteChange={setTempNote}
                onSave={saveNote}
                onCancel={cancelNote}
            />

            <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.3);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(156, 163, 175, 0.5);
        }
      `}</style>
        </div >
    );
}
