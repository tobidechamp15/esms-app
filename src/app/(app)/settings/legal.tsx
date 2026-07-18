import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BackHeader } from "@/components/ui";
import { useAuthStore } from "@/store/authStore";

export default function LegalScreen() {
  const user = useAuthStore((s) => s.user);
  const isSecurity = user?.role === "security" || user?.role === "admin";
  return (
    <SafeAreaView className="flex-1 bg-white">
      <BackHeader title="Legal & Privacy" />
      <ScrollView
        className="flex-1 px-6 pt-6"
        showsVerticalScrollIndicator={false}
      >
        {!isSecurity && (
          <Section title="Terms of Use">
            {`By using this application, you agree to comply with these Terms of Use.\n\nThis application is designed to help residents manage visitor access within their estate. Access to the application is limited to verified residents and authorized users.\n\nUsers are responsible for maintaining the security of their account, phone number, and PIN. Any activity carried out through a user's account will be considered authorized by that user.\n\nResidents are solely responsible for all visitor access codes generated through their account. Access codes should only be shared with intended visitors and must not be distributed to unauthorized persons.\n\nEstate management reserves the right to suspend, restrict, or revoke access to any account found to be in violation of estate rules or these Terms of Use.`}
          </Section>
        )}
        {isSecurity && (
          <Section title="Terms of Use">
            {`By using this application, you agree to comply with these Terms of Use.\n\nThis application is designed to support estate security and visitor management. Access is restricted to verified residents and authorized security personnel only.\n\nYou are responsible for maintaining the security of your account, including your phone number, PIN, and login credentials. Any activity carried out through your account will be considered authorized by you.\n\nResidents are fully responsible for all visitor access codes generated through their account. Access codes must only be shared with intended visitors and must not be distributed to unauthorized individuals.\n\nEstate management reserves the right to suspend, restrict, or revoke access to any account found to be in violation of estate rules or these Terms of Use.\n\nThe application may be updated, modified, or temporarily unavailable due to maintenance, security, or operational requirements.\n\nWhile we aim to provide reliable service, we do not guarantee uninterrupted access or error-free operation.\n\nBy continuing to use the application, you acknowledge and accept these Terms of Use.`}
          </Section>
        )}
        {!isSecurity && (
          <Section title="Privacy Policy">
            {`Your privacy is important to us.\n\nTo provide estate access and visitor management services, we may collect information including your name, phone number, house or unit details, visitor information, and records of visitor access activities.\n\nThe information collected is used to:\n• Create and manage your account\n• Generate visitor access codes\n• Improve estate security operations\n• Send important notifications and updates\n• Maintain visitor and access records\n\nInformation may be shared with authorized estate management personnel and security officers only where necessary for estate operations and security purposes.\n\nWe take reasonable measures to protect your information from unauthorized access, loss, misuse, or disclosure.\n\nWe do not sell or rent your personal information to third parties.`}
          </Section>
        )}
        {isSecurity && (
          <Section title="Privacy Policy">
            {`Your privacy is important to us.\n\nTo provide estate security and visitor management services, we may collect personal information such as your name, phone number, unit details, visitor information, and records of access activity.\n\nWe use this information to:\n• Create and manage user accounts\n• Generate visitor access codes.\n• Support estate security operations\n• Send important notifications and updates\n• Maintain access and visitor records\n\nYour information may be shared with authorized estate management and security personnel only when necessary for estate operations and safety.\n\nWe take reasonable measures to protect your data against unauthorized access, loss, misuse, or disclosure.\n\nWe do not sell or rent your personal information to third parties.\n\nBy using this application, you consent to the collection and use of your information as described in this Privacy Policy.\n\nWe may update this Privacy Policy from time to time. Continued use of the application after changes means you accept the updated version.\n\nFor any questions regarding privacy or data handling, please contact your estate management team.`}
          </Section>
        )}

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
