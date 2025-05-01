"use client";
import React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  UserButton,
  SignedIn,
  SignInButton,
  SignUpButton,
  SignedOut,
} from "@clerk/nextjs";
import Image from "next/image";

import { ModeToggle } from "@/components/ui/mode-toggle";

export const NavbarUI = () => {
  const pathname = usePathname();

  return (
    <div>
      <div className=" border-b relative flex items-center justify-between">
        <Link href="/" className=" mx-8 py-4 text-3xl font-extrabold">
          <Image src="/explain_ai_logo.png" width={45} height={45} alt="logo" />
        </Link>
        <div className="flex items-center gap-4 mx-4 ">
          <ModeToggle />
          <div>
            <SignedOut>
              <div className="flex space-x-4">
                <div className="border border-gray-300 rounded-md p-2 hover:bg-gray-500 cursor-pointer">
                  <SignInButton />
                </div>
                <div className="border border-gray-300 rounded-md p-2 hover:bg-gray-500 cursor-pointer">
                  <SignUpButton />
                </div>
              </div>
            </SignedOut>
            <SignedIn>
              <div className="mt-2">
                <UserButton />
              </div>
            </SignedIn>
          </div>
        </div>
      </div>
    </div>
  );
};
