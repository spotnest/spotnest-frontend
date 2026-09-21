import { Suspense } from "react";
import { ResetPasswordForm } from "@/src/modules/auth";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}