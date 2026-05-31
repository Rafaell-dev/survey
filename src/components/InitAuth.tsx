"use client";

import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import { fetchApi } from "@/services/api";

export function InitAuth() {
  const setUser = useStore((state) => state.setUser);
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchApi("/auth/me").then(user => {
        setUser(user);
      }).catch((err) => {
        console.error("Auth failed:", err);
        localStorage.removeItem("token");
        setUser(null);
      });
    }
  }, [setUser]);

  return null;
}
