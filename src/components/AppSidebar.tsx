import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup, SidebarGroupLabel,
} from "@/components/ui/sidebar"
import SidebarGroupContent from "@/components/SidebarGroupContent";
import {getUser} from "@/auth/server";
import {Note} from "@/prisma/client";
import {prisma} from "@/db/prisma";
import Link from "next/link";

const AppSidebar = async () => {
    const user = await getUser();

    let notes: Note[] = [];

    if (user) {
        notes = await prisma.note.findMany({
            where: {
                authorId: user.id,
            },
            orderBy: {
                updatedAt: "desc"
            },
        })
    }

    return (
        <Sidebar>
            <SidebarContent className={"custom-scrollbar"}>
                <SidebarGroup>
                    <SidebarGroupLabel className={"my-2 text-lg"}>
                        {
                            user ? "Your Notes" :
                                <Link href={"/login"} className={"underline"}>Login to see your notes</Link>
                        }
                    </SidebarGroupLabel>
                    {
                        user && <SidebarGroupContent notes={notes} />
                    }
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter/>
        </Sidebar>
    )
};

export default AppSidebar;
