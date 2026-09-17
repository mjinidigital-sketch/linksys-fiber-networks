import { buttonVariants } from "@/components/ui/button";
import { ArrowBigLeft } from "lucide-react";
import Link from "next/link";

export default function AuthLayout ({children}: {children: React.ReactNode}) {

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="absolute top-5 left-5 ">
                <Link href="/" className={buttonVariants({variant: "link" , className: "flex text-primary dark:text-secondary"})}>
                <ArrowBigLeft className=" "/>
                Back to Home</Link>
            </div>

            <div className="mx-auto w-full max-w-sm">
                {children}
            </div>
        </div>
    )

}