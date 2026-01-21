import React from 'react';
import { Calendar, Upload, Download, AlertCircle, FileJson } from 'lucide-react';
import { cn } from './scheduler.utils';

interface SchedulerHeaderProps {
    courseCount: number;
    totalCredits: number;
    hasConflicts: boolean;
    onExportJSON: () => void;
    onImportJSON: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SchedulerHeader: React.FC<SchedulerHeaderProps> = ({
    courseCount,
    totalCredits,
    hasConflicts,
    onExportJSON,
    onImportJSON
}) => {
    return (
        <header className="bg-white border-b border-gray-200 px-4 py-3 md:px-6 md:py-4 flex items-center justify-between shadow-sm z-30 shrink-0 gap-3">
            <div className="flex items-center gap-2 md:gap-3">
                <div className="bg-indigo-600 p-1.5 md:p-2 rounded-lg text-white">
                    <Calendar className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div>
                    <h1 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight leading-tight">ITU Scheduler</h1>
                    <p className="text-[10px] md:text-xs text-gray-500 font-medium hidden sm:block">Semester Planning For ITU Students</p>
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
                {/* Import */}
                <div className="relative">
                    <input
                        type="file"
                        accept=".json"
                        onChange={onImportJSON}
                        className="hidden"
                        id="import-upload"
                    />
                    <label
                        htmlFor="import-upload"
                        className="flex items-center gap-2 px-2 py-1.5 md:px-3 md:py-2 bg-gray-100 text-gray-700 rounded-lg text-xs md:text-sm font-medium hover:bg-gray-200 cursor-pointer transition-colors"
                        title="Import JSON"
                    >
                        <Upload size={16} />
                        <span className="hidden sm:inline">Import</span>
                    </label>
                </div>

                {/* Export Button */}
                <button
                    onClick={onExportJSON}
                    className="flex items-center gap-2 px-2 py-1.5 md:px-3 md:py-2 bg-indigo-600 text-white rounded-lg text-xs md:text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                    title="Export JSON"
                >
                    <Download size={16} />
                    <span className="hidden sm:inline">Export</span>
                </button>

                <div className="text-right hidden lg:block">
                    <div className="text-sm font-semibold text-gray-900">{courseCount} Courses</div>
                    <div className="text-xs text-gray-500">{totalCredits} Credits</div>
                </div>
                {hasConflicts && (
                    <div className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1.5 rounded-full border border-red-200 text-sm font-medium animate-pulse">
                        <AlertCircle size={16} />
                        <span>Conflict Detected</span>
                    </div>
                )}
            </div>
        </header>
    );
};
