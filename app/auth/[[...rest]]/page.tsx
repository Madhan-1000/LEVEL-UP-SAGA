import { redirect } from "next/navigation";

export default function AuthCatchAll() {
  redirect("/auth/sign-in");
}
