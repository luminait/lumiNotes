import Link from "next/link";
import Image from "next/image";
import {shadow} from "@/styles/utils";
import {Button} from "@/components/ui/button";
import DarkModeToggle from "@/components/DarkModeToggle";
import LogOutButton from "@/components/LogOutButton";
import {getUser} from "@/auth/server";
import {SidebarTrigger} from "@/components/ui/sidebar";

const Header = async () => {
    const user = await getUser();
    return (
        <header className={"relative flex h-24 w-full items-center justify-between bg-popover px-3  sm:px-8"}
                style={{
                    boxShadow: shadow
                }}
        >
            <SidebarTrigger className={"absolute left-1 top-1"}/>
            <Link
                href="/"
                className={"flex items-center gap-2"}>
                <Image
                    src="/logo-circle.png"
                    alt="logo"
                    width={68}
                    height={68}
                />
                <h1 className={"text-2xl font-medium text-primary"}>lumi<span
                    className={"font-bold light:text-primary dark:text-luminait-primary"}>Notes</span></h1>
            </Link>

            <div className={"flex items-center gap-4 text-primary"}>
                <DarkModeToggle/>
                {user ? (
                    <LogOutButton />
                ) : (
                    <>
                        <Button asChild>
                            <Link href={"/sign-up"} className={"hidden sm:block"}>Sign up</Link>
                        </Button>
                        <Button variant={"outline"} asChild>
                            <Link href={"/login"}>Login</Link>
                        </Button>
                    </>
                )
                }
            </div>
        </header>
    );
};
export default Header;
