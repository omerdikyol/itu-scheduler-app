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
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-30 shrink-0">
            <div className="flex items-center gap-3">
                <div className="bg-indigo-600 p-2 rounded-lg text-white">
                    <Calendar size={24} />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">ITU Scheduler</h1>
                    <p className="text-xs text-gray-500 font-medium">Semester Planning For ITU Students</p>
                </div>
            </div>

            <div className="flex items-center gap-3">
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
                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 cursor-pointer transition-colors"
                    >
                        <Upload size={16} />
                        <span className="hidden sm:inline">Import</span>
                    </label>
                </div>

                {/* Export Button */}
                <button
                    onClick={onExportJSON}
                    className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    <Download size={16} />
                    <span className="hidden sm:inline">Export</span>
                </button>

                <div className="text-right hidden sm:block">
                    <div className="text-sm font-semibold text-gray-900">{courseCount} Courses Selected</div>
                    <div className="text-xs text-gray-500">Approx. {totalCredits} Credits</div>
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
