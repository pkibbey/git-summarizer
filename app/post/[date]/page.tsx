import fs from 'fs/promises'
import path from 'path'
import { notFound } from 'next/navigation'

import type { DayPost as DayPostType } from '@/lib/types'
import { parseISO, format } from 'date-fns'
import { DayPost } from '@/components/DayPost'
import { DailySummary } from '@/components/DailySummary'

interface PageProps {
  params: { date: string }
}

export default async function Page({ params }: PageProps) {
  const { date } = await params;
  const model = 'gemma-3'
  const version = 'v2'

  const filePath = path.join(process.cwd(), 'public', 'blog-data', model, `${version}.json`)
  let raw: string
  try {
    raw = await fs.readFile(filePath, 'utf8')
  } catch (err) {
    console.error('Failed to read blog-data file', err)
    notFound()
    return null
  }

  const json = JSON.parse(raw) as { days: DayPostType[] }
  const day = json.days.find((d) => d.date === date)
  if (!day) notFound()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <header className="grid mb-6 gap-4">
        <div className='flex gap-4 justify-between items-end'>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-50">
            <time dateTime={day!.date} className="not-italic">
              {format(parseISO(day!.date), 'EEEE, LLL d, yyyy')}
            </time>
          </h1>
          <div className="flex gap-6 text-sm text-gray-600 dark:text-gray-400">
            <span>{day.stats.totalCommits} commit{day.stats.totalCommits !== 1 ? 's' : ''}</span>
            <span>{day.stats.filesChanged} file{day.stats.filesChanged !== 1 ? 's' : ''}</span>
            <span className="text-green-600 dark:text-green-400">+{day.stats.additions}</span>
            <span className="text-red-600 dark:text-red-400">-{day.stats.deletions}</span>
          </div>
        </div>
      </header>

      <article>
        <DayPost day={day!} />
      </article>
    </div>
  )
}
