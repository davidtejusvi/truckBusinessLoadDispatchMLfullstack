import Layout from '../components/Layout';
import { TrendingUp, MapPin, Fuel, BarChart2, ArrowRight } from 'lucide-react';

const cards = [
  { icon: <TrendingUp className="w-6 h-6" />, title: 'Rate Prediction', desc: 'AI-powered freight rate forecasting using historical data, seasonal trends, and market conditions.', features: ['7-day rate forecast', 'Lane-specific predictions', 'Confidence intervals'], color: 'from-orange-500 to-orange-600' },
  { icon: <MapPin className="w-6 h-6" />, title: 'Demand Heatmap', desc: 'Visualize freight demand across regions to position your truck where loads are plentiful.', features: ['Real-time demand data', 'USA & Europe coverage', 'Hotspot alerts'], color: 'from-blue-500 to-blue-600' },
  { icon: <Fuel className="w-6 h-6" />, title: 'Fuel Cost Estimator', desc: 'Calculate your true cost per mile with live fuel prices factored into your load profitability.', features: ['Live fuel pricing', 'Route optimization', 'Profit calculator'], color: 'from-green-500 to-green-600' },
  { icon: <BarChart2 className="w-6 h-6" />, title: 'Market Intelligence', desc: 'Spot market trends, identify high-value lanes, and benchmark your rates against the market.', features: ['Lane analytics', 'Market benchmarks', 'Competitor insights'], color: 'from-purple-500 to-purple-600' },
];

export default function PredictionsPage() {
  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-navy-900">AI Predictions</h1>
          <p className="text-slate-500 mt-1">Intelligent freight analytics powered by machine learning</p>
        </div>
        <div className="bg-gradient-to-r from-navy-900 to-navy-800 rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-8 h-8 text-accent" />
            <h2 className="text-xl font-bold">Predictions Coming in Phase 3</h2>
          </div>
          <p className="text-slate-400 max-w-xl">Our ML engine is being trained on millions of freight data points across USA and European markets. These features will transform how you find and price loads.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          {cards.map(card => (
            <div key={card.title} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className={`bg-gradient-to-r ${card.color} p-5 flex items-center gap-3 text-white`}>
                {card.icon}
                <h3 className="font-bold text-lg">{card.title}</h3>
                <span className="ml-auto text-xs font-semibold bg-white/20 px-3 py-1 rounded-full">Coming Soon</span>
              </div>
              <div className="p-5">
                <p className="text-slate-600 text-sm mb-4">{card.desc}</p>
                <ul className="space-y-2">
                  {card.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-500">
                      <ArrowRight className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
