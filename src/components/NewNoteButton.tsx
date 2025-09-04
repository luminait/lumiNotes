'use client'

import {User} from "@supabase/auth-js";
import {Button} from "@/components/ui/button";
import {Loader2} from "lucide-react";
import {useRouter} from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import {useState} from "react";
import {createNoteAction} from "@/actions/notes";
import {toast} from "sonner";

type Props = {
    user: User | null;
};

const NewNoteButton = ({user} : Props) => {
    const router = useRouter();

    const [loading, setLoading] = useState(false);

    const handleClickNewNoteButton = async () => {
        if (!user) {
            router.push("/login");
        } else {
            setLoading(true);

            const uuid = uuidv4();
            const {errorMessage} = await createNoteAction(uuid);

            if (errorMessage) {
                const msg =
                toast.error(`Error: Could not create note: ${errorMessage}`, {
                    action: {
                        label: "Try again.",
                        onClick: () => {
                            console.log("Try again action");
                        }
                    }
                })
                setLoading(false);
                return;
            }

            router.push(`/?noteId=${uuid}&toastType=newNote`);

            toast.success("New note created", {
                description: "Your new note has been created.",
                action: {
                    label: "Open note",
                    onClick: () => {
                        router.push(`/?noteId=${uuid}`);
                    }
                }
            })

            setLoading(false);
        }
    }
    return (
        <Button
            onClick={handleClickNewNoteButton}
            variant={"secondary"}
            className={"w-24"}
            disabled={loading}
        >
            {loading ? <Loader2 className={"mr-2 h-4 w-4 animate-spin"} /> : "New Note" }
        </Button>
    );
};
export default NewNoteButton;
