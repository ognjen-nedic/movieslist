import '@/styles/globals.css'
import { Alumni_Sans } from 'next/font/google'

const alumniSans = Alumni_Sans({ subsets: ['latin'] })

export default function App({ Component, pageProps }) {
  return (
    <Component {...pageProps} />
  )
}
