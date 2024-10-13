import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TooltipProps {
      children: React.ReactNode
      content: string
}

export function Tooltip({ children, content }: TooltipProps) {
      const [isVisible, setIsVisible] = useState(false)

      return (
            <div className="relative inline-flex items-center justify-center">
                  <div
                        onMouseEnter={() => setIsVisible(true)}
                        onMouseLeave={() => setIsVisible(false)}
                        className="inline-flex items-center justify-center"
                  >
                        {children}
                  </div>

                  <AnimatePresence>
                        {isVisible && (
                              <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute z-10 px-2 py-1 text-xs text-white bg-gray-800 rounded-md shadow-md whitespace-nowrap bottom-full transform -translate-x-1/2 mb-2"
                              >
                                    {content}
                                    <div className="absolute w-2 h-2 bg-gray-800 transform rotate-45 left-1/2 -translate-x-1/2 -bottom-1"></div>
                              </motion.div>
                        )}
                  </AnimatePresence>
            </div>
      )
}
