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

    function handleDeleteNote() {
        if (note) {
            deleteNoteLocally(noteId);
        }
        route.push(
            `/?toastType=deleteNote&noteId=${noteId}`
        )
        startTransition(async () => {
            const {errorMessage} = await deleteNoteAction(noteId);

            if (!errorMessage) {
                toast.success("Note deleted successfully", {
                    action: {
                        label: "Undo",
                        onClick: () => {
                            createNoteAction(noteId).then((note) => {
                                updateNoteAction(noteId, noteText)
                            });
                        }
                    }
                })

                deleteNoteLocally(noteId);

                if (noteIdParam === noteId) {
                    route.replace("/");
                }
            } else {
                toast.error(errorMessage);
            }
        })
    }

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
