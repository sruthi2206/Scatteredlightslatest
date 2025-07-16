import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { tooltipVariants, tooltipThemes } from './animated-tooltip';

interface EmotionDataPoint {
  name: string;
  value: number;
  color: string;
}

interface AnimatedChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  className?: string;
  variant?: keyof typeof tooltipVariants;
  theme?: keyof typeof tooltipThemes;
  valueLabel?: string;
  showIcon?: boolean;
  iconSize?: number;
  animate?: boolean;
}

const AnimatedChartTooltip: React.FC<AnimatedChartTooltipProps> = ({
  active,
  payload,
  label,
  className,
  variant = 'elastic',
  theme = 'glass',
  valueLabel = '',
  showIcon = true,
  iconSize = 12,
  animate = true,
}) => {
  if (!active || !payload || !payload.length) return null;

  const MotionComponent = animate ? motion.div : 'div';

  const renderContent = () => (
    <div className={cn(
      'min-w-[150px] rounded-md p-4',
      tooltipThemes[theme],
      className
    )}>
      <p className="font-medium text-sm mb-2">{label}</p>
      <div className="space-y-2">
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center gap-2">
            {showIcon && (
              <div
                className="rounded-full flex-shrink-0"
                style={{
                  backgroundColor: entry.color,
                  width: iconSize,
                  height: iconSize,
                }}
              />
            )}
            <div className="flex justify-between items-center w-full">
              <span className="text-xs capitalize">{entry.name}:</span>
              <span className="text-xs font-medium ml-2">
                {entry.value}
                {valueLabel}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (!animate) {
    return renderContent();
  }

  return (
    <MotionComponent
      variants={tooltipVariants[variant]}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.2 }}
    >
      {renderContent()}
    </MotionComponent>
  );
};

export interface EmotionTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  theme?: keyof typeof tooltipThemes;
  variant?: keyof typeof tooltipVariants;
}

// Specialized tooltip for emotion charts
export const EmotionTooltip: React.FC<EmotionTooltipProps> = ({
  active,
  payload,
  label,
  theme = 'energy',
  variant = 'bounce'
}) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <AnimatedChartTooltip
      active={active}
      payload={payload}
      label={label}
      theme={theme}
      variant={variant}
      valueLabel="%"
      showIcon={true}
      iconSize={10}
    />
  );
};

// Specialized tooltip for chakra charts
export const ChakraTooltip: React.FC<EmotionTooltipProps> = ({
  active,
  payload,
  label,
  theme = 'aurora',
  variant = 'magic'
}) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <AnimatedChartTooltip
      active={active}
      payload={payload}
      label={label}
      theme={theme}
      variant={variant}
      valueLabel="/10"
      showIcon={true}
    />
  );
};

// Interactive tooltip with hover effects
export const InteractiveTooltip: React.FC<EmotionTooltipProps> = ({
  active,
  payload,
  label,
  theme = 'northern',
  variant = 'bounce'
}) => {
  if (!active || !payload || !payload.length) return null;

  const [hovered, setHovered] = React.useState<number | null>(null);

  return (
    <motion.div
      variants={tooltipVariants[variant]}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn(
        'min-w-[180px] rounded-lg p-4',
        tooltipThemes[theme]
      )}
    >
      <p className="font-medium text-sm mb-3">{label}</p>
      <div className="space-y-3">
        {payload.map((entry: any, index: number) => (
          <motion.div
            key={`item-${index}`}
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            onHoverStart={() => setHovered(index)}
            onHoverEnd={() => setHovered(null)}
          >
            <motion.div
              className="rounded-full flex-shrink-0"
              style={{
                backgroundColor: entry.color,
                width: 10,
                height: 10,
              }}
              animate={{
                scale: hovered === index ? 1.5 : 1,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
            />
            <div className="flex justify-between items-center w-full">
              <span className="text-xs capitalize">{entry.name}:</span>
              <motion.span 
                className="text-xs font-medium ml-2"
                animate={{
                  scale: hovered === index ? 1.1 : 1,
                }}
              >
                {entry.value}%
              </motion.span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default AnimatedChartTooltip;