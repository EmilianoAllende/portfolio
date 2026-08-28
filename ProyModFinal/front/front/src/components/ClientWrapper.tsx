"use client";

import { useAuthInit } from "../hooks/AuthInit";

export default function ClientWrapper() {
  useAuthInit();
  return null;
}