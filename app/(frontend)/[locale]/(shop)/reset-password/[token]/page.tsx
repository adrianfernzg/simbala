import { redirect } from 'next/navigation'

type Props = {
  params: Promise<{ locale: string; token: string }>
}

export default async function ResetPasswordTokenPage({ params }: Props) {
  const { locale } = await params
  redirect(`/${locale}/reset-password`)
}
