import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SevaSansaar',
  robots: 'noindex, nofollow',
};

export default function SevaSansaarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
