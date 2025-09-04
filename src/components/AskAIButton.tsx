'use client'

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {User} from "@supabase/auth-js";
import {ArrowUpIcon, Stars} from "lucide-react";
import {Fragment, useRef, useState, useTransition} from "react";
import {useRouter} from "next/navigation";
import {Textarea} from "@/components/ui/textarea";
import {askAIAboutNotesAction} from "@/actions/notes";
import "@/styles/ai-response.css"

type Props = {
    user: User | null;
};

const AskAIButton = ({user} : Props) => {
    const router = useRouter();

    const [isPending, startTransition] = useTransition();
    const [open, setOpen] = useState(false);

    // Keep track of the question and responses to pass the conversation to the AI
    const [questionText, setQuestionText] = useState("");
    const [questions, setQuestions] = useState<string[]>([]);
    const [responses, setResponses] = useState<string[]>([]);

    const handleOpenChange = (isOpen:boolean) => {
         if (!user) {
             router.push("/login");
         } else {
             if (isOpen) {
                setQuestionText("");
                setQuestions([]);
                setResponses([]);
             }
             setOpen(isOpen);
         }
    };

    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    // Ensure the text area is always at the bottom of the dialog and can grow as needed.
    const handleInput = () => {
        const textArea = textAreaRef.current;
        if (!textArea) return;

        textArea.style.height = "auto";
        textArea.style.height = `${textArea.scrollHeight}px`;
    }

    // Bring focus to the text area when the dialog is opened or when clicking near the text area.
    const handleClickInput = () => {
        textAreaRef.current?.focus();
    }

    const handleSubmit = (event: React.FormEvent) => {
        if (!questionText.trim()) return;

        const newQuestions = [...questions, questionText];
        setQuestions(newQuestions);
        setQuestionText("");
        setTimeout(scrollToBottom, 100);

        startTransition(async () => {
            const response = await askAIAboutNotesAction(newQuestions, responses);
            setResponses(prevState => ([...prevState, response]));

            setTimeout(scrollToBottom, 100);
        })
    }

    // Scroll to the bottom of the dialog when the question is submitted.
    const scrollToBottom = () => {
        contentRef.current?.scrollTo({
            top: contentRef.current.scrollHeight,
            behavior: "smooth",
        });
    }


    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            scrollToBottom();
            handleSubmit(event);
        }
    }

    return (
        <Dialog
            open={open}
            onOpenChange={handleOpenChange}
        >
            <form>
                <DialogTrigger asChild>
                    <Button variant="secondary"><Stars />Ask AI </Button>
                </DialogTrigger>
                <DialogContent
                    className="custom-scrollbar flex h-[85vh] max-w-4xl flex-col overflow-y-auto"
                    ref={contentRef}
                >
                    <DialogHeader>
                        <DialogTitle>Ask AI About Your Notes</DialogTitle>
                        <DialogDescription>
                            Our AI can answer questions about all of your notes
                        </DialogDescription>
                    </DialogHeader>

                    <div className={"mt-4 flex flex-col gap-8"}>
                        {questions.map((question, index) => (
                            <Fragment key={index}>
                                <p className={"ml-auto max-w-[60%] rounded-md bg-muted px-2 py-1 text-sm text-muted-foreground"}>
                                    {question}
                                </p>
                                {
                                    responses[index] && (
                                        <p
                                            className={"bot-response text-sm text-muted-foreground"}
                                            dangerouslySetInnerHTML={{ __html: responses[index] }}
                                        />
                                    )
                                }
                            </Fragment>
                        ))}
                        {isPending && (<p className={"animate-pulse text-sm"}>Thinking... </p>)}
                    </div>

                    <div
                        className={"mt-auto flex cursor-text flex-col rounded-lg border p-4"}
                        onClick={handleClickInput}
                    >
                        <Textarea
                            ref={textAreaRef}
                            placeholder="Ask me anything about your notes..."
                            value={questionText}
                            onChange={(event) => {
                                setQuestionText(event.target.value);
                                // setQuestions([...questions, event.target.value]);
                            }}
                            onKeyDown={handleKeyDown}
                            onInput={handleInput}
                            className={"resize-none rounded-none border-none bg-transparent p-0 text-sm shadow-none placeholder:text-muted focus-visible:ring-0 focus-visible:ring-offset-0"}
                            style={{
                                minHeight: "0",
                                lineHeight: "normal",
                            }}
                            rows={1}
                        />
                        <Button className={"ml-auto size-8 rounded-full"} type={"submit"} onClick={handleSubmit}>
                            <ArrowUpIcon className={"text-background"} />
                        </Button>
                    </div>

                </DialogContent>
            </form>
        </Dialog>

    );
};
export default AskAIButton;
