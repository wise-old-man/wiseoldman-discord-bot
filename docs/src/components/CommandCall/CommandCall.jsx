import clsx from 'clsx';
import React from 'react';
import styles from './CommandCall.module.css';

const CommandCall = props => {
  const { commandRoot, options } = props;

  return (
    <div className={styles.container}>
      <span className={styles.commandRoot}>{commandRoot}</span>
      {options?.map(option => (
        <div key={option.key} className={styles.option}>
          <div className={styles.optionKey}>{option.key}</div>
          <div className={clsx(styles.optionValue, { [styles.channel]: option.value.startsWith('#') })}>
            {option.value}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommandCall;
