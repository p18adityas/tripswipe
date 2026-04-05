import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Mail, Phone } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useUserStore } from '../store/userStore';
import { toast } from 'sonner';
import { useGoogleLogin } from '@react-oauth/google';
import { auth } from '../services/api';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../components/ui/input-otp';

export function SignUp() {
  const navigate = useNavigate();
  const { signUp } = useUserStore();
  const [method, setMethod] = useState<'email' | 'phone' | null>(null);
  const [otpStep, setOtpStep] = useState<'phone' | 'otp'>('phone');
  const [otpCode, setOtpCode] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }).then(r => r.json());

        const res = await auth.google(tokenResponse.access_token);
        useUserStore.setState({
          isAuthenticated: true,
          jwt: res.jwt,
          user: {
            fullName: res.user.display_name || userInfo.name || '',
            email: res.user.email || userInfo.email || '',
            countryOfResidence: '',
            nationality: '',
          },
          profileSetupComplete: res.user.profile_setup_complete || false,
        });
        toast.success('Signed in with Google!');
        navigate(res.user.profile_setup_complete ? '/' : '/auth/profile-setup');
      } catch (error: any) {
        toast.error(error?.message || 'Google sign-in failed');
      } finally {
        setLoading(false);
      }
    },
    onError: () => toast.error('Google sign-in failed'),
  });

  // Email signup
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signUp(formData.email, formData.password, formData.name);
      toast.success('Account created successfully!');
      navigate('/auth/profile-setup');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  // Phone OTP: request code
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const phone = formData.phone.startsWith('+') ? formData.phone : `+91${formData.phone}`;
    setLoading(true);
    try {
      await auth.requestOtp(phone);
      setFormData({ ...formData, phone });
      setOtpStep('otp');
      toast.success('OTP sent to your phone!');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // Phone OTP: verify code
  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) return;
    setLoading(true);
    try {
      const res = await auth.verifyOtp(formData.phone, otpCode);
      useUserStore.setState({
        isAuthenticated: true,
        jwt: res.jwt,
        user: {
          fullName: res.user.display_name || '',
          email: res.user.email || '',
          phone: res.user.phone || formData.phone,
          countryOfResidence: '',
          nationality: '',
        },
        profileSetupComplete: res.user.profile_setup_complete || false,
      });
      toast.success('Welcome!');
      navigate(res.user.profile_setup_complete ? '/' : '/auth/profile-setup');
    } catch (error: any) {
      toast.error(error?.message || 'Invalid OTP');
      setOtpCode('');
    } finally {
      setLoading(false);
    }
  };

  // Method selection screen
  if (!method) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
        <div className="px-4 py-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 pb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto w-full">
            <h1 className="text-3xl font-bold mb-2 text-center">Create Account</h1>
            <p className="text-slate-600 text-center mb-8">Choose how you'd like to sign up</p>

            <div className="space-y-3">
              <Button onClick={() => setMethod('phone')} variant="outline" size="lg" className="w-full h-14 justify-start gap-3">
                <Phone className="w-5 h-5" />
                Continue with Phone
              </Button>

              <Button onClick={() => setMethod('email')} variant="outline" size="lg" className="w-full h-14 justify-start gap-3">
                <Mail className="w-5 h-5" />
                Continue with Email
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
                <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-slate-500">Or continue with</span></div>
              </div>

              <Button onClick={() => googleLogin()} variant="outline" size="lg" className="w-full h-14 justify-start gap-3" disabled={loading}>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </Button>
            </div>

            <p className="text-center text-sm text-slate-600 mt-8">
              Already have an account?{' '}
              <button onClick={() => navigate('/auth/signin')} className="text-blue-600 hover:underline font-medium">Sign In</button>
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  // Phone OTP flow
  if (method === 'phone') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
        <div className="px-4 py-4">
          <button onClick={() => otpStep === 'otp' ? setOtpStep('phone') : setMethod(null)} className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 pb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto w-full">
            {otpStep === 'phone' ? (
              <>
                <h1 className="text-3xl font-bold mb-2">Enter Phone Number</h1>
                <p className="text-slate-600 mb-8">We'll send you a verification code</p>

                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number</label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      required
                      className="h-12"
                    />
                    <p className="text-xs text-slate-500 mt-1">Include country code (e.g. +91 for India)</p>
                  </div>

                  <Button type="submit" className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 mt-6" disabled={loading}>
                    {loading ? 'Sending OTP...' : 'Send OTP'}
                  </Button>
                </form>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold mb-2">Verify OTP</h1>
                <p className="text-slate-600 mb-8">Enter the 6-digit code sent to {formData.phone}</p>

                <div className="flex justify-center mb-8">
                  <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <Button onClick={handleVerifyOtp} className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" disabled={loading || otpCode.length !== 6}>
                  {loading ? 'Verifying...' : 'Verify & Continue'}
                </Button>

                <button onClick={handleSendOtp} className="w-full text-center text-sm text-blue-600 hover:underline mt-4" disabled={loading}>
                  Resend OTP
                </button>
              </>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  // Email form
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
      <div className="px-4 py-4">
        <button onClick={() => setMethod(null)} className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto w-full">
          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-slate-600 mb-8">Enter your details to get started</p>

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <Input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="John Doe" required className="h-12" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="you@example.com" required className="h-12" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="••••••••" required className="h-12" />
            </div>
            <Button type="submit" className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 mt-6" disabled={loading}>
              {loading ? 'Creating Account...' : 'Continue'}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
