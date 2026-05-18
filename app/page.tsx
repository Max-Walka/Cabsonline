import Link from 'next/link'

const cards = [
  {
    href: '/book',
    icon: '🚕',
    title: 'Book a Taxi',
    desc: 'Reserve a taxi with map-based pickup selection and instant fare estimates.',
    cta: 'Book Now',
    btnClass: 'bg-yellow-400 hover:bg-yellow-500 text-gray-900',
  },
  {
    href: '/track',
    icon: '📍',
    title: 'Track Booking',
    desc: 'Enter your booking reference to see real-time status and driver details.',
    cta: 'Track Now',
    btnClass: 'bg-blue-500 hover:bg-blue-600 text-white',
  },
  {
    href: '/admin',
    icon: '🛠️',
    title: 'Admin Panel',
    desc: 'Search and manage bookings, assign drivers, and manage the driver fleet.',
    cta: 'Open Admin',
    btnClass: 'bg-gray-800 hover:bg-gray-900 text-white',
  },
]

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Auckland&apos;s Taxi Service</h1>
        <p className="text-gray-600 text-lg">Fast, reliable taxi bookings across Auckland</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {cards.map((card) => (
          <div key={card.href} className="bg-white rounded-xl shadow p-6 flex flex-col">
            <div className="text-4xl mb-3">{card.icon}</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{card.title}</h2>
            <p className="text-gray-600 text-sm flex-1 mb-4">{card.desc}</p>
            <Link
              href={card.href}
              className={`block text-center font-medium py-2 px-4 rounded-lg transition-colors ${card.btnClass}`}
            >
              {card.cta}
            </Link>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="font-bold text-gray-900 text-lg mb-4">Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
          {[
            '🗺️ Interactive map pickup — click to set your location',
            '💰 Fare estimator — get an estimate before you book',
            '📡 Live booking tracker — real-time status updates',
            '👨‍✈️ Driver management — full fleet visibility for admins',
          ].map((f) => (
            <p key={f}>{f}</p>
          ))}
        </div>
      </div>
    </div>
  )
}
