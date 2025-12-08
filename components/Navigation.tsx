"use client"

import { useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { BlogData } from "@/lib/types"
import { MiniCalendar, MiniCalendarDays, MiniCalendarDay } from "./kibo-ui/mini-calendar"
import { parse } from "date-fns"

function convertStringToDate(date: string) {
  return parse(date, 'yyyy-MM-dd', new Date())
}

export default function Navigation({
  blogData
}: {
  blogData: BlogData
}) {
  const router = useRouter()
  const { date } = useParams();

  const startDate = useMemo(() => convertStringToDate(blogData.days[0].date),
    [blogData]
  )

  const availableDates = useMemo(() => {
    const set = new Set(blogData.days.map((d) => d.date))
    return Array.from(set).map((d) => new Date(d))
  }, [blogData])

  function handleDateChange(date?: Date | Date[]) {
    if (!date || Array.isArray(date)) return
    router.push(`/post/${date.toISOString().slice(0, 10)}`)
  }

  // use route `date` param as the initial selected date when present
  const initialSelectedDate = useMemo(() => {
    if (!date) return undefined
    const d = Array.isArray(date) ? date[0] : date
    try {
      return convertStringToDate(d)
    } catch {
      return undefined
    }
  }, [date])

  return (
    <MiniCalendar
      days={availableDates.length}
      startDate={startDate}
      defaultValue={initialSelectedDate}
      onValueChange={handleDateChange}
    >
      <MiniCalendarDays>
        {(date) => <MiniCalendarDay date={date} key={date.toISOString()} />}
      </MiniCalendarDays>
    </MiniCalendar>
  )
}
