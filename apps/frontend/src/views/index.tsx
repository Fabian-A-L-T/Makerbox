const features = [
  {
    icon: '🗂️',
    title: 'Smart Inventory',
    description: 'Organize resistors, capacitors, ICs, and more with powerful tagging and filtering.',
  },
  {
    icon: '🔍',
    title: 'Instant Search',
    description: 'Find any component in milliseconds with full-text search across all properties.',
  },
  {
    icon: '📦',
    title: 'Stock Tracking',
    description: 'Monitor quantities, set low-stock alerts, and never run out of a critical part again.',
  },
  {
    icon: '📋',
    title: 'BOM Generator',
    description: 'Export Bills of Materials directly from your projects with one click.',
  },
  {
    icon: '🔗',
    title: 'Datasheet Links',
    description: 'Attach datasheets and reference documents to every component automatically.',
  },
  {
    icon: '📍',
    title: 'Location Mapping',
    description: 'Know exactly which bin, drawer, or shelf holds each component.',
  },
]

const stats = [
  { value: '50K+', label: 'Components Supported' },
  { value: '10K+', label: 'Makers Using MakerBox' },
  { value: '99.9%', label: 'Uptime' },
  { value: '< 50ms', label: 'Search Speed' },
]

function Index() {
  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">

      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span className="text-xl font-bold text-white tracking-tight">MakerBox</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#stats" className="hover:text-white transition-colors">Stats</a>
            <a href="#cta" className="hover:text-white transition-colors">Get Started</a>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2">
              Sign In
            </button>
            <button className="text-sm bg-indigo-600 hover:bg-indigo-500 transition-colors text-white font-medium px-4 py-2 rounded-lg">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 flex flex-col items-center text-center overflow-hidden">
        {/* Glow background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-indigo-400 bg-indigo-950 border border-indigo-800 px-4 py-1.5 rounded-full mb-6">
          ⚡ Electronic Components Manager
        </span>

        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 max-w-4xl">
          Your Workshop,{' '}
          <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            Perfectly Organized
          </span>
        </h1>

        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed">
          MakerBox is the ultimate inventory system for electronics makers, hobbyists,
          and engineers. Track every resistor, IC, and connector — all in one place.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all text-white font-semibold px-8 py-3.5 rounded-xl text-base shadow-lg shadow-indigo-900/50">
            Start for Free →
          </button>
          <button className="bg-gray-800 hover:bg-gray-700 active:scale-95 transition-all text-white font-semibold px-8 py-3.5 rounded-xl text-base border border-gray-700">
            View Demo
          </button>
        </div>

        {/* Hero mockup */}
        <div className="relative mt-20 w-full max-w-4xl">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl shadow-black/60">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800 bg-gray-900">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <span className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="ml-4 text-xs text-gray-500 font-mono">makerbox.app/inventory</span>
            </div>
            {/* Fake table */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gray-800 rounded-lg px-4 py-2 text-sm text-gray-400 w-64">🔍 Search components…</div>
                <div className="flex gap-2">
                  <span className="bg-indigo-950 border border-indigo-800 text-indigo-300 text-xs px-3 py-1 rounded-full">All</span>
                  <span className="text-gray-500 text-xs px-3 py-1 rounded-full">Resistors</span>
                  <span className="text-gray-500 text-xs px-3 py-1 rounded-full">Capacitors</span>
                  <span className="text-gray-500 text-xs px-3 py-1 rounded-full">ICs</span>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { name: '10kΩ Resistor', cat: 'Resistors', qty: 450, loc: 'Bin A-3' },
                  { name: '100nF Ceramic Cap', cat: 'Capacitors', qty: 220, loc: 'Bin B-1' },
                  { name: 'ATmega328P', cat: 'Microcontrollers', qty: 12, loc: 'Drawer 2' },
                  { name: 'NPN 2N2222', cat: 'Transistors', qty: 88, loc: 'Bin C-5' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-800/50 rounded-lg px-4 py-3 text-sm hover:bg-gray-800 transition-colors">
                    <span className="text-white font-medium w-44">{item.name}</span>
                    <span className="text-indigo-400 text-xs bg-indigo-950 px-2 py-0.5 rounded-full">{item.cat}</span>
                    <span className={`font-mono font-semibold ${item.qty < 20 ? 'text-red-400' : 'text-green-400'}`}>{item.qty} pcs</span>
                    <span className="text-gray-500 text-xs">{item.loc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-16 px-6 border-y border-gray-800 bg-gray-900/40">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-4xl font-extrabold text-white mb-1">{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything a Maker Needs</h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Built specifically for electronics enthusiasts who care about staying organized.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-indigo-700 hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                  {f.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-indigo-950 to-gray-900 border border-indigo-800 rounded-3xl p-16 shadow-2xl shadow-indigo-950/50">
          <h2 className="text-4xl font-extrabold mb-4">Ready to tame your parts bin?</h2>
          <p className="text-gray-400 text-lg mb-10">
            Join thousands of makers who use MakerBox to stop losing components and start building faster.
          </p>
          <button className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all text-white font-bold px-10 py-4 rounded-xl text-lg shadow-lg shadow-indigo-900/60">
            Get Started — It's Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-6 text-center text-gray-600 text-sm">
        <span className="text-white font-semibold">⚡ MakerBox</span> — Built for makers, by makers. &copy; {new Date().getFullYear()}
      </footer>

    </div>
  )
}

export default Index