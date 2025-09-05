import {createServerClient} from '@supabase/ssr'
import {NextResponse, type NextRequest} from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request: { headers: request.headers },
    })

    console.log("middleware updateSession called");

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
                        request: { headers: request.headers },
                    })
                    cookiesToSet.forEach(({name, value, options}) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Fetch the user ONCE and reuse to avoid multiple session touches
    let user = null as null | { id: string };
    try {
        const {
            data: { user: u },
        } = await supabase.auth.getUser()
        user = u as any
    } catch (e) {
        // swallow to avoid noisy edge errors; unauthenticated is fine
    }

    // If the user is logged in, they can't go to the login or signup page
    const isAuthRoute =
        request.nextUrl.pathname.startsWith('/login') ||
        request.nextUrl.pathname.startsWith('/signup');

    if (isAuthRoute && user) {
        const url = new URL('/', request.url)
        const redirectResponse = NextResponse.redirect(url)
        // copy over cookies to keep session in sync
        redirectResponse.cookies.setAll(supabaseResponse.cookies.getAll())
        return redirectResponse
    }

    // Avoid doing internal fetches in middleware (hard to forward cookies reliably on Edge)
    // The app/page.tsx will handle picking/creating the appropriate note after render.

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
