import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

const seriesNameMap = {
  'przychody_zewnetrzne_w_miesiacu': 'Przychody w miesiącu',
  'przychody_zewnetrzne_skumulowane': 'Przychody skumulowane',
  'koszty_zabezpieczone_wewnetrzne_dzialowe_w_miesiacu': 'Koszty zabezpieczone działowe w miesiącu',
  'koszty_zabezpieczone_wewnetrzne_nie_dzialowe_w_miesiacu': 'Koszty zabezpieczone niedziałowe w miesiącu',
  'koszty_zabezpieczone_zewnetrzne_w_miesiacu': 'Koszty zabezpieczone zewnętrzne w miesiącu',
  'koszty_zabezpieczone_suma_skumulowane': 'Suma kosztów zabezpieczonych skumulowane',
  'koszty_rzeczywiste_wewnetrzne_dzialowe_wyplacone_w_miesiacu': 'Koszty rzeczywiste działowe wypłacone w miesiącu',
  'koszty_rzeczywiste_wewnetrzne_dzialowe_estymowane_w_miesiacu': 'Koszty rzeczywiste działowe estymowane w miesiącu',
  'koszty_rzeczywiste_wewnetrzne_nie_dzialowe_w_miesiacu': 'Koszty rzeczywiste niedziałowe w miesiącu',
  'koszty_rzeczywiste_zewnetrzne_oplacone_w_miesiacu': 'Koszty rzeczywiste zewnętrzne opłacone w miesiącu',
  'koszty_rzeczywiste_zewnetrzne_niezafakturowane_w_miesiacu': 'Koszty rzeczywiste zewnętrzne niezafakturowane w miesiącu',
  'koszty_rzeczywiste_suma_skumulowane': 'Suma kosztów rzeczywistych skumulowane',
  'przychody_wewnetrzne_w_miesiacu': 'Przychody wewnętrzne w miesiącu',
  'przychody_wewnetrzne_skumulowane': 'Przychody wewnętrzne skumulowane',
  'różnica_przychody_zewnętrzne_minus_koszty_rzeczywiste_skumulowane': 'Różnica: Przychody - Koszty Rzeczywiste (skumulowane)',
  'różnica_koszty_zabezpieczone_suma_minus_koszty_rzeczywiste_skumulowane': 'Różnica: Koszty Zabezpieczone - Koszty Rzeczywiste (skumulowane)',
  'przychody_zewnetrzne_PZD_skumulowane': 'Przychody Zewnętrzne (PZD) skumulowane',
  'przychody_zewnetrzne_PZD_w_miesiacu': 'Przychody Zewnętrzne (PZD) w miesiącu',
  'koszty_zabezpieczone_wewnetrzne_dzialowe_w_miesiacu': 'Koszty Zabezpieczone Wewnętrzne Działowe w miesiącu',
  'przychody_wewnetrzne_w_miesiacu': 'Przychody wewnętrzne w miesiącu',
  'przychody_wewnetrzne_skumulowane': 'Przychody wewnętrzne skumulowane',
};

const getSeriesCategory = (key) => {
  if (key.includes('roznica') || key.includes('różnica')) return 'roznice';
  if (key.includes('przychody')) return 'przychody';
  if (key.includes('koszty_zabezpieczone')) return 'koszty_zabezpieczone';
  if (key.includes('koszty_rzeczywiste')) return 'koszty_rzeczywiste';
  return 'default';
};

const seriesColors = {
  przychody: '#4CAF50', // Zielony
  koszty_zabezpieczone: '#2196F3', // Niebieski
  koszty_rzeczywiste: '#F44336', // Czerwony
  roznice: '#9C27B0', // Fioletowy
  default: '#000000',
};

const getChartType = (key) => {
  return key.includes('_w_miesiacu') ? 'bar' : 'area'; // Zmieniono z 'line' na 'area' dla wykresów z wypełnieniem
};

function DataChart({ data, title, seriesKeys, dateKey }) {
  if (!data || data.length === 0 || seriesKeys.length === 0) {
    return (
      <div className="no-data-message-chart">
        {seriesKeys.length === 0
          ? 'Wybierz co najmniej jedną zmienną do wyświetlenia.'
          : 'Brak danych w wybranym okresie.'}
      </div>
    );
  }

  const areaSeries = seriesKeys.filter(key => getChartType(key) === 'area');
  const barSeries = seriesKeys.filter(key => getChartType(key) === 'bar');

  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={dateKey} />
        <YAxis />
        <Tooltip formatter={(value) => `${value.toFixed(2)} PLN`} />
        <Legend />

        <defs>
          {areaSeries.map((key) => {
            const color = seriesColors[getSeriesCategory(key)];
            return (
              <linearGradient id={`color${key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                <stop offset="95%" stopColor={color} stopOpacity={0.1} />
              </linearGradient>
            );
          })}
        </defs>

        {areaSeries.map((key) => (
          <Area
            key={key}
            type="monotone"
            dataKey={key}
            stroke={seriesColors[getSeriesCategory(key)]}
            fill={`url(#color${key})`}
            name={seriesNameMap[key] || key}
            strokeWidth={2}
          />
        ))}

        {barSeries.map((key) => (
          <Bar
            key={key}
            dataKey={key}
            fill={seriesColors[getSeriesCategory(key)]}
            name={seriesNameMap[key] || key}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default DataChart;