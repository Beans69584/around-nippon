import { motion } from 'framer-motion';
import type React from 'react';
import { FaYinYang } from 'react-icons/fa';
import { GiJapan, GiMountainRoad, GiSushis } from 'react-icons/gi';
import styles from '@styles/Spinner.module.scss';

const iconComponents = [FaYinYang, GiJapan, GiSushis, GiMountainRoad];

const Spinner: React.FC = () => {
  return (
    <div className={styles.spinner}>
      {iconComponents.map((Icon, index) => (
        <motion.div
          key={index}
          className={styles.iconWrapper}
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 1.2,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: 'reverse',
            ease: 'easeInOut',
            delay: index * 0.3,
          }}
        >
          <Icon className={styles.icon} />
        </motion.div>
      ))}
    </div>
  );
};

export default Spinner;
