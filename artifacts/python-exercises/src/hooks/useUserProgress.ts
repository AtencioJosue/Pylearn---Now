import {
  getGetGamificationStatusQueryKey,
  getGetProgressQueryKey,
  useGetGamificationStatus,
  useGetProgress,
} from "@workspace/api-client-react";
import { useUser } from "@/context/UserContext";

export function useCurrentUserProgress() {
  const { user } = useUser();
  const params = { userId: user?.id ?? "" };

  return useGetProgress(params, {
    query: {
      enabled: Boolean(user),
      queryKey: getGetProgressQueryKey(params),
    },
  });
}

export function useCurrentUserGamification() {
  const { user } = useUser();
  const params = { userId: user?.id ?? "" };

  return useGetGamificationStatus(params, {
    query: {
      enabled: Boolean(user),
      queryKey: getGetGamificationStatusQueryKey(params),
    },
  });
}
