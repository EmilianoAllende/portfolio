"use client";

import Link from "next/link";
import Image from "next/image";
import welcome from "@/../public/WELCOME.jpg";

export default function Landing() {
  return (
    <div className="flex">
      <div className="mx-auto items-center relative">
        <h1 className="bg-secondaryColor mx-auto p-2 w-fit text-cyan-400 font-bold text-4xl md:text-7xl rounded-3xl">WELCOME</h1>
        <div>
          <Image src={welcome} alt={"WELCOME.img"} width={1600} height={900} className="w-[17em] md:w-[30em]"></Image>
        </div>

        <div className="absolute bottom-2 self-center">
          <Link href={"/home"} className="bg-primaryColor text-quaternaryColor rounded-2xl px-2 text-2xl md:text-4xl font-bold">
                LET&apos;S START!
          </Link>
        </div>

      </div>
    </div>
  );
};