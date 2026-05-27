/**
 * Layout wrapper for authenticated pages.
 * Includes sidebar + main content area.
 */
import { motion } from 'framer-motion'
import Sidebar from './Sidebar'

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: -10 }
}

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-dark-900 flex">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen">
        <motion.div
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="p-8 max-w-6xl"
        >
          {children}
        </motion.div>
      </main>
    </div>
  )
}
