import Script from 'next/script'

export const metadata = {
  title: 'Admin Panel | Aliza Traders'
}

export default function AdminPage() {
  return (
    <>
      <link href="/static/admin.css" rel="stylesheet" />
      <div id="adminRoot" />
      <Script src="/static/admin.js" strategy="afterInteractive" />
    </>
  )
}
