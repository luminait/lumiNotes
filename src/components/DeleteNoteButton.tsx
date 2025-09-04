'use client'


import {Button} from "@/components/ui/button";
import {Note} from "@/app/generated/prisma";
import {
    AlertDialog, AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {Loader2, Trash2, Trash2Icon, TrashIcon} from "lucide-react";
import {useTransition} from "react";
import {createNoteAction, deleteNoteAction, updateNoteAction} from "@/actions/notes";
import {useRouter, useSearchParams} from "next/navigation";
import {toast} from "sonner";

type Props = {
    note: Note;
    deleteNoteLocally: (noteId: string) => void;
};

const DeleteNoteButton = ({note, deleteNoteLocally}: Props) => {
    const noteId = note.id;
    const noteText = note.text;
    const route = useRouter();
    const noteIdParam = useSearchParams().get("noteId") || "";

    const [isPending, startTransition] = useTransition();

    const handleDeleteNote = () => {
        startTransition(async () => {
            // 1. Optimistically update the UI by removing the note.
            deleteNoteLocally(noteId);

            // 2. If the deleted note was the one being viewed, navigate away.
            if (noteIdParam === noteId) {
                // Using replace so the user can't navigate "back" to the deleted note.
                route.replace("/");
            }

            // 3. Call the server action to delete from the database.
            const {errorMessage} = await deleteNoteAction(noteId);

            // 4. Handle the result.
            if (!errorMessage) {
                // If successful, show a toast with an "Undo" action.
                toast.success("Note deleted successfully", {
                    action: {
                        label: "Undo",
                        onClick: async () => {
                            // Restore the note in the DB. This assumes the actions work
                            // as intended (recreate with ID, then update with text).
                            await createNoteAction(noteId);
                            await updateNoteAction(noteId, noteText);

                            // This is the missing piece: refresh server data to update the UI.
                            route.refresh();
                            toast.info("Note restored.");
                        }
                    }
                });
            } else {
                // If the delete failed, show an error and revert the optimistic UI update
                // by refreshing the data from the source of truth (the DB).
                toast.error(errorMessage);
                route.refresh();
            }
        });
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant={'ghost'}
                    className={"absolute right-2 top-1/2  -translate-y-1/2 size-7 p-0 opacity-0 group-hover/item:opacity-100 [&_svg]:size-3"}
                >
                    <Trash2/>
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to delete this note?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        note from our servers..
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteNote}
                        className={"bg-destructive text-destructive-foreground"}>
                        {isPending ? <Loader2 className={"animate-spin"} /> : "Delete" }
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
export default DeleteNoteButton;
