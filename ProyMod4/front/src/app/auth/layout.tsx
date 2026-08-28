import Image from "next/image";
import hiRob from "@/../public/greeting.jpg"

export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
            <div className="mx-auto">
                <div className="flex flex-row items-center">
                    <div className="w-1/2 justify-items-end ">
                        <h1 className="justify-self-center bg-primaryColor text-tertiaryColor rounded-3xl font-extrabold text-4xl px-6">{"Hi User!"}</h1>
                        <Image src={hiRob} alt="greetingRobot" width={600} className="rounded-xl"/>
                    </div>

                    <div className="w-1/2 flex items-center justify-center">
                        {children}
                    </div>
                </div>
            </div>
    );
};