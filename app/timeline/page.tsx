import { redirect } from "next/navigation";

function localDateString(date: Date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}

export default function TimelinePage() {
  const todayLocal = localDateString(new Date());
  redirect(`/timeline/${todayLocal}`);
}
