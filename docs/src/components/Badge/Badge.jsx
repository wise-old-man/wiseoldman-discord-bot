import React from 'react';
import styles from './Badge.module.css';

const Badge = props => {
  const { children } = props;

  return <div className={styles.badge}>{children}</div>;
};

export default Badge;
