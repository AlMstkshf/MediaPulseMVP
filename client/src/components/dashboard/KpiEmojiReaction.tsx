import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useKpiEmojiReaction, type KpiEmojiReaction } from '@/lib/emojiReactionService';
import { AnimatePresence, motion } from 'framer-motion';

interface KpiEmojiReactionProps {
  category: string;
  current: number;
  target: number;
  size?: 'sm' | 'md' | 'lg';
  showMessage?: boolean;
}

const KpiEmojiReaction = ({
  category,
  current,
  target,
  size = 'md',
  showMessage = false
}: KpiEmojiReactionProps) => {
  const { t } = useTranslation();
  const { generateReaction } = useKpiEmojiReaction();
  const [reaction, setReaction] = useState<KpiEmojiReaction | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Generate the reaction based on KPI data
    const newReaction = generateReaction(category, current, target);
    setReaction(newReaction);
    
    // Trigger animation
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 1000);
    
    return () => clearTimeout(timer);
  }, [category, current, target, generateReaction]);

  if (!reaction) return null;

  // Size classes
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  // Background color based on intensity
  const bgColorClasses = {
    positive: 'bg-green-100 dark:bg-green-900/30',
    neutral: 'bg-amber-100 dark:bg-amber-900/30',
    negative: 'bg-red-100 dark:bg-red-900/30'
  };

  // Text color based on intensity
  const textColorClasses = {
    positive: 'text-green-700 dark:text-green-300',
    neutral: 'text-amber-700 dark:text-amber-300',
    negative: 'text-red-700 dark:text-red-300'
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <motion.div
          className={`
            cursor-pointer inline-flex items-center justify-center 
            rounded-full p-2 ${bgColorClasses[reaction.intensity]}
            hover:opacity-90 transition-all
          `}
          initial={{ scale: 1 }}
          animate={{ 
            scale: isAnimating ? [1, 1.3, 1] : 1,
            rotate: isAnimating ? [0, 15, -15, 0] : 0
          }}
          transition={{ duration: 0.7 }}
        >
          <span className={sizeClasses[size]}>{reaction.emoji}</span>
        </motion.div>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-4">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-center mb-2">
            <span className="text-4xl">{reaction.emoji}</span>
          </div>
          <p className={`text-center font-medium ${textColorClasses[reaction.intensity]}`}>
            {reaction.message}
          </p>
          <div className="text-sm text-muted-foreground text-center mt-2">
            {t('emojiReactions.currentValue')}: <span className="font-semibold">{current}</span>
            <br />
            {t('emojiReactions.targetValue')}: <span className="font-semibold">{target}</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default KpiEmojiReaction;