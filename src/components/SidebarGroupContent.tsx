'use client'

import {Note} from "../app/generated/prisma";
import {SidebarGroupContent as SidebarGroupContentShadCN, SidebarMenu, SidebarMenuItem} from "@/components/ui/sidebar";
import {SearchIcon} from "lucide-react";
import {Input} from "@/components/ui/input";
import {useEffect, useMemo, useState} from "react";
import Fuse from "fuse.js";
import SelectNoteButton from "@/components/SelectNoteButton";
import DeleteNoteButton from "@/components/DeleteNoteButton";

type Props = {
    notes: Note[];
}

const SidebarGroupContent = ({notes}: Props) => {
    console.log(notes);
    const [searchText, setSearchText] = useState("");
    const [localNotes, setLocalNotes] = useState(notes);

    useEffect(() => {
        setLocalNotes(notes);
    }, [notes]);

    const fuse = useMemo(() => {
        return new Fuse(localNotes, {
            keys: ["title"],
            threshold: 0.4,
        });
    }, [localNotes]);

    const filteredNotes = searchText ? fuse.search(searchText).map((result) => result.item) : localNotes;

    const deleteNoteLocally = (noteId: string) => {
        setLocalNotes(localNotes.filter((note) => note.id !== noteId));
    }

    return (
        <SidebarGroupContentShadCN>
            <div className={"relative flex items-center"}>
                <SearchIcon className={"absolute left-2 size-2 "}/>
                <Input
                    className={"bg-muted pl-8"}
                    placeholder={"Search notes..."}
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                />
            </div>
            <SidebarMenu className={"mt-4"}>
                {
                    filteredNotes.map((note) => (
                        <SidebarMenuItem key={note.id} className={"group/item"}>
                            <SelectNoteButton note={note} />
                            <DeleteNoteButton
                                note={note}
                                deleteNoteLocally={deleteNoteLocally}
                            />
                        </SidebarMenuItem>)
                    )
                }
            </SidebarMenu>
        </SidebarGroupContentShadCN>
    );
};
export default SidebarGroupContent;
