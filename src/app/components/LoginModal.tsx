import { useState } from 'react';
import { X, Smartphone, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from './ui/input-otp';
import { useAuth } from '../context/AuthContext';

interface LoginModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function LoginModal({ onClose, onSuccess }: LoginModalProps) {
  const { login } = useAuth();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length === 10) {
      setIsLoading(true);
      // Simulate OTP sending
      setTimeout(() => {
        setIsLoading(false);
        setStep('otp');
      }, 1000);
    }
  };

  const handleOTPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      setIsLoading(true);
      // Simulate OTP verification (accept any 6-digit OTP for demo)
      setTimeout(() => {
        setIsLoading(false);
        login(phone);
        onSuccess();
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 space-y-6 bg-white">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {step === 'phone' ? 'Login to Continue' : 'Verify OTP'}
              </h2>
              <p className="text-sm text-gray-600">
                {step === 'phone' 
                  ? 'Enter your mobile number' 
                  : `Sent to +91 ${phone}`}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Phone Number Step */}
        {step === 'phone' && (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Mobile Number
              </label>
              <div className="flex gap-2">
                <div className="w-16 h-11 rounded-lg border border-gray-300 flex items-center justify-center bg-gray-50">
                  <span className="text-sm font-medium text-gray-600">+91</span>
                </div>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="9876543210"
                  className="flex-1 h-11"
                  maxLength={10}
                  autoFocus
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                💡 <strong>Demo Mode:</strong> Enter any 10-digit number. 
                OTP verification will work with any 6-digit code.
              </p>
            </div>

            <Button 
              type="submit"
              disabled={phone.length !== 10 || isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 h-11"
            >
              {isLoading ? 'Sending OTP...' : 'Send OTP'}
            </Button>
          </form>
        )}

        {/* OTP Step */}
        {step === 'otp' && (
          <form onSubmit={handleOTPSubmit} className="space-y-4">
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Enter 6-digit OTP
              </label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                >
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
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Any 6-digit code will work for demo</span>
            </div>

            <div className="space-y-2">
              <Button 
                type="submit"
                disabled={otp.length !== 6 || isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 h-11"
              >
                {isLoading ? 'Verifying...' : 'Verify & Login'}
              </Button>
              
              <Button 
                type="button"
                onClick={() => setStep('phone')}
                variant="outline"
                className="w-full"
              >
                Change Number
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
