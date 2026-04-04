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

export function SignIn() {
  const navigate = useNavigate();
  const { signIn } = useUserStore();
  const [method, setMethod] = useState<'email' | 'phone' | null>(null);
  const [formData, setFormData] = useState({
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
        toast.success('Welcome back!');
        navigate(res.user.profile_setup_complete ? '/' : '/auth/profile-setup');
      } catch (error: any) {
        toast.error(error?.message || 'Google sign-in failed');
      } finally {
        setLoading(false);
      }
    },
    onError: () => toast.error('Google sign-in failed'),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(formData.email || formData.phone, formData.password);
      toast.success('Welcome back!');
      // Go to profile setup only if not complete, otherwise go home
      const { profileSetupComplete } = useUserStore.getState();
      navigate(profileSetupComplete ? '/' : '/auth/profile-setup');
    } catch (error: any) {
      const msg = error?.message || 'Invalid email or password';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };
  
  if (!method) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
        {/* Header */}
        <div className="px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 flex flex-col justify-center px-6 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto w-full"
          >
            <h1 className="text-3xl font-bold mb-2 text-center">Welcome Back</h1>
            <p className="text-slate-600 text-center mb-8">
              Sign in to your account
            </p>
            
            <div className="space-y-3">
              <Button
                onClick={() => setMethod('email')}
                variant="outline"
                size="lg"
                className="w-full h-14 justify-start gap-3"
              >
                <Mail className="w-5 h-5" />
                Continue with Email
              </Button>
              
              <Button
                onClick={() => setMethod('phone')}
                variant="outline"
                size="lg"
                className="w-full h-14 justify-start gap-3"
              >
                <Phone className="w-5 h-5" />
                Continue with Phone
              </Button>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-slate-500">Or continue with</span>
                </div>
              </div>
              
              <Button
                onClick={() => googleLogin()}
                variant="outline"
                size="lg"
                className="w-full h-14 justify-start gap-3"
                disabled={loading}
              >
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
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/auth/signup')}
                className="text-blue-600 hover:underline font-medium"
              >
                Sign Up
              </button>
            </p>
          </motion.div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
      {/* Header */}
      <div className="px-4 py-4">
        <button
          onClick={() => setMethod(null)}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>
      
      {/* Form */}
      <div className="flex-1 flex flex-col justify-center px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto w-full"
        >
          <h1 className="text-3xl font-bold mb-2">Sign In</h1>
          <p className="text-slate-600 mb-8">
            Enter your credentials to continue
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {method === 'email' ? (
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@example.com"
                  required
                  className="h-12"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  required
                  className="h-12"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                required
                className="h-12"
              />
            </div>
            
            <button
              type="button"
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot password?
            </button>
            
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 mt-6"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
