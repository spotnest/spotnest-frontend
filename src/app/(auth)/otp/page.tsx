import { Suspense } from "react";
import { OtpVerificationForm } from "@/src/modules/auth";

export default function OtpPage() {
  return (
    <Suspense fallback={null}>
      <OtpVerificationForm />
    </Suspense>
  );
}