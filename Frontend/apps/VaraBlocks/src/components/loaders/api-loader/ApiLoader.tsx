import { useEffect, useState } from 'react';
import styles from './ApiLoader.module.scss';

function ApiLoader() {
  return <p className={styles.loader}>Initializing API</p>;
}

export { ApiLoader };
