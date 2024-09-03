import { AttributionItem } from "./AttributionItem";

export function Attributions() {
  const authors = [`lacreative`, "freepik"];

  const items = authors.map((author) => (
    <AttributionItem key={author} author={author} />
  ));

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-3 text-gray-700">Attributions</h2>
      {items}
    </div>
  );
}
