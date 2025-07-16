import React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Enhanced tooltip provider with customizable delay
const AnimatedTooltipProvider = ({ 
  children, 
  delayDuration = 300,
  ...props 
}: TooltipPrimitive.TooltipProviderProps & { delayDuration?: number }) => (
  <TooltipPrimitive.Provider delayDuration={delayDuration} {...props}>
    {children}
  </TooltipPrimitive.Provider>
);

const AnimatedTooltip = TooltipPrimitive.Root;

const AnimatedTooltipTrigger = TooltipPrimitive.Trigger;

// Different animation variants
export const tooltipVariants = {
  scale: {
    initial: { opacity: 0, scale: 0.85 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.85 },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
  },
  slideDown: {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  },
  slideRight: {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -10 },
  },
  slideLeft: {
    initial: { opacity: 0, x: 10 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 10 },
  },
  bounce: {
    initial: { opacity: 0, scale: 0.5, y: 10 },
    animate: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 15
      }
    },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.15 } },
  },
  elastic: {
    initial: { opacity: 0, scale: 0.5 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 15
      }
    },
    exit: { opacity: 0, scale: 0.9 },
  },
  flip: {
    initial: { opacity: 0, rotateX: 90 },
    animate: { opacity: 1, rotateX: 0 },
    exit: { opacity: 0, rotateX: 90 },
  },
  magic: {
    initial: { opacity: 0, scale: 0, rotate: -20 },
    animate: { 
      opacity: 1, 
      scale: 1, 
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 10
      }
    },
    exit: { opacity: 0, scale: 0, rotate: 20 },
  }
};

// Styles for different tooltip themes
export const tooltipThemes = {
  default: "bg-popover text-popover-foreground border border-border shadow-md",
  light: "bg-white text-gray-800 border border-gray-200 shadow-md",
  dark: "bg-gray-900 text-white border border-gray-800 shadow-md",
  primary: "bg-primary text-primary-foreground shadow-md",
  success: "bg-green-500 text-white shadow-md",
  warning: "bg-amber-500 text-white shadow-md",
  danger: "bg-red-500 text-white shadow-md",
  purple: "bg-purple-500 text-white shadow-md",
  teal: "bg-teal-500 text-white shadow-md",
  glass: "bg-white/80 backdrop-blur-md text-gray-900 border border-white/20 shadow-md",
  energy: "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md",
  aurora: "bg-gradient-to-r from-green-400 to-teal-500 text-white shadow-md",
  sunset: "bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-md",
  northern: "bg-gradient-to-r from-blue-400 to-purple-500 text-white shadow-md"
};

export interface AnimatedTooltipContentProps 
  extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> {
  variant?: keyof typeof tooltipVariants;
  theme?: keyof typeof tooltipThemes;
  arrow?: boolean;
}

const AnimatedTooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  AnimatedTooltipContentProps
>(({ 
  className, 
  sideOffset = 4, 
  variant = "scale", 
  theme = "default",
  arrow = true,
  children,
  ...props 
}, ref) => (
  <TooltipPrimitive.Portal>
    <AnimatePresence>
      {(props as any).open && (
        <TooltipPrimitive.Content
          ref={ref}
          sideOffset={sideOffset}
          asChild
          {...props}
        >
          <motion.div
            className={cn(
              "z-50 overflow-hidden rounded-md px-3 py-1.5 text-sm shadow-md",
              tooltipThemes[theme],
              className
            )}
            variants={tooltipVariants[variant]}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2 }}
          >
            {children}
            {arrow && (
              <TooltipPrimitive.Arrow 
                className={cn(
                  "fill-current",
                  theme === "default" ? "fill-popover" : 
                  theme === "light" ? "fill-white" :
                  theme === "dark" ? "fill-gray-900" :
                  theme === "glass" ? "fill-white/80" :
                  theme.includes("gradient") ? "hidden" : `fill-${theme}-500`
                )}
                width={11} 
                height={5} 
              />
            )}
          </motion.div>
        </TooltipPrimitive.Content>
      )}
    </AnimatePresence>
  </TooltipPrimitive.Portal>
));

AnimatedTooltipContent.displayName = "AnimatedTooltipContent";

export { 
  AnimatedTooltip, 
  AnimatedTooltipTrigger, 
  AnimatedTooltipContent, 
  AnimatedTooltipProvider 
};