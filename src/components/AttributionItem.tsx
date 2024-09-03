export function AttributionItem(p: { author: string }) {
  const { author } = p;
  return (
    <a
      href={`https://www.flaticon.com/authors/${author}`}
      title="grass icons"
      className="text-green-600 hover:text-green-800 transition-colors duration-300 mb-2"
    >
      Icons created by {author} - Flaticon
    </a>
  );
}
