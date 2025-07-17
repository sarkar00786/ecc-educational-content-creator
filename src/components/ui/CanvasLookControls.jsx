import React, { useState, useRef, useEffect } from 'react';
import { Check, X } from 'lucide-react';

const CanvasLookControls = ({
  isActive,
  opacity,
  onToggleActive,
  onOpacityChange,
  onSave,
  onClose,
  triggerRef
}) => {
  const [tempOpacity, setTempOpacity] = useState(opacity);
  const [tempIsActive, setTempIsActive] = useState(isActive);
  const controlsRef = useRef(null);

  // Update temp values when props change
  useEffect(() => {
    setTempOpacity(opacity);
    setTempIsActive(isActive);
  }, [opacity, isActive]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        controlsRef.current &&
        !controlsRef.current.contains(event.target) &&
        triggerRef?.current &&
        !triggerRef.current.contains(event.target)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, triggerRef]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleToggleChange = (checked) => {
    setTempIsActive(checked);
    onToggleActive(checked); // Live update
  };

  const handleOpacityChange = (value) => {
    const newOpacity = parseFloat(value);
    setTempOpacity(newOpacity);
    onOpacityChange(newOpacity); // Live update
  };

  const handleSave = () => {
    onSave({ opacity: tempOpacity, isActive: tempIsActive });
    onClose();
  };

  const percentageValue = Math.round(tempOpacity * 100);

  return (
    <div
      ref={controlsRef}
      className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-50 animate-slide-down"
      role="dialog"
      aria-label="Canvas Look Controls"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Canvas Look Settings
        </h3>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label="Close Canvas Look controls"
        >
          <X size={16} />
        </button>
      </div>

      {/* Enable/Disable Toggle */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <label 
            htmlFor="canvas-look-toggle"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Enable Canvas Look
          </label>
          <button
            id="canvas-look-toggle"
            role="switch"
            aria-checked={tempIsActive}
            onClick={() => handleToggleChange(!tempIsActive)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              tempIsActive 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${
                tempIsActive ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {tempIsActive ? 'Gradient overlay is enabled' : 'Gradient overlay is disabled'}
        </p>
      </div>

      {/* Opacity Slider */}
      <div className={`mb-6 transition-opacity duration-200 ${tempIsActive ? 'opacity-100' : 'opacity-50'}`}>
        <div className="flex items-center justify-between mb-2">
          <label 
            htmlFor="opacity-slider"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Gradient Opacity
          </label>
          <span className="text-sm font-mono text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
            {percentageValue}%
          </span>
        </div>
        
        <input
          id="opacity-slider"
          type="range"
          min="0.01"
          max="1.0"
          step="0.01"
          value={tempOpacity}
          onChange={(e) => handleOpacityChange(e.target.value)}
          disabled={!tempIsActive}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            background: tempIsActive 
              ? `linear-gradient(to right, #3b82f6 0%, #8b5cf6 ${tempOpacity * 100}%, #e5e7eb ${tempOpacity * 100}%, #e5e7eb 100%)`
              : '#e5e7eb'
          }}
          aria-valuemin="0.01"
          aria-valuemax="1.0"
          aria-valuenow={tempOpacity}
          aria-valuetext={`${percentageValue} percent opacity`}
        />
        
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>1%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Adjust the intensity of the gradient overlay
        </p>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
        >
          <Check size={16} />
          Save Preferences
        </button>
      </div>
    </div>
  );
};

export default CanvasLookControls;
