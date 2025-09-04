'use client'

import {useSearchParams} from "next/navigation";
import {Textarea} from "@/components/ui/textarea";
import {ChangeEvent, useEffect} from "react";
import {debounceTimeout} from "@/lib/constants";
import useNote from "@/hooks/useNote";
import {updateNoteAction} from "@/actions/notes";

type Props = {
    noteId: string;
    startingNoteText: string;
};

let updateTimeout: NodeJS.Timeout;

const NoteTextInput = ({noteId, startingNoteText} : Props) => {
    const noteIdParam = useSearchParams().get("noteId") || "";
    const {noteText, setNoteText} = useNote();

    useEffect(() => {
        if (noteIdParam === noteId) {
            setNoteText(startingNoteText);
        }
    }, [ startingNoteText, noteIdParam, noteId, setNoteText])

    const handleUpdateNote = (event: ChangeEvent<HTMLTextAreaElement>) => {
        const text = event.target.value;

        setNoteText(text);

        clearTimeout(updateTimeout);
        updateTimeout = setTimeout(() => {
            updateNoteAction(noteId, text);
        }, debounceTimeout);

    }

    return (
        <Textarea
            value={noteText}
            onChange={handleUpdateNote}
            placeholder={"Start typing your notes here..."}
            className={"custom-scrollbar mb-4 h-full max-w-full resize-none border p-4 placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"}
        />
    );
};

export default NoteTextInput;
