'use client'

import {Button} from "@/components/ui/button";
import {Loader2} from "lucide-react";
import {useState} from "react";
import { toast } from "sonner"
import {useRouter} from "next/navigation";
import {logOutAction} from "@/actions/users";

const LogOutButton = () => {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogout = async () => {
        setLoading(true);

        const {errorMessage} = await logOutAction();

        if (!errorMessage) {
            toast.success("Logged out successfully", {
                description: "You have been successfully logged out.",
                action: {
                    label: "Undo",
                    onClick: () => {
                        console.log("Undo action");
                    }
                }
            });
            router.push("/login");
        } else {
            toast.error("Error logging out", {
                description: errorMessage,
                action: {
                    label: "Try again",
                    onClick: () => {
                        console.log("Try again action");
                    }
                }
            });
        }

        setLoading(false);

    };
    return (
        <Button
            variant={"outline"}
            onClick={handleLogout}
            disabled={loading}
            className={"w-24"}
        >
            {loading ? <Loader2 className={"mr-2 h-4 w-4 animate-spin"} /> : "Log Out" }
        </Button>
    );
};
export default LogOutButton;
