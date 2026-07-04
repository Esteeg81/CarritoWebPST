import productsData from '../data/products.json'
import ProductCard from './ProductCard'
import type { Product } from '../types'

const products = productsData as Product[]

function ProductList() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

export default ProductList
