'use client'

import { useState, useEffect } from 'react'

interface DailyStat {
  date: string
  timestamp: Date
  newUsers: number
  newAnonymousUsers: number
  totalVisitors: number
  transcriptions: number
}

interface AnalyticsChartProps {
  data: DailyStat[]
  type?: 'line' | 'bar'
  title?: string
  height?: number
}

export default function AnalyticsChart({ 
  data, 
  type = 'line', 
  title = 'Visitor Analytics',
  height = 300 
}: AnalyticsChartProps) {
  const [ChartComponents, setChartComponents] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadChartJS = async () => {
      try {
        const [
          { Chart: ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler },
          { Line, Bar }
        ] = await Promise.all([
          import('chart.js'),
          import('react-chartjs-2')
        ])

        ChartJS.register(
          CategoryScale,
          LinearScale,
          PointElement,
          LineElement,
          BarElement,
          Title,
          Tooltip,
          Legend,
          Filler
        )

        setChartComponents({ Line, Bar })
        setLoading(false)
      } catch (error) {
        console.error('Failed to load Chart.js:', error)
        setLoading(false)
      }
    }

    loadChartJS()
  }, [])

  const chartData = {
    labels: data.map(stat => {
      const date = new Date(stat.date)
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    }),
    datasets: [
      {
        label: 'New Users',
        data: data.map(stat => stat.newUsers),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Anonymous Users',
        data: data.map(stat => stat.newAnonymousUsers),
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Transcriptions',
        data: data.map(stat => stat.transcriptions),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  }

  if (loading) {
    return (
      <div style={{ height: `${height}px` }} className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-2 text-gray-500">Loading chart...</p>
      </div>
    )
  }

  if (!ChartComponents) {
    // Fallback to table view if Chart.js fails to load
    return (
      <div style={{ height: `${height}px` }} className="overflow-auto">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4">{title}</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">New Users</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Anonymous</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transcriptions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Visitors</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((stat, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {new Date(stat.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">{stat.newUsers}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600 font-medium">{stat.newAnonymousUsers}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">{stat.transcriptions}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 font-medium">{stat.totalVisitors}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  const { Line, Bar } = ChartComponents

  return (
    <div style={{ height: `${height}px` }}>
      {type === 'line' ? (
        <Line data={chartData} options={options} />
      ) : (
        <Bar data={chartData} options={options} />
      )}
    </div>
  )
}
