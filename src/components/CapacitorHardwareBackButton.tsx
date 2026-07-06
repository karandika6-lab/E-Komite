"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { App } from "@capacitor/app";

export function CapacitorHardwareBackButton() {
  const router = useRouter();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    let isListenerActive = false;
    let removeListenerFn: any = null;

    const setupListener = async () => {
      try {
        const listener = await App.addListener("backButton", () => {
          const currentPath = pathnameRef.current;
          // If we are on the root, login, or main dashboard, exit the app
          if (currentPath === "/" || currentPath === "/login" || currentPath === "/dashboard") {
            App.exitApp();
          } else {
            // Otherwise, just go back
            router.back();
          }
        });
        
        removeListenerFn = listener;
        isListenerActive = true;
      } catch (e) {
        // Not running in a Capacitor environment (e.g., normal web browser)
        // We can safely ignore this
      }
    };

    setupListener();

    return () => {
      if (isListenerActive && removeListenerFn) {
        removeListenerFn.remove();
      }
    };
  }, [router]);

  return null;
}
