export default function Pagination({
  page,
  totalPages,
  onPageChange,
}) {
  return (
    <div className="flex justify-center items-center gap-3 mt-6">

      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-4 py-2 border rounded-lg disabled:opacity-50"
      >
        Previous
      </button>

      <span className="font-semibold">
        Page {page} of {totalPages}
      </span>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="px-4 py-2 border rounded-lg disabled:opacity-50"
      >
        Next
      </button>

    </div>
  );
}