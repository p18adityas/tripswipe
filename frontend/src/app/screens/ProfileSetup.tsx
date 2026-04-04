import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, ArrowRight, User, Globe, MapPin, Calendar, Shield, FileText, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useUserStore } from '../store/userStore';
import { toast } from 'sonner';

type ProfileStep = 'basic' | 'passport' | 'visa' | 'review';

const steps = [
  { id: 'basic', label: 'Basic Info', icon: User },
  { id: 'passport', label: 'Passport', icon: Shield },
  { id: 'visa', label: 'Visa', icon: FileText },
  { id: 'review', label: 'Review', icon: Check }
];

export function ProfileSetup() {
  const navigate = useNavigate();
  const { user, updateProfile, completeProfileSetup, getPendingAction, clearPendingAction } = useUserStore();
  const [currentStep, setCurrentStep] = useState<ProfileStep>('basic');
  const [loading, setLoading] = useState(false);
  
  const [basicInfo, setBasicInfo] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    nationality: '',
    countryOfResidence: '',
    dateOfBirth: ''
  });
  
  const [passportInfo, setPassportInfo] = useState({
    country: '',
    number: '',
    holderName: '',
    issueDate: '',
    expiryDate: ''
  });
  
  const [visaInfo, setVisaInfo] = useState({
    hasVisa: false,
    country: '',
    type: '',
    countries: [] as string[],
    expiryDate: ''
  });
  
  const [consent, setConsent] = useState({
    terms: false,
    privacy: false,
    dataStorage: false
  });
  
  const currentStepIndex = steps.findIndex(s => s.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;
  
  const handleNext = () => {
    if (currentStep === 'basic') {
      if (!basicInfo.nationality || !basicInfo.countryOfResidence) {
        toast.error('Please fill in all required fields');
        return;
      }
      setCurrentStep('passport');
    } else if (currentStep === 'passport') {
      setCurrentStep('visa');
    } else if (currentStep === 'visa') {
      setCurrentStep('review');
    }
  };
  
  const handleBack = () => {
    if (currentStep === 'passport') setCurrentStep('basic');
    else if (currentStep === 'visa') setCurrentStep('passport');
    else if (currentStep === 'review') setCurrentStep('visa');
    else navigate(-1);
  };
  
  const handleSkip = () => {
    if (currentStep === 'passport' || currentStep === 'visa') {
      handleNext();
    }
  };
  
  const handleComplete = async () => {
    if (!consent.terms || !consent.privacy || !consent.dataStorage) {
      toast.error('Please accept all consents to continue');
      return;
    }
    
    setLoading(true);
    
    // Save all profile data
    updateProfile({
      ...basicInfo,
      passport: passportInfo.number ? passportInfo : undefined,
      visa: visaInfo.hasVisa ? visaInfo : undefined
    });
    
    completeProfileSetup();
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    toast.success('Profile setup complete!');
    
    // Check if there's a pending action
    const pendingAction = getPendingAction();
    if (pendingAction) {
      clearPendingAction();
      navigate('/auth/success', { state: { action: pendingAction } });
    } else {
      navigate('/');
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
      {/* Header */}
      <div className="px-4 py-4 border-b border-slate-200 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="text-sm font-medium text-slate-600">
              Step {currentStepIndex + 1} of {steps.length}
            </div>
            
            {(currentStep === 'passport' || currentStep === 'visa') && (
              <button
                onClick={handleSkip}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Skip
              </button>
            )}
            {currentStep !== 'passport' && currentStep !== 'visa' && <div className="w-12" />}
          </div>
          
          {/* Progress Bar */}
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          
          {/* Step Indicators */}
          <div className="flex items-center justify-between mt-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStepIndex;
              const isComplete = index < currentStepIndex;
              
              return (
                <div key={step.id} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      isComplete
                        ? 'bg-blue-600 text-white'
                        : isActive
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-xs ${isActive ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <AnimatePresence mode="wait">
            {currentStep === 'basic' && (
              <BasicInfoStep
                key="basic"
                data={basicInfo}
                onChange={setBasicInfo}
                onNext={handleNext}
              />
            )}
            
            {currentStep === 'passport' && (
              <PassportStep
                key="passport"
                data={passportInfo}
                onChange={setPassportInfo}
                onNext={handleNext}
              />
            )}
            
            {currentStep === 'visa' && (
              <VisaStep
                key="visa"
                data={visaInfo}
                onChange={setVisaInfo}
                onNext={handleNext}
              />
            )}
            
            {currentStep === 'review' && (
              <ReviewStep
                key="review"
                basicInfo={basicInfo}
                passportInfo={passportInfo}
                visaInfo={visaInfo}
                consent={consent}
                onConsentChange={setConsent}
                onComplete={handleComplete}
                loading={loading}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function BasicInfoStep({ data, onChange, onNext }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold mb-2">Tell us about yourself</h2>
        <p className="text-slate-600">
          We'll use this information to personalize your travel experience
        </p>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="fullName">Full Name *</Label>
          <Input
            id="fullName"
            value={data.fullName}
            onChange={(e) => onChange({ ...data, fullName: e.target.value })}
            placeholder="As shown on your passport"
            className="h-12 mt-2"
          />
        </div>
        
        <div>
          <Label htmlFor="nationality">Nationality *</Label>
          <Input
            id="nationality"
            value={data.nationality}
            onChange={(e) => onChange({ ...data, nationality: e.target.value })}
            placeholder="e.g., Indian, American"
            className="h-12 mt-2"
          />
        </div>
        
        <div>
          <Label htmlFor="countryOfResidence">Country of Residence *</Label>
          <Input
            id="countryOfResidence"
            value={data.countryOfResidence}
            onChange={(e) => onChange({ ...data, countryOfResidence: e.target.value })}
            placeholder="Where do you currently live?"
            className="h-12 mt-2"
          />
        </div>
        
        <div>
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={data.dateOfBirth}
            onChange={(e) => onChange({ ...data, dateOfBirth: e.target.value })}
            className="h-12 mt-2"
          />
        </div>
        
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={data.phone}
            onChange={(e) => onChange({ ...data, phone: e.target.value })}
            placeholder="+1 (555) 000-0000"
            className="h-12 mt-2"
          />
        </div>
      </div>
      
      <Button
        onClick={onNext}
        className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        size="lg"
      >
        Continue
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </motion.div>
  );
}

function PassportStep({ data, onChange, onNext }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold mb-2">Passport Details</h2>
        <p className="text-slate-600">
          Add your passport information for visa recommendations and travel requirements
        </p>
        <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
          <div className="flex gap-3">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Your data is secure</p>
              <p className="text-sm text-blue-700 mt-1">
                We use bank-level encryption to protect your sensitive information
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="passportCountry">Issuing Country</Label>
          <Input
            id="passportCountry"
            value={data.country}
            onChange={(e) => onChange({ ...data, country: e.target.value })}
            placeholder="e.g., India, United States"
            className="h-12 mt-2"
          />
        </div>
        
        <div>
          <Label htmlFor="passportNumber">Passport Number</Label>
          <Input
            id="passportNumber"
            value={data.number}
            onChange={(e) => onChange({ ...data, number: e.target.value })}
            placeholder="Enter passport number"
            className="h-12 mt-2"
          />
        </div>
        
        <div>
          <Label htmlFor="holderName">Name on Passport</Label>
          <Input
            id="holderName"
            value={data.holderName}
            onChange={(e) => onChange({ ...data, holderName: e.target.value })}
            placeholder="As shown on passport"
            className="h-12 mt-2"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="issueDate">Issue Date</Label>
            <Input
              id="issueDate"
              type="date"
              value={data.issueDate}
              onChange={(e) => onChange({ ...data, issueDate: e.target.value })}
              className="h-12 mt-2"
            />
          </div>
          
          <div>
            <Label htmlFor="expiryDate">Expiry Date</Label>
            <Input
              id="expiryDate"
              type="date"
              value={data.expiryDate}
              onChange={(e) => onChange({ ...data, expiryDate: e.target.value })}
              className="h-12 mt-2"
            />
          </div>
        </div>
      </div>
      
      <Button
        onClick={onNext}
        className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        size="lg"
      >
        Continue
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </motion.div>
  );
}

function VisaStep({ data, onChange, onNext }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold mb-2">Visa Information</h2>
        <p className="text-slate-600">
          Help us provide accurate entry requirements for your destinations
        </p>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label>Do you have any active visas?</Label>
          <div className="flex gap-4 mt-3">
            <button
              onClick={() => onChange({ ...data, hasVisa: true })}
              className={`flex-1 h-12 rounded-lg border-2 transition-colors ${
                data.hasVisa
                  ? 'border-blue-600 bg-blue-50 text-blue-600'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              Yes
            </button>
            <button
              onClick={() => onChange({ ...data, hasVisa: false })}
              className={`flex-1 h-12 rounded-lg border-2 transition-colors ${
                !data.hasVisa
                  ? 'border-blue-600 bg-blue-50 text-blue-600'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              No
            </button>
          </div>
        </div>
        
        {data.hasVisa && (
          <>
            <div>
              <Label htmlFor="visaCountry">Visa Issuing Country</Label>
              <Input
                id="visaCountry"
                value={data.country}
                onChange={(e) => onChange({ ...data, country: e.target.value })}
                placeholder="e.g., United States, Schengen"
                className="h-12 mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="visaType">Visa Type</Label>
              <Input
                id="visaType"
                value={data.type}
                onChange={(e) => onChange({ ...data, type: e.target.value })}
                placeholder="e.g., Tourist, Business, Multiple Entry"
                className="h-12 mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="visaExpiry">Expiry Date</Label>
              <Input
                id="visaExpiry"
                type="date"
                value={data.expiryDate}
                onChange={(e) => onChange({ ...data, expiryDate: e.target.value })}
                className="h-12 mt-2"
              />
            </div>
          </>
        )}
      </div>
      
      <Button
        onClick={onNext}
        className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        size="lg"
      >
        Continue
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </motion.div>
  );
}

function ReviewStep({ basicInfo, passportInfo, visaInfo, consent, onConsentChange, onComplete, loading }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold mb-2">Review & Consent</h2>
        <p className="text-slate-600">
          Please review your information and provide consent
        </p>
      </div>
      
      {/* Summary */}
      <div className="space-y-4">
        <div className="p-4 bg-slate-50 rounded-lg">
          <h3 className="font-semibold mb-3">Basic Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Name:</span>
              <span className="font-medium">{basicInfo.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Nationality:</span>
              <span className="font-medium">{basicInfo.nationality}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Residence:</span>
              <span className="font-medium">{basicInfo.countryOfResidence}</span>
            </div>
          </div>
        </div>
        
        {passportInfo.number && (
          <div className="p-4 bg-slate-50 rounded-lg">
            <h3 className="font-semibold mb-3">Passport Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Country:</span>
                <span className="font-medium">{passportInfo.country}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Number:</span>
                <span className="font-medium">{passportInfo.number}</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Consent Checkboxes */}
      <div className="space-y-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
        <h3 className="font-semibold">Consent & Terms</h3>
        
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={consent.terms}
            onChange={(e) => onConsentChange({ ...consent, terms: e.target.checked })}
            className="mt-1 w-4 h-4 rounded border-slate-300"
          />
          <span className="text-sm">
            I agree to the <button className="text-blue-600 hover:underline">Terms of Service</button>
          </span>
        </label>
        
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={consent.privacy}
            onChange={(e) => onConsentChange({ ...consent, privacy: e.target.checked })}
            className="mt-1 w-4 h-4 rounded border-slate-300"
          />
          <span className="text-sm">
            I agree to the <button className="text-blue-600 hover:underline">Privacy Policy</button>
          </span>
        </label>
        
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={consent.dataStorage}
            onChange={(e) => onConsentChange({ ...consent, dataStorage: e.target.checked })}
            className="mt-1 w-4 h-4 rounded border-slate-300"
          />
          <span className="text-sm">
            I consent to secure storage of my passport and visa information for travel recommendations
          </span>
        </label>
      </div>
      
      <Button
        onClick={onComplete}
        disabled={loading || !consent.terms || !consent.privacy || !consent.dataStorage}
        className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        size="lg"
      >
        {loading ? 'Completing...' : 'Complete Setup'}
        <Check className="w-5 h-5 ml-2" />
      </Button>
    </motion.div>
  );
}
