import AppHeader from "@/components/AppHeader";

export default async function UserLayout({ children, params }) {
  const { username } = await params;
  return (
    <>
      <AppHeader username={username} />
      {children}
    </>
  );
}
