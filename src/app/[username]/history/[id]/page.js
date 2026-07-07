import HistoryDetailClient from "./page-client";
import { getWorkoutSession } from "@/lib/workout";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { username, id } = await params;
  const session = await getWorkoutSession(id);

  return {
    title: session
      ? `${session.routineName} | Fitness Circle`
      : "Workout | Fitness Circle",
  };
}

export default async function HistoryDetailPage({ params }) {
  const { username, id } = await params;
  const session = await getWorkoutSession(id);

  if (!session) notFound();

  return <HistoryDetailClient initialSession={session} username={username} />;
}
