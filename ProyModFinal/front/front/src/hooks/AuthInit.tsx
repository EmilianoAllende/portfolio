import { useRef, useEffect } from "react";
import { useAuthStore } from "../stores/authStore";
import { usePathname } from "next/navigation";

const PUBLIC_PATHS = ["/login", "/registerclient", "/loginclient"];

export const useAuthInit = () => {
  const hasRun = useRef(false);

  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const setInitialized = useAuthStore((s) => s.setInitialized);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  const pathname = usePathname();

  useEffect(() => {
    if (hasRun.current || isInitialized || loading) return;
    hasRun.current = true;

    const isPublic = PUBLIC_PATHS.some((r) => pathname.startsWith(r));

    if (!isPublic && !user) {
      fetchUser().finally(() => {
        setInitialized(true);
      });
    } else {
      setInitialized(true);
    }
  }, [pathname, user, loading, isInitialized, fetchUser, setInitialized]);

  return null;
};