import React from 'react';
import { X } from 'lucide-react';

interface CourseNoteModalProps {
    isOpen: boolean;
    note: string;
    onNoteChange: (note: string) => void;
    onSave: () => void;
    onCancel: () => void;
}

export const CourseNoteModal: React.FC<CourseNoteModalProps> = ({
    isOpen,
    note,
    onNoteChange,
    onSave,
    onCancel
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-semibold text-gray-900">Edit Course Note</h3>
                    <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={18} />
                    </button>
                </div>
                <div className="p-4">
                    <textarea
                        className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px] resize-none"
                        placeholder="Enter a note for this course..."
                        value={note}
                        onChange={(e) => onNoteChange(e.target.value)}
                        autoFocus
                    />
                </div>
                <div className="p-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/50">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSave}
                        className="px-4 py-2 text-sm bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-medium shadow-sm transition-all active:scale-95"
                    >
                        Save Note
                    </button>
                </div>
            </div>
        </div>
    );
};
