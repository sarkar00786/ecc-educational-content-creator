import React, { useState, useCallback } from 'react';
import { X, BookOpen, Calculator, Atom, FlaskConical, Clock, BookMarked, DollarSign, MessageSquare } from 'lucide-react';
import { getAvailableSubjects } from '../../config/userTiers';

const NewChatModal = ({ isOpen, onClose, onCreateChat, isCreating = false }) => {
  const [selectedSubject, setSelectedSubject] = useState('General');

  // Define all subjects with their metadata
  const allSubjects = [
    { id: 'General', name: 'General Discussion', icon: MessageSquare, color: 'bg-blue-500', description: 'Open discussions on any topic' },
    { id: 'Mathematics', name: 'Mathematics', icon: Calculator, color: 'bg-green-500', description: 'Math concepts, problems, and solutions' },
    { id: 'Science', name: 'Science', icon: Atom, color: 'bg-purple-500', description: 'General science topics and concepts' },
    { id: 'Physics', name: 'Physics', icon: Atom, color: 'bg-indigo-500', description: 'Physics principles and applications' },
    { id: 'Chemistry', name: 'Chemistry', icon: FlaskConical, color: 'bg-orange-500', description: 'Chemical reactions and properties' },
    { id: 'History', name: 'History', icon: Clock, color: 'bg-amber-500', description: 'Historical events and analysis' },
    { id: 'Literature', name: 'Literature', icon: BookOpen, color: 'bg-rose-500', description: 'Literature analysis and discussion' },
    { id: 'Accounting & Finance', name: 'Accounting & Finance', icon: DollarSign, color: 'bg-emerald-500', description: 'Financial concepts and accounting' }
  ];

  // Filter subjects based on user tier
  const subjects = allSubjects.filter(subject => getAvailableSubjects().includes(subject.id));

  const handleCreate = useCallback(() => {
    onCreateChat({
      subject: selectedSubject,
      isGeneral: selectedSubject === 'General'
    });
  }, [selectedSubject, onCreateChat]);

  const handleSubjectSelect = useCallback((subjectId) => {
    setSelectedSubject(subjectId);
  }, []);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Create New Chat
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Subject Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Select Subject
            </label>
            <div className="grid grid-cols-2 gap-3">
              {subjects.map((subject) => {
                const IconComponent = subject.icon;
                const isSelected = selectedSubject === subject.id;
                
                return (
                  <button
                    key={subject.id}
                    onClick={() => handleSubjectSelect(subject.id)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg ${subject.color} flex items-center justify-center`}>
                        <IconComponent className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {subject.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {subject.description}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Subject Preview */}
          {selectedSubject && (
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg ${subjects.find(s => s.id === selectedSubject)?.color} flex items-center justify-center`}>
                  {React.createElement(subjects.find(s => s.id === selectedSubject)?.icon, {
                    className: "w-5 h-5 text-white"
                  })}
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {subjects.find(s => s.id === selectedSubject)?.name} Chat
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Chat title will be automatically generated from your first message
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={isCreating}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={isCreating}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {isCreating ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Creating...</span>
              </>
            ) : (
              <span>Create Chat</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewChatModal;
