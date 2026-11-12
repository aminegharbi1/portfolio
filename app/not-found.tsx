import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-4 font-mono">
      <p className="text-sm text-subtle">
        <span className="text-ok">➜</span> <span className="text-[#4C8DFF]">~</span> cd this-page
      </p>
      <p className="mt-2 text-fg">error 404: no such file or directory</p>
      <Link href="/" className="mt-8 inline-flex min-h-11 items-center text-sm text-[#4C8DFF] underline underline-offset-4">
        cd ~ (back home)
      </Link>
    </main>
  );
}
