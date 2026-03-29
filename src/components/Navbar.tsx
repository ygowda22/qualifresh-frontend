export default function Navbar() {
  return (
    <nav className="w-full bg-white shadow-sm px-6 py-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-green-700">QualiFresh</h1>

      <div className="space-x-6 text-gray-700 font-medium">
        <a href="/">Home</a>
        <a href="/products">Products</a>
        <a href="/contact">Contact</a>
      </div>
    </nav>
  );
}