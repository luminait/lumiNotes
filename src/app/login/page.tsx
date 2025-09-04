import {Card, CardTitle} from "@/components/ui/card";
import AuthForm from "@/components/AuthForm";

const LoginPage = () => {
    return (
        <div className={"mt-20 flex flex1 flex-col items-center justify-center"}>
            <Card className={"w-full max-w-md"}>
                <CardTitle className={"mt-4 text-center text-3xl"}> Login</CardTitle>
                <AuthForm type={"login"}/>
            </Card>
        </div>
    );
};
export default LoginPage;
