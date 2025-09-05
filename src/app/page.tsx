import {getUser} from "@/auth/server";
import {prisma} from "@/db/prisma";
import AskAIButton from "@/components/AskAIButton";
import NewNoteButton from "@/components/NewNoteButton";
import NoteTextInput from "@/components/NoteTextInput";

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

const HomePage = async ({searchParams}: Props) => {
    const noteIdParam = (await searchParams).noteId;
    const user = await getUser();

    const noteId = Array.isArray(noteIdParam)
        ? noteIdParam![0]
        : noteIdParam || "";

    // Only query the database when we have both a user and a concrete noteId
    let note: { text: string } | null = null;
    if (user && noteId) {
        note = await prisma.note.findUnique({
            where: {
                id: noteId,
                authorId: user.id,
            }
        });
    }

    return (
        <div className={"flex h-full flex-col items-center gap-4"}>
            <div className={"flex w-full gap-4 justify-end"}>
                <AskAIButton user={user}/>
                <NewNoteButton user={user}/>
            </div>

            <NoteTextInput noteId={noteId} startingNoteText={note?.text || ""} />
        </div>

    );
};
export default HomePage;
