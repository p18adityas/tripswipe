import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Mail, Phone, Chrome } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useUserStore } from '../store/userStore';
import { toast } from 'sonner';

export function SignUp() {
  const navigate = useNavigate();
  const { signUp } = useUserStore();
  const [method, setMethod] = useState<'email' | 'phone' | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signUp(formData.email || formData.phone, formData.password, formData.name);
      toast.success('Account created successfully!');
      navigate('/auth/profile-setup');
    } catch (error: any) {
      const msg = error?.message || 'Failed to create account';
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
            <h1 className="text-3xl font-bold mb-2 text-center">Create Account</h1>
            <p className="text-slate-600 text-center mb-8">
              Choose how you'd like to sign up
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
                onClick={() => toast.info('Social login demo - not implemented')}
                variant="outline"
                size="lg"
                className="w-full h-14 justify-start gap-3"
              >
                <Chrome className="w-5 h-5" />
                Continue with Google
              </Button>
              
              <Button
                onClick={() => toast.info('Social login demo - not implemented')}
                variant="outline"
                size="lg"
                className="w-full h-14 justify-start gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                Continue with Apple
              </Button>
            </div>
            
            <p className="text-center text-sm text-slate-600 mt-8">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/auth/signin')}
                className="text-blue-600 hover:underline font-medium"
              >
                Sign In
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
          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-slate-600 mb-8">
            Enter your details to get started
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                required
                className="h-12"
              />
            </div>
            
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
            
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 mt-6"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Continue'}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
