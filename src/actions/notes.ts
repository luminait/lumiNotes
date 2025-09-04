'use server'

import {getUser} from "@/auth/server";
import {prisma} from "@/db/prisma";
import {handleError} from "@/lib/utils";
import {ChatCompletionMessageParam} from "openai/client";
import openai from "@/openai";

export const updateNoteAction = async (noteId: string, text: string) => {
    try {
        const user = await getUser();
        if (!user) throw new Error("You must be logged in to update a note");

        await prisma.note.update({
            where: {
                id: noteId,
                authorId: user.id,
            },
            data: {
                text
            }
        })

        return {errorMessage: null};
    } catch (error) {
        return handleError(error);
    }
};


export const createNoteAction = async (noteId: string) => {
    try {
        const user = await getUser();
        if (!user) throw new Error("You must be logged in to add a note");

        await prisma.note.create({
            data: {
                id: noteId,
                authorId: user.id,
                text: ""
            }
        });

        return {errorMessage: null};
    } catch (error) {
        return handleError(error);
    }
};

export const deleteNoteAction = async (noteId: string) => {
    try {
        const user = await getUser();
        if (!user) throw new Error("You must be logged in to add a note");

        await prisma.note.delete({
            where: {
                id: noteId,
                authorId: user.id,
            }
        });

        return {errorMessage: null};
    } catch (error) {
        return handleError(error);
    }
};


export const askAIAboutNotesAction = async (questions: string[], responses: string[]) => {
    const user = await getUser();
    if (!user) throw new Error("You must be logged in to ask AI questions.");

    const notes = await prisma.note.findMany({
        where: {authorId: user.id,},
        orderBy: {createdAt: "desc"},
        select: {text: true, createdAt: true, updatedAt: true}
    });

    if (notes.length === 0) {
        console.log("No notes found");
        return "You have no notes. Create a new note to ask AI questions.";
    }


    const formattedNotes = notes.map(
        (note) => {
            return `
            Text: ${note.text}
            Created at: ${note.createdAt}
            Last updated: ${note.updatedAt}
            `.trim()
        }).join("\n\n---\n\n")

    const messages: ChatCompletionMessageParam[] = [
        {
            role: "system",
            content: "You are a helpful assistant. Answer only based on the instructions and context provided."
        },
        {
            role: "developer",
            content: `You are a helpful assistant answering questions strictly about the user's notes.
1. Use only the provided notes as your knowledge source:
2. Format responses in clean, valid HTML. Allowed tags: <p>, <strong>, <em>, <ul>, <ol>, <li>, <h1>-<h6>, <br>.  
3. Do NOT use inline styles, JavaScript, or custom attributes.  
4. If the answer is a single paragraph, you may wrap it in one <p>. Otherwise, structure it with appropriate tags.  
5. If the notes contain no relevant information, return: <p><em>No relevant notes found.</em></p>  
6. Be succinct—avoid verbosity while still being clear.  
7. Output is rendered in JSX as:  <p dangerouslySetInnerHTML={{ __html: YOUR_RESPONSE }} />  
---
Here are the notes ${formattedNotes}`
        }
    ];

    for (let i = 0; i < questions.length; i++) {
        messages.push({role: "user", content: questions[i]})
        if (responses.length > i) {
            messages.push({role: "assistant", content: responses[i]})
        }
    }

    console.log(messages);

    const completion = await openai.chat.completions.create({
        model: "gpt-5-mini",
        messages
    })

    return completion.choices[0].message.content || "A problem occurred. Please try again later.";
};
