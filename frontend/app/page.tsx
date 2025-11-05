"use client";

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--sidebar)' }}>
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Welcome</h1>
        <p className="text-gray-400">Select a page from the sidebar to get started</p>
      </div>
    </div>
  );
}