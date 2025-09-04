'use client'

import {User} from "@supabase/auth-js";

type Props = {
    user: User | null;
};

const AskAIButton = ({user} : Props) => {
    console.log(user?.email);
    return (
        <div>AskAIButton</div>
    );
};
export default AskAIButton;
