'use client'

import {useRouter} from "next/navigation";
import {CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import Link from "next/link";
import {Label} from "@/components/ui/label";
import {useTransition} from "react";
import {Loader2} from "lucide-react";
import {toast} from "sonner"
import {loginAction, signupAction} from "@/actions/users";

type Props = {
    type: "login" | "register";
};

const AuthForm = ({type}: Props) => {
    const isLoginForm = type === "login";
    const router = useRouter();

    const [isPending, startTransition] = useTransition();

    const handleSubmit = (formData: FormData) => {
        startTransition(async () => {
            const email = formData.get("email") as string;
            const password = formData.get("password") as string;

            let result: { errorMessage: string | null };
            let successTitle: string;
            let successDescription: string;
            let errorTitle: string;

            if (isLoginForm) {
                result = await loginAction(email, password);
                successTitle = "Logged in";
                successDescription = "You have been successfully logged in.";
                errorTitle = "Login Failed";
            } else {
                result = await signupAction(email, password);
                successTitle = "Signed up";
                successDescription = "Check your email for a confirmation link.";
                errorTitle = "Sign Up Failed";
            }

            if (!result.errorMessage) {
                toast.success(successTitle, {
                    description: successDescription,
                })
                // A hard navigation is required after login/signup to ensure the new
                // session cookie is sent to the server for the next page render.
                // Using router.push("/") can cause a race condition.
                window.location.assign("/");
            } else {
                toast.error(errorTitle, {
                    description: result.errorMessage,
                })
            }
        })
    }

    return (
        <form action={handleSubmit}>
            <CardHeader>
                <CardTitle>{isLoginForm ? "Login" : "Create an account"}</CardTitle>
                <CardDescription>
                    {isLoginForm ? "Enter your details to access your account." : "Enter your details to get started."}
                </CardDescription>
            </CardHeader>
            <CardContent>

                <div className={"flex flex-col gap-6"}>
                    <div className={"grid gap-2"}>
                        <Label htmlFor={"email"} className={"text-left"}>Email</Label>
                        <Input
                            id={"email"}
                            name={"email"}
                            type={"email"}
                            placeholder={"me@example.com"}
                            className={"col-span-3"}
                            required
                            disabled={isPending}
                        />
                    </div>
                    <div className={"grid gap-2"}>
                        <div className={"flex w-full items-center justify-between"}>
                            <Label htmlFor={"password"} className={"text-left"}>Password</Label>
                            {isLoginForm && (
                                <Link
                                    href={"/forgot-password"}
                                    className={"text-sm text-primary hover:underline"}
                                >Forgot your password?</Link>
                            )}
                        </div>
                        <Input
                            id={"password"}
                            name={"password"}
                            type={"password"}
                            placeholder={"Enter your password"}
                            className={"col-span-3"}
                            required
                            disabled={isPending}
                        ></Input>
                    </div>
                </div>
            </CardContent>
            <CardFooter className={"mt-4 flex flex-col gap-4"}>
                <Button
                    id={"login-button"}
                    type={"submit"}
                    className={"w-full"}
                >
                    {
                        isPending ?
                            <Loader2 className={"mr-2 h-4 w-4 animate-spin"}/> : (
                                isLoginForm ?
                                    "Login" :
                                    "Sign Up"
                            )
                    }
                </Button>

                <p className={"text-center text-xsm text-muted-foreground"}>
                    {isLoginForm ? "Don't have an account yet?" : "Already have an account?"}{"  "}
                    <Link href={isLoginForm ? "/register" : "/login"}
                          className={`text-primary hover:underline ${isPending ? "pointer-events-none cursor-not-allowed opacity-50" : ""}`}>
                        {isLoginForm ? "Sign up" : "Login"}
                    </Link>
                </p>
            </CardFooter>
        </form>
    );
};
export default AuthForm;
