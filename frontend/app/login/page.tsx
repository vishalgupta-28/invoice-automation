"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!identifier.trim() || !password.trim()) {
      setError("Please enter username/email and password.");
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 350));
    router.push("/dashboard");
  };

  return (
    <section className="min-h-screen w-full overflow-hidden bg-[#f2f3f7] text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">
        <div className="flex items-center justify-center px-6 py-10 md:px-12">
          <div className="w-full max-w-md">
            <h1 className="text-4xl font-semibold tracking-tight text-[#0d1d4f] md:text-5xl">Welcome back</h1>
            <p className="mt-2 text-3xl text-slate-600">Log in to your account</p>

            <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-900/10">
              <h2 className="text-4xl font-semibold text-slate-900">Login</h2>

              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label className="text-xl text-slate-700" htmlFor="identifier">
                    Username or Email
                  </Label>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <Input
                      autoComplete="username"
                      className="h-12 rounded-lg border-slate-300 bg-slate-50 pl-11 text-base"
                      id="identifier"
                      onChange={(event) => setIdentifier(event.target.value)}
                      placeholder="Enter your username or email"
                      value={identifier}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xl text-slate-700" htmlFor="password">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <Input
                      autoComplete="current-password"
                      className="h-12 rounded-lg border-slate-300 bg-slate-50 pl-11 pr-11 text-base"
                      id="password"
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="********"
                      type={showPassword ? "text" : "password"}
                      value={password}
                    />
                    <button
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-700"
                      onClick={() => setShowPassword((prev) => !prev)}
                      type="button"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <div className="flex justify-end">
                    <button className="text-sm text-[#2a7e93] hover:underline" type="button">
                      Forgot password?
                    </button>
                  </div>
                </div>

                {error ? <p className="text-sm text-red-600">{error}</p> : null}

                <Button
                  className="h-12 w-full rounded-full bg-[#0e92a8] text-base font-semibold uppercase tracking-wide hover:bg-[#0b7c8f]"
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? "Signing in..." : "Log in"}
                </Button>
              </form>

              <p className="mt-7 text-center text-lg text-slate-500">
                Sign up now
              </p>
            </div>

            <p className="mt-5 text-center text-sm text-slate-500">
              Need overview first?{" "}
              <Link className="font-medium text-slate-700 underline-offset-4 hover:underline" href="/landing">
                Vishal Gupta
              </Link>
            </p>
          </div>
        </div>

        <div className="relative hidden min-h-screen overflow-hidden bg-[#0b1b49] lg:block">
          <Image
            alt="Login visual"
            className="h-full w-full object-cover"
            fill
            priority
            src="/images/login.png"
            style={{
              objectPosition: "right 38%",
              transform: "scale(1.18)",
              transformOrigin: "right center"
            }}
          />
          <div className="absolute inset-0 bg-black/10" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-44 w-44 bg-gradient-to-tl from-[#0b1b49] via-[#0b1b49]/95 to-transparent" />
        </div>
      </div>
    </section>
  );
}
