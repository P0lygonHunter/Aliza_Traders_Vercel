import Script from 'next/script'

export default function HomePage() {
  return (
    <>
      <link href="/static/style.css" rel="stylesheet" />
      <div id="storefront-root" suppressHydrationWarning />
      <Script
        id="storefront-html"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(){
              /* storefront markup injected after load from /static/storefront.html */
            })();
          `
        }}
      />
      <Script src="/static/storefront-boot.js" strategy="afterInteractive" />
      <Script src="/static/app.js" strategy="afterInteractive" />
    </>
  )
}
