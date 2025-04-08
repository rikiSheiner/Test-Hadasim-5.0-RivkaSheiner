import React from "react";
import styles from "../../styles/supplier/ProductsSection.module.css";

// רכיב מוצרים של ספק / המוצרים שהוא משווק
const ProductsSection = ({ products }) => (
  <div className={styles.productsWrapper}>
    <h2 className={styles.sectionTitle}>המוצרים שלי</h2>

    <div className={styles.cardGrid}>
      {products.map((product) => (
        <div key={product.id} className={styles.productCard}>
          <h3 className={styles.productName}>{product.product_name}</h3>
          <p> מחיר ליחידה: ₪{product.price}</p>
          <p> כמות מינימלית: {product.min_quantity}</p>
        </div>
      ))}
    </div>
  </div>
);

export default ProductsSection;
