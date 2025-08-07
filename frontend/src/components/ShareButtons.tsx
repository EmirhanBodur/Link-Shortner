import { FaTwitter, FaWhatsapp, FaEnvelope } from "react-icons/fa";
import { motion } from "framer-motion";

type ShareButtonsProps = {
  url: string;
};

export const ShareButtons = ({ url }: ShareButtonsProps) => {
  const text = `İşte kısaltılmış linkim: ${url}`;
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
    url
  )}&text=${encodeURIComponent("İşte kısaltılmış linkim:")}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    text
  )}`;
  const mailUrl = `mailto:?subject=Kısaltılmış Link&body=${encodeURIComponent(
    text
  )}`;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-600"
    >
      <p className="text-sm text-slate-500 dark:text-slate-400 mr-2">Paylaş:</p>
      <motion.a
        variants={itemVariants}
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
      >
        <FaTwitter className="text-slate-600 dark:text-slate-300" size={18} />
      </motion.a>
      <motion.a
        variants={itemVariants}
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
      >
        <FaWhatsapp className="text-slate-600 dark:text-slate-300" size={18} />
      </motion.a>
      <motion.a
        variants={itemVariants}
        href={mailUrl}
        className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
      >
        <FaEnvelope className="text-slate-600 dark:text-slate-300" size={18} />
      </motion.a>
    </motion.div>
  );
};
