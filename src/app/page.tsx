import Hero from '@/components/hero/hero'
import Navbar from '@/components/navbar/navbar'
import Sections from '@/components/sections/sections'

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Sections />
      </main>
    </>
  )
}
