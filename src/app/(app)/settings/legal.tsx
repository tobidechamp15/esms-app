import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackHeader } from '@/components/ui';

export default function LegalScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <BackHeader title="Legal & Privacy" />
      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        <Section title="Terms of Use">
          {`By using this application, you agree to comply with these Terms of Use.\n\nThis application is designed to help residents manage visitor access within their estate. Access to the application is limited to verified residents and authorized users.\n\nUsers are responsible for maintaining the security of their account, phone number, and PIN. Any activity carried out through a user's account will be considered authorized by that user.\n\nResidents are solely responsible for all visitor access codes generated through their account. Access codes should only be shared with intended visitors and must not be distributed to unauthorized persons.\n\nEstate management reserves the right to suspend, restrict, or revoke access to any account found to be in violation of estate rules or these Terms of Use.`}
        </Section>

        <Section title="Privacy Policy">
          {`Your privacy is important to us.\n\nTo provide estate access and visitor management services, we may collect information including your name, phone number, house or unit details, visitor information, and records of visitor access activities.\n\nThe information collected is used to:\n• Create and manage your account\n• Generate visitor access codes\n• Improve estate security operations\n• Send important notifications and updates\n• Maintain visitor and access records\n\nInformation may be shared with authorized estate management personnel and security officers only where necessary for estate operations and security purposes.\n\nWe take reasonable measures to protect your information from unauthorized access, loss, misuse, or disclosure.\n\nWe do not sell or rent your personal information to third parties.`}
        </Section>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: string }) {
  return (
    <View className="mb-6 bg-surface rounded-2xl p-4 border border-border">
      <Text className="text-base font-bold text-navy mb-3">{title}</Text>
      <Text className="text-sm text-muted leading-6">{children}</Text>
    </View>
  );
}
