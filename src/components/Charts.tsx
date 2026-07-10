import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatMoney } from '../lib/money'

const chartColors = ['#0f766e', '#2563eb', '#d97706', '#9333ea', '#047857', '#b91c1c']

export function CategoryPieChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer
      width="100%"
      height="100%"
      minWidth={0}
      minHeight={240}
      initialDimension={{ width: 520, height: 288 }}
    >
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95}>
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => formatMoney(Number(value))} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function IncomeExpenseBarChart({
  data,
}: {
  data: { day: string; prihodki: number; stroski: number }[]
}) {
  return (
    <ResponsiveContainer
      width="100%"
      height="100%"
      minWidth={0}
      minHeight={240}
      initialDimension={{ width: 520, height: 288 }}
    >
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" />
        <YAxis tickFormatter={(value) => `${value} €`} />
        <Tooltip formatter={(value) => formatMoney(Number(value))} />
        <Legend />
        <Bar dataKey="prihodki" fill="#0f766e" />
        <Bar dataKey="stroski" fill="#d97706" />
      </BarChart>
    </ResponsiveContainer>
  )
}
