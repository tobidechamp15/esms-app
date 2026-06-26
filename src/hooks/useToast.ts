// ventry_app/src/hooks/useToast.ts
import { useCallback, useState } from "react";
import { Platform, ToastAndroid } from "react-native";

export function useToast() {
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(message, ToastAndroid.SHORT);   // Android: native toast
    } else {
      setToast(message);                                 // iOS: custom overlay
      setTimeout(() => setToast(null), 2000);
    }
  }, []);

  return { toast, showToast };
}