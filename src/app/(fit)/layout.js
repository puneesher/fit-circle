import AppHeader from "@/components/AppHeader";

export default function FitLayout({ children }) {
  return (
    <>
      <AppHeader />
      {children}
    </>
  );
}
