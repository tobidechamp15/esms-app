import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ImageBackground, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getEstateInfo, verifyEstatePin } from '@/api/auth';
import { BackHeader, Button, NumPad, PinDots } from '@/components/ui';
import { ESTATE_NAME, STORAGE_KEYS } from '@/constants/api';
import type { EstateInfo } from '@/types';

const PIN_LENGTH = 6;

export default function EstatePinScreen() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);
  const [estateInfo, setEstateInfo] = useState<EstateInfo | null>(null);

  function handleDigit(d: string) {
    if (pin.length >= PIN_LENGTH) return;
    setPin((p) => p + d);
    setError('');
  }

  function handleDelete() {
    setPin((p) => p.slice(0, -1));
    setError('');
  }

  async function handleConfirm() {
    if (pin.length < PIN_LENGTH) return;
    setLoading(true);
    try {
      const info = await verifyEstatePin(pin);
      await SecureStore.setItemAsync(STORAGE_KEYS.ESTATE_PIN_VERIFIED, 'true');
      setEstateInfo(info);
      setVerified(true);
    } catch {
      setError("Invalid estate PIN. Confirm you're using the correct app.");
      setPin('');
    } finally {
      setLoading(false);
    }
  }
  const [estate, setEstate] = useState<EstateInfo | null>(null);

  useEffect(() => {
    getEstateInfo()
      .then(setEstate)
      .catch(() => {});
  }, []);

  const estateName = estate?.estateName ?? ESTATE_NAME;

  // ── Step 2: PIN verified → Login or Create Account ───────────────────────────
  if (verified && estateInfo) {
    return (
      <View className="flex-1 bg-navy">
           <ImageBackground
             source={require("../../../assets/estate-bg.jpg")}
             className="flex-1"
             resizeMode="cover"
           >
             <View className="flex-1 bg-navy/50">
               {/* // Inside your component, add this row at the bottom before logout: */}
               {__DEV__ && (
                 <Pressable
                   onPress={async () => {
                     await SecureStore.deleteItemAsync(
                       STORAGE_KEYS.ESTATE_PIN_VERIFIED,
                     );
                     router.replace("/(auth)/welcome");
                   }}
                   className="px-6 py-4 border-b border-border bg-white mt-[120px]"
                 >
                   <Text className="text-orange-500 font-medium">
                     [DEV] Reset Estate PIN
                   </Text>
                 </Pressable>
               )}
               <SafeAreaView className="flex-1 justify-end pb-8 px-6">
                 <View className="mb-10">
                   <Text className="text-4xl font-bold text-white mb-4">
                     <Text className="text-primary-400">v</Text>entry
                   </Text>
                   <Text className="text-2xl font-bold text-white mb-3">
                     Welcome to {estateName}
                   </Text>
                   <Text className="text-base text-white/70 leading-6">
                     Manage visitors, generate access codes, and enjoy seamless entry
                     into your estate.
                   </Text>
                 </View>
     
                 <View className="flex-row gap-3">
                   <View
                     onTouchEnd={() => router.push("/(auth)/login")}
                     className="flex-1 h-14 bg-white/10 border border-white/20 rounded-2xl items-center justify-center"
                   >
                     <Text className="text-white text-base font-semibold">
                       Login
                     </Text>
                   </View>
                   <View
                     onTouchEnd={() => router.push("/(auth)/phone")}
                     className="flex-1 h-14 bg-primary-500 rounded-2xl items-center justify-center"
                   >
                     <Text className="text-white text-base font-semibold">
                       Create Account
                     </Text>
                   </View>
                 </View>
               </SafeAreaView>
             </View>
           </ImageBackground>
         </View>
    );
  }

  // ── Step 1: Enter estate PIN ──────────────────────────────────────────────────
  return (
    <SafeAreaView className="flex-1 bg-white">
      <BackHeader title="Estate PIN" onBack={() => router.back()} />

      <View className="flex-1 px-6 pt-8">
        <Text className="text-2xl font-bold text-navy mb-1">
          Type in your 6-digit PIN!
        </Text>
        <Text
          className={`text-sm mb-10 ${error ? 'text-danger' : 'text-muted'}`}
        >
          {error || 'Enter the PIN provided by your estate management.'}
        </Text>

        <PinDots
          length={PIN_LENGTH}
          filled={pin.length}
          error={Boolean(error)}
        />
      </View>

      <View className="px-6 pb-6 gap-4">
        <Button
          label="Confirm Estate PIN"
          onPress={handleConfirm}
          disabled={pin.length < PIN_LENGTH}
          loading={loading}
        />
        <NumPad onPress={handleDigit} onDelete={handleDelete} />
      </View>
    </SafeAreaView>
  );
}