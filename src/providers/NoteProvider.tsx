'use client'

import noteTextInput from "@/components/NoteTextInput";
import {createContext, useState} from "react";

type NoteProviderContextType = {
    noteText: string;
    setNoteText: (noteText: string) => void;
}

export const NoteProviderContext = createContext<NoteProviderContextType>({
    noteText: "",
    setNoteText: () => {}
});

const NoteProvider = ({children}: {children: React.ReactNode}) => {

    const [noteText, setNoteText] = useState("");

    return (
        <NoteProviderContext.Provider value={{noteText, setNoteText}}>
            {children}
        </NoteProviderContext.Provider>
    );
};
export default NoteProvider;
