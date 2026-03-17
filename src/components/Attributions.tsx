import { AttributionItem } from "./AttributionItem";

export function Attributions() {
  const authors = [`lacreative`, "freepik"];

  return (
    <footer className="bg-gradient-to-r from-green-800 to-teal-800 text-white py-8 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3">
            <span className="text-3xl">🌿</span>
            <div>
              <h3 className="text-lg font-bold">Calm Garden</h3>
              <p className="text-green-200 text-sm">Breathe. Earn. Grow.</p>
            </div>
          </div>

          {/* Attributions */}
          <div className="text-center md:text-right">
            <p className="text-green-200 text-xs mb-2 uppercase tracking-wider">Icons by</p>
            <div className="flex gap-4">
              {authors.map((author) => (
                <a
                  key={author}
                  href={`https://www.flaticon.com/authors/${author}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-green-300 transition-colors text-sm"
                >
                  {author}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-green-700 my-6"></div>

        {/* Bottom row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-green-200">
          <p>© {new Date().getFullYear()} Calm Garden. Take a deep breath. 🧘‍♀️</p>
          <div className="flex gap-6">
            <a 
              href="https://github.com/jaroslaw-weber/calm-garden" 
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              GitHub
            </a>
            <a 
              href="https://www.flaticon.com" 
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Flaticon
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
