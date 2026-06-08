"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/auth.store";

export function InitAuth() {
  const { loadCurrentUser } = useAuthStore();
  const initRef = useRef(false);

  useEffect(() => {
    if (!initRef.current) {
      loadCurrentUser();
      initRef.current = true;
    }
  }, [loadCurrentUser]);

  return null;
}
