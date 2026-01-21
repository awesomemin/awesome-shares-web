import Link from 'next/link';

export default function Header() {
  return (
    <header className="flex items-center justify-center h-16 shadow mb-12">
      <Link href="/" className="font-black">
        Awesome-Shares
      </Link>
    </header>
  );
}
