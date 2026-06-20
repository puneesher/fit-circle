import { bookRowId } from "@/lib/books";
import ExerciseImage from "@/components/ExerciseImage";
import { getBookStorage } from "@/lib/storage";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Books",
  robots: { index: false, follow: false },
};

export default async function BooksPage() {
  const books = await getBookStorage().readAll();

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950">
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Books
        </h1>
        <p className="mt-1 text-sm text-zinc-500">{books.length} titles</p>

        {books.length === 0 ? (
          <p className="mt-6 text-zinc-500">No books yet.</p>
        ) : (
          <ul className="mt-6 space-y-3">
            {books.map((book, index) => (
              <li
                key={bookRowId(book, index)}
                className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex gap-4 p-4">
                  {book.Picture && (
                    <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                      <ExerciseImage
                        src={book.Picture}
                        alt={book.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h2 className="font-medium text-zinc-900 dark:text-zinc-50">
                      {book.title}
                    </h2>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                      {book.author}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-500">
                      <span>Your rating: {book.user_rating}★</span>
                      <span>Avg: {book.avg_rating}</span>
                      {book.shelves?.length > 0 && (
                        <span>{book.shelves.join(", ")}</span>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-4 text-xs text-zinc-400">
                      {book.date_read && <span>Read {book.date_read}</span>}
                      <span>Added {book.date_added}</span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
