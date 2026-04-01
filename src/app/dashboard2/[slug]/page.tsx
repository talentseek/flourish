import { redirect } from "next/navigation"

interface SlugRedirectProps {
  params: {
    slug: string
  }
}

export default function Dashboard2SlugRedirect({ params }: SlugRedirectProps) {
  redirect(`/dashboard/${params.slug}`)
}
