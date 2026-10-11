import { Suspense } from "react";
import { LoginForm } from "@/src/modules/auth";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}