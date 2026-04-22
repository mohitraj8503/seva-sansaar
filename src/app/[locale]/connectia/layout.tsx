import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LoveLink',
  robots: 'noindex, nofollow',
};

export default function LoveLinkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
