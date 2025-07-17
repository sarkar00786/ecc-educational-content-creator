import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  CheckCircle, 
  Upload, 
  DollarSign, 
  Users, 
  Phone, 
  Mail, 
  CreditCard,
  AlertCircle,
  Clock,
  Star,
  BookOpen,
  MessageSquare,
  FileText,
  Zap
} from 'lucide-react';

const PurchasePage = ({ onBack }) => {
  const [formData, setFormData] = useState({
    senderName: '',
    senderEmail: '',
    senderPhone: '',
    paymentMethod: '',
    transactionId: '',
    paymentScreenshot: null,
    additionalNotes: ''
  });
  
  const [remainingSlots, setRemainingSlots] = useState(100);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  // Load remaining slots from localStorage or set default
  useEffect(() => {
    const savedSlots = localStorage.getItem('proRemainingSlots');
    if (savedSlots) {
      setRemainingSlots(parseInt(savedSlots, 10));
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, paymentScreenshot: 'Please upload an image file' }));
        return;
      }
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, paymentScreenshot: 'File size must be less than 5MB' }));
        return;
      }
      setFormData(prev => ({ ...prev, paymentScreenshot: file }));
      setErrors(prev => ({ ...prev, paymentScreenshot: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.senderName.trim()) newErrors.senderName = 'Name is required';
    if (!formData.senderEmail.trim()) newErrors.senderEmail = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.senderEmail)) newErrors.senderEmail = 'Invalid email format';
    if (!formData.senderPhone.trim()) newErrors.senderPhone = 'Phone number is required';
    if (!formData.paymentMethod) newErrors.paymentMethod = 'Payment method is required';
    if (!formData.transactionId.trim()) newErrors.transactionId = 'Transaction ID is required';
    if (!formData.paymentScreenshot) newErrors.paymentScreenshot = 'Payment screenshot is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Convert file to base64 for API submission
      let paymentScreenshotBase64 = null;
      if (formData.paymentScreenshot) {
        const reader = new FileReader();
        paymentScreenshotBase64 = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(formData.paymentScreenshot);
        });
      }
      
      // Prepare data for API submission
      const submissionData = {
        senderName: formData.senderName,
        senderEmail: formData.senderEmail,
        senderPhone: formData.senderPhone,
        paymentMethod: formData.paymentMethod,
        transactionId: formData.transactionId,
        additionalNotes: formData.additionalNotes,
        paymentScreenshot: paymentScreenshotBase64
      };
      
      // Submit to Netlify function with fallback mechanism
      let response;
      let result;
      
      try {
        response = await fetch('/.netlify/functions/submit-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submissionData)
        });
        
        // Try to parse JSON response
        try {
          result = await response.json();
        } catch (jsonError) {
          console.error('JSON parsing error:', jsonError);
          console.error('Response status:', response.status);
          
          // If we can't parse JSON, treat as server error
          throw new Error('Server returned invalid response');
        }
        
        if (!response.ok && result.error) {
          throw new Error(result.error || 'Failed to submit payment details');
        }
        
      } catch (fetchError) {
        console.error('Fetch error:', fetchError);
        
        // Check if it's a network error (Failed to fetch) or server error
        if (fetchError.message.includes('Failed to fetch') || 
            fetchError.message.includes('NetworkError') ||
            fetchError.message.includes('Server returned invalid response') ||
            fetchError.name === 'TypeError') {
          
          console.warn('Network/Server error detected - payment submission failed');
          throw new Error('Unable to connect to payment service. Please try again later or contact support.');
        } else {
          // Re-throw other types of errors
          throw fetchError;
        }
      }
      
      // Update remaining slots
      const newRemainingSlots = Math.max(0, remainingSlots - 1);
      setRemainingSlots(newRemainingSlots);
      localStorage.setItem('proRemainingSlots', newRemainingSlots.toString());
      
      setSubmitSuccess(true);
      
      // Reset form
      setFormData({
        senderName: '',
        senderEmail: '',
        senderPhone: '',
        paymentMethod: '',
        transactionId: '',
        paymentScreenshot: null,
        additionalNotes: ''
      });
      
    } catch (error) {
      console.error('Submission error:', error);
      setErrors({ submit: `Failed to submit payment details: ${error.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  const proFeatures = [
    { icon: BookOpen, text: 'Access to all subject-specific chats' },
    { icon: MessageSquare, text: 'Unlimited conversations' },
    { icon: FileText, text: 'File upload and sharing capabilities' },
    { icon: Zap, text: 'Advanced AI features and tools' },
    { icon: Star, text: 'Priority support and updates' },
    { icon: Crown, text: 'Enhanced learning experience' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Crown className="w-12 h-12 text-purple-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Upgrade to PRO Learning Experience
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Unlock the full potential of your educational journey with our enhanced learning platform
          </p>
        </div>

        {/* Limited Time Offer Alert */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg p-4 mb-8 text-center">
          <div className="flex items-center justify-center mb-2">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span className="font-semibold">Limited Time Offer!</span>
          </div>
          <p className="text-sm">
            Special discounted price of <strong>219 PKR</strong> for our first 100 users only!
          </p>
          <div className="flex items-center justify-center mt-2">
            <Users className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium">
              Only {remainingSlots} spots remaining out of 100
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Features Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              What's Included in PRO?
            </h2>
            <div className="space-y-4">
              {proFeatures.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <feature.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Instructions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Payment Instructions
            </h2>
            
            <div className="space-y-6">
              {/* Payment Amount */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4">
                <div className="flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600 mr-2" />
                  <span className="text-2xl font-bold text-green-600">219 PKR</span>
                </div>
                <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Special discounted price
                </p>
              </div>

              {/* Payment Methods */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Choose Payment Method:</h3>
                
                {/* Meezan Bank */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-medium text-gray-900 dark:text-white">Meezan Bank</span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p><strong>Account Holder:</strong> Jhangir Hussain</p>
                    <p><strong>Account Number:</strong> 99190110913188</p>
                  </div>
                </div>

                {/* JazzCash */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Phone className="w-5 h-5 text-purple-600 mr-2" />
                    <span className="font-medium text-gray-900 dark:text-white">JazzCash</span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p><strong>Account Holder:</strong> Lareb</p>
                    <p><strong>Account Number:</strong> 03282462642</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Contact Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="text-gray-700 dark:text-gray-300">azkabloch786@gmail.com</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-gray-700 dark:text-gray-300">+923707874867 (WhatsApp)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Submit Payment Details
          </h2>
          
          {submitSuccess ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-green-600 mb-2">Payment Submitted Successfully!</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Your payment details have been received. We'll verify your payment and activate your PRO access within 24 hours.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                If you don't receive an update, please contact us at +923707874867 (WhatsApp)
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sender Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    name="senderName"
                    value={formData.senderName}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.senderName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors.senderName && <p className="text-red-500 text-sm mt-1">{errors.senderName}</p>}
                </div>

                {/* Sender Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="senderEmail"
                    value={formData.senderEmail}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.senderEmail ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="your@email.com"
                  />
                  {errors.senderEmail && <p className="text-red-500 text-sm mt-1">{errors.senderEmail}</p>}
                </div>

                {/* Sender Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="senderPhone"
                    value={formData.senderPhone}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.senderPhone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="+92xxxxxxxxx"
                  />
                  {errors.senderPhone && <p className="text-red-500 text-sm mt-1">{errors.senderPhone}</p>}
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Method *
                  </label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.paymentMethod ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <option value="">Select payment method</option>
                    <option value="meezan_bank">Meezan Bank</option>
                    <option value="jazzcash">JazzCash</option>
                  </select>
                  {errors.paymentMethod && <p className="text-red-500 text-sm mt-1">{errors.paymentMethod}</p>}
                </div>

                {/* Transaction ID */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Transaction ID / Reference Number *
                  </label>
                  <input
                    type="text"
                    name="transactionId"
                    value={formData.transactionId}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.transactionId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter transaction ID from payment receipt"
                  />
                  {errors.transactionId && <p className="text-red-500 text-sm mt-1">{errors.transactionId}</p>}
                </div>

                {/* Payment Screenshot */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Screenshot *
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600 dark:text-gray-400">
                        <label className="relative cursor-pointer rounded-md font-medium text-purple-600 hover:text-purple-500">
                          <span>Upload a screenshot</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="sr-only"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  </div>
                  {formData.paymentScreenshot && (
                    <p className="text-sm text-green-600 mt-2">✓ {formData.paymentScreenshot.name}</p>
                  )}
                  {errors.paymentScreenshot && <p className="text-red-500 text-sm mt-1">{errors.paymentScreenshot}</p>}
                </div>

                {/* Additional Notes */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    name="additionalNotes"
                    value={formData.additionalNotes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Any additional information..."
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 mr-2 animate-spin" />
                      Submitting...
                    </div>
                  ) : (
                    'Submit Payment Details'
                  )}
                </button>
              </div>

              {errors.submit && (
                <div className="text-center">
                  <p className="text-red-500 text-sm">{errors.submit}</p>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={onBack}
            className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            ← Back to Learning Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchasePage;
