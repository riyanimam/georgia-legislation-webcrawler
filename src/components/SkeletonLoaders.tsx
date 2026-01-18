import { motion } from 'framer-motion'

interface SkeletonProps {
  darkMode?: boolean
}

export function BillCardSkeleton({ darkMode }: SkeletonProps) {
  const baseColor = darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
  const shimmerColor = darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        background: darkMode 
          ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))'
          : 'white',
        border: darkMode ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(0, 0, 0, 0.1)',
        borderRadius: '12px',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Shimmer effect */}
      <motion.div
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(90deg, transparent, ${shimmerColor}, transparent)`,
          pointerEvents: 'none',
        }}
      />

      {/* Bill number */}
      <div
        style={{
          width: '80px',
          height: '20px',
          background: baseColor,
          borderRadius: '4px',
          marginBottom: '12px',
        }}
      />

      {/* Title */}
      <div
        style={{
          width: '100%',
          height: '24px',
          background: baseColor,
          borderRadius: '4px',
          marginBottom: '8px',
        }}
      />
      <div
        style={{
          width: '70%',
          height: '24px',
          background: baseColor,
          borderRadius: '4px',
          marginBottom: '16px',
        }}
      />

      {/* Metadata */}
      <div
        style={{
          width: '50%',
          height: '16px',
          background: baseColor,
          borderRadius: '4px',
          marginBottom: '8px',
        }}
      />
      <div
        style={{
          width: '60%',
          height: '16px',
          background: baseColor,
          borderRadius: '4px',
          marginBottom: '16px',
        }}
      />

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <div
          style={{
            width: '100px',
            height: '36px',
            background: baseColor,
            borderRadius: '8px',
          }}
        />
        <div
          style={{
            width: '40px',
            height: '36px',
            background: baseColor,
            borderRadius: '8px',
          }}
        />
      </div>
    </motion.div>
  )
}

export function BillGridSkeleton({ darkMode, count = 6 }: SkeletonProps & { count?: number }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '20px',
        marginTop: '32px',
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <BillCardSkeleton key={index} darkMode={darkMode} />
      ))}
    </div>
  )
}

export function StatsSkeleton({ darkMode }: SkeletonProps) {
  const baseColor = darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}
    >
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            background: darkMode
              ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))'
              : 'rgba(255, 255, 255, 0.8)',
            border: darkMode ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(0, 0, 0, 0.1)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '60%',
              height: '32px',
              background: baseColor,
              borderRadius: '4px',
              margin: '0 auto 8px',
            }}
          />
          <div
            style={{
              width: '40%',
              height: '16px',
              background: baseColor,
              borderRadius: '4px',
              margin: '0 auto',
            }}
          />
        </div>
      ))}
    </div>
  )
}
