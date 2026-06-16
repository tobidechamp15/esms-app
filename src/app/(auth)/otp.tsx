import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { sendOtp, verifyOtp } from '@/api/auth';
import { BackHeader, Button, NumPad, PinDots } from '@/components/ui';

const OTP_LENGTH = 6;

export default function OtpScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');

  function handleDigit(d: string) {
    if (otp.length >= OTP_LENGTH) return;
    setOtp((p) => p + d);
    setError('');
  }

  function handleDelete() {
    setOtp((p) => p.slice(0, -1));
    setError('');
  }

  async function handleVerify() {
    if (otp.length < OTP_LENGTH) return;
    setLoading(true);
    try {
      const result = await verifyOtp(phone, otp);
      if (result.isExistingUser) {
        // Existing user — go to login flow with OTP token already saved
        router.replace('/(app)/home');
      } else {
        // New user — complete profile
        router.push({ pathname: '/(auth)/complete-profile', params: { phone } });
      }
    } catch {
      setError('Invalid or expired OTP code.');
      setOtp('');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    try {
      await sendOtp(phone);
      setError('');
      setOtp('');
    } catch {
      setError('Could not resend OTP. Try again.');
    } finally {
      setResending(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <BackHeader title="Create Account" />

      <View className="flex-1 px-6 pt-8">
        <Text className="text-2xl font-bold text-navy mb-1">
          Verify Your Number
        </Text>
        <Text className="text-sm text-muted mb-10">
          Enter the 6-digit code sent to{' '}
          <Text className="text-primary-500 font-medium">{phone}</Text>
        </Text>

        <PinDots length={OTP_LENGTH} filled={otp.length} error={Boolean(error)} />
        {error ? (
          <Text className="text-danger text-sm mt-4">{error}</Text>
        ) : null}
      </View>

      <View className="px-6 pb-6 gap-4">
        <Button
          label="Verify Code"
          onPress={handleVerify}
          disabled={otp.length < OTP_LENGTH}
          loading={loading}
        />
        <View className="flex-row justify-center items-center">
          <Text className="text-sm text-muted">Didn't receive a code? </Text>
          <Text
            onPress={!resending ? handleResend : undefined}
            className={`text-sm font-semibold ${resending ? 'text-muted' : 'text-primary-500'}`}
          >
            {resending ? 'Sending...' : 'Resend'}
          </Text>
        </View>
        <NumPad onPress={handleDigit} onDelete={handleDelete} />
      </View>
    </SafeAreaView>
  );
}
