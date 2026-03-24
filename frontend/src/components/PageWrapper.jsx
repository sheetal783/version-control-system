import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 15, scale: 0.98, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -15, scale: 0.98, filter: 'blur(4px)' }
};

const pageTransition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
  mass: 0.8
};

const PageWrapper = ({ children, className = "" }) => {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      className={`w-full h-full ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default PageWrapper;
