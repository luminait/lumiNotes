import {createServerClient} from '@supabase/ssr'
import {NextResponse, type NextRequest} from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({name, value, options}) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({name, value, options}) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // If the user is logged in, the can't go to the login or signup page
    const isAuthRoute =
        request.nextUrl.pathname.startsWith('/login') ||
        request.nextUrl.pathname.startsWith('/signup');

    if (isAuthRoute) {
        const {
            data: {user},
        } = await supabase.auth.getUser()

        if (user) {
            return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_BASE_URL!))
        }
    }

    // If the URL has no noteId, try to go the user's most recent note.
    // If the user has no notes, redirect to the create note page.
    const {searchParams, pathname} = new URL(request.url);
    if (!searchParams.get('noteId') && pathname === '/') {
        const {
            data: {user},
        } = await supabase.auth.getUser()


        if (user) {
            const {newestNoteId} =
                await fetch(`${process.env.NEXT_PUBLIC_BASE_URL!}/api/fetch-newest-note?userId=${user.id}`)
                .then((res) => res.json());

            if (newestNoteId) {
                const url = request.nextUrl.clone();
                url.searchParams.set('noteId', newestNoteId);
                return NextResponse.redirect(url);
            } else {
                const noteId =
                    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL!}/api/create-new-note?userId=${user.id}`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }).then((res) => res.json());
                const url = request.nextUrl.clone();
                url.searchParams.set('noteId', noteId);
                return NextResponse.redirect(url);

            }
        }
    }

    // Do not run code between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    // IMPORTANT: DO NOT REMOVE auth.getUser()

    const {
        data: {user},
    } = await supabase.auth.getUser()


    // IMPORTANT: You *must* return the supabaseResponse object as it is.
    // If you're creating a new response object with NextResponse.next() make sure to:
    // 1. Pass the request in it, like so:
    //    const myNewResponse = NextResponse.next({ request })
    // 2. Copy over the cookies, like so:
    //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
    // 3. Change the myNewResponse object to fit your needs, but avoid changing
    //    the cookies!
    // 4. Finally:
    //    return myNewResponse
    // If this is not done, you may be causing the browser and server to go out
    // of sync and terminate the user's session prematurely!

    return supabaseResponse
}
