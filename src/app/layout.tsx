import type {Metadata} from "next";
import "@/styles/globals.css";
import {ThemeProvider} from "@/providers/ThemeProvider";
import {Toaster} from "@/components/ui/sonner";
import Header from "@/components/Header";
import {SidebarProvider} from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import NoteProvider from "@/providers/NoteProvider";


export const metadata: Metadata = {
    title: "lumiNotes",
    description: "Your notes, but smarter.",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body
            className={``}
        >

        <ThemeProvider
            attribute={"class"}
            defaultTheme={"system"}
            enableSystem
            disableTransitionOnChange
        >
            <NoteProvider>
                <SidebarProvider>
                    <AppSidebar/>
                    <div className={"flex min-h-screen flex-col justify-between w-full"}>
                        <Header/>
                        <main className={"flex flex-1 flex-col px-4 pt-10 xl:px-8"}>
                            {children}
                        </main>
                    </div>
                </SidebarProvider>
                <Toaster/>
            </NoteProvider>
        </ThemeProvider>
        </body>
        </html>
    );
}
