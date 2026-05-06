import { Link } from 'react-router-dom'

import { LoginForm } from '@/views/loginForm'

export default function LoginPage() {
    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex justify-center gap-2 md:justify-start">
                    <Link to="/" className="flex items-center gap-2 font-medium">
                        <div className="flex size-6 items-center justify-center rounded-md  text-primary-foreground">
                            <img
                                src="/LOGO_ICB_BLU.jpg"
                                alt="logo icib blu"
                                className="h-[24px] w-[24px]"
                            />
                        </div>
                        ICIB - LinkedIn Posts
                    </Link>
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs">
                        <LoginForm />
                    </div>
                </div>
            </div>
            <div className="hidden border-l-[1px] border-[#e8e4e3] bg-[#fbfbfb] lg:flex lg:flex-col lg:items-center lg:justify-center lg:gap-6 lg:px-8 lg:text-center">
                <img
                    src="/post.svg"
                    alt="Anteprima applicativo ICIB LinkedIn Posts"
                    className="h-[400px] w-[400px]"
                />
                <div className="max-w-md space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight">
                        ICIB - linkedin posts
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Organizza idee, prepara contenuti e pianifica la pubblicazione
                        dei post LinkedIn in un unico flusso, con uno stile coerente e
                        pronto per il tuo team.
                    </p>
                </div>
            </div>
        </div>
    )
}
