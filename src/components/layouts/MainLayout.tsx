import { useCheckSubscriptionQuery } from "@/hooks/useCheckSubscriptionQuery";
import { useInitializeSessionMutation } from "@/hooks/useInitializeSessionMutation";
import { useLoginMutation } from "@/hooks/useLoginMutation";
import { useNillion } from "@/hooks/useNillion";
import { useProfile } from "@/hooks/useProfile";
import { useSessionQuery } from "@/hooks/useSessionQuery";
import { Dashboard } from "@/screens/Dashboard";
import { InitializationScreen } from "@/screens/InitializationScreen";
import { LoginScreen } from "@/screens/LoginScreen";

export function MainLayout() {
  const { state } = useNillion();
  const { did, wallets } = state;
  const { isSuccess: isSessionReady } = useSessionQuery();

  const { isPending: isInitializing } = useInitializeSessionMutation();
  const { isPending: isLoggingIn } = useLoginMutation();

  const { isRegistered } = useProfile();
  const { data: subscriptionData } = useCheckSubscriptionQuery();

  // 1. Wallets not connected, show login screen
  if (!did || !wallets.isKeplrConnected) {
    return <LoginScreen />;
  }

  // 2. Wallets connected, but session is being established
  if (isInitializing || isLoggingIn) {
    return <InitializationScreen />;
  }

  // 3. Session is ready, but user profile/subscription might still be loading or missing
  if (isSessionReady && (!isRegistered || !subscriptionData?.subscribed)) {
    return <InitializationScreen />;
  }

  // 4. Fully ready
  if (isSessionReady && isRegistered && subscriptionData?.subscribed) {
    return <Dashboard />;
  }

  // Fallback/Default case while queries are in flight
  return <InitializationScreen />;
}
