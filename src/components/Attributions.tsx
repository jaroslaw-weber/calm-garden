export function Attributions() {
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-3 text-gray-700">Attributions</h2>
      <a
        href="https://www.flaticon.com/free-icons/grass"
        title="grass icons"
        className="text-green-600 hover:text-green-800 transition-colors duration-300 mb-2"
      >
        Grass icons created by Freepik - Flaticon
      </a>
      <a
        href="https://www.flaticon.com/free-icons/flower"
        title="flower icons"
        className="text-pink-600 hover:text-pink-800 transition-colors duration-300"
      >
        Flower icons created by Freepik - Flaticon
      </a>
    </div>
  );
}
