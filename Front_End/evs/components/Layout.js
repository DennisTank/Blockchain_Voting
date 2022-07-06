import Head from "next/head";

export default function Layout({ title, children }) {
  return (
    <div className=" bg-white m-0 overflow-hidden">
      <Head>
        <title className="font-bold">{title}</title>
        <meta name="description" content="E-Voting System" />
        <link rel="icon" href="/favicon.ico" /> {/*chagne the icon */}
      </Head>
      <main className=" container m-0 min-h-screen">
        <div className="w-screen bg-slate-900 h-4"></div>
        {children}
        <div className="w-screen bg-slate-900 h-4"></div>
      </main>
    </div>
  );
}
