import { Link } from 'react-router-dom';
import styles from '../styles/Home.module.css';

// עמוד הבית של האתר 
// מכיל אפשרויות כניסה שונות
const Home = () => {
  return (
    <div className={styles.home}>
      <h1>שיינר מרקט</h1>
      <p>בחר אפשרות כניסה</p>
      <div className={styles.linksContainer}>
        <Link to="/supplier/login" className={styles.link}>ספק</Link>
        <Link to="/owner/login" className={styles.link}>בעל מכולת</Link>
      </div>
    </div>
  );
};

export default Home;
