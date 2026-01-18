import { motion } from 'framer-motion'

interface SkeletonCardProps {
  darkMode: boolean
}

export default function SkeletonCard({ darkMode }: SkeletonCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        background: darkMode ? 'rgba(58, 47, 45, 0.8)' : 'rgba(255, 255, 255, 0.98)',
        borderRadius: '16px',
        padding: '24px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: 'var(--shadow-md)',
        height: '280px',
      }}
    >
      {/* Bill Number Skeleton */}
      <div
        style={{
          height: '24px',
          width: '30%',
          background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          borderRadius: '4px',
          marginBottom: '12px',
        }}
      />

      {/* Title Skeleton */}
      <div style={{ marginBottom: '16px' }}>
        <div
          style={{
            height: '20px',
            width: '90%',
            background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            animationDelay: '0.1s',
            borderRadius: '4px',
            marginBottom: '8px',
          }}
        />
        <div
          style={{
            height: '20px',
            width: '70%',
            background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            animationDelay: '0.2s',
            borderRadius: '4px',
          }}
        />
      </div>

      {/* Tags Skeleton */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {[40, 50, 35].map((width, i) => (
          <div
            key={i}
            style={{
              height: '24px',
              width: `${width}%`,
              background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
              animationDelay: `${i * 0.1}s`,
              borderRadius: '12px',
            }}
          />
        ))}
      </div>

      {/* Summary Lines Skeleton */}
      <div style={{ marginBottom: '16px' }}>
        {[100, 95, 80].map((width, i) => (
          <div
            key={i}
            style={{
              height: '16px',
              width: `${width}%`,
              background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
              animationDelay: `${i * 0.1}s`,
              borderRadius: '4px',
              marginBottom: '6px',
            }}
          />
        ))}
      </div>

      {/* Bottom Info Skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
        <div
          style={{
            height: '16px',
            width: '40%',
            background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            borderRadius: '4px',
          }}
        />
        <div
          style={{
            height: '32px',
            width: '32px',
            background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            borderRadius: '50%',
          }}
        />
      </div>

      <style>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </motion.div>
  )
}
