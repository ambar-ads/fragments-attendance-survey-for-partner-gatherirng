import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ASUS | ACP Registration Form',
};

export default function ACPRegistrationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
