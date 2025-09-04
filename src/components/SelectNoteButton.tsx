'use client'
import {Note} from "@/prisma/client";
import {useSearchParams} from "next/navigation";
import useNote from "@/hooks/useNote";
import {useEffect, useState} from "react";
import {SidebarMenuButton} from "@/components/ui/sidebar";
import Link from "next/link";
import {cn} from "@/lib/utils";

type Props = {
    note: Note;
};

const SelectNoteButton = ({note} : Props) => {
    const noteIdParam = useSearchParams().get("noteId");
    const {noteText: selectedNoteText} = useNote();
    const [localNoteText, setLocalNoteText] = useState(note.text);

    const isSelected = noteIdParam === note.id;

    useEffect(() => {
        // When this note is selected, sync its local text state
        // with the global state from the main editor.
        if (isSelected) {
            setLocalNoteText(selectedNoteText);
        }
    }, [isSelected, selectedNoteText]);

    return (
        <SidebarMenuButton
            asChild
            className={cn(
                "items-start gap-0 pr-12 group/item",
                isSelected && "bg-sidebar-accent/50"
            )}
        >
            <Link href={`/?noteId=${note.id}`} className={"flex h-fit flex-col"}>
                <p className={"w-full overflow-hidden truncate text-ellipsis whitespace-nowrap"}>
                    {localNoteText || "EMPTY NOTE"}
                </p>
                <p className={"text-xs text-muted-foreground"}>{note.updatedAt.toLocaleString()}</p>
            </Link>
        </SidebarMenuButton>
    );
};
export default SelectNoteButton;
