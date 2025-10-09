import { useEffect, useRef } from "react";
import { useCheckSubscriptionQuery } from "@/hooks/useCheckSubscriptionQuery";
import { useInitializeSessionMutation } from "@/hooks/useInitializeSessionMutation";
import { useLoginMutation } from "@/hooks/useLoginMutation";
import { useNillion } from "@/hooks/useNillion";
import { usePersistedConnection } from "@/hooks/usePersistedConnection";
import { useProfile } from "@/hooks/useProfile";
import { useSessionQuery } from "@/hooks/useSessionQuery";
import { Dashboard } from "@/screens/Dashboard";
import { InitializationScreen } from "@/screens/InitializationScreen";
import { LoginScreen } from "@/screens/LoginScreen";

export function MainLayout() {
  const { state } = useNillion();
  const { did, wallets } = state;
  const { hasStoredSession } = usePersistedConnection();
  const { isSuccess: isSessionReady } = useSessionQuery();

  const { mutate: initialize, isPending: isInitializing } = useInitializeSessionMutation();
  const { mutate: login, isPending: isLoggingIn } = useLoginMutation();

  const { isRegistered } = useProfile();
  const { data: subscriptionData } = useCheckSubscriptionQuery();

  const hasTriggeredAuthFlow = useRef(false);

  useEffect(() => {
    const walletsConnected = did && wallets.isKeplrConnected;
    if (walletsConnected && !isSessionReady && !hasTriggeredAuthFlow.current) {
      hasTriggeredAuthFlow.current = true;
      if (hasStoredSession) {
        login();
      } else {
        initialize();
      }
    }
  }, [did, wallets.isKeplrConnected, isSessionReady, hasStoredSession, login, initialize]);

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
