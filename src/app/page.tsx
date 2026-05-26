import Navbar from '@/components/navbar/navbar'
import Hero from '@/components/hero/hero'
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