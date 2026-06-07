import {db} from "../../lib/firebase"
import type { Product } from "@/types/products"
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
} from "firebase/firestore"

const PRODUCTS_COLLECTION = "products"

/**
 * Add a new product to Firestore with shopId
 */
export const addProductService = async (
  product: Omit<Product, "id" | "createdAt" | "updatedAt">,
  shopId: string
): Promise<{ id: string; product: Product }> => {
  try {
    const now = new Date().toISOString()
    const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
      ...product,
      shopId,
      createdAt: now,
      updatedAt: now,
    })

    const newProduct: Product = {
      ...product,
      shopId,
      id: docRef.id,
      createdAt: now,
      updatedAt: now,
    }

    return { id: docRef.id, product: newProduct }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to add product"
    throw new Error(message)
  }
}

/**
 * Get all products for a specific shop from Firestore
 */
export const getProductsByShopService = async (shopId: string): Promise<Product[]> => {
  try {
    const q = query(
      collection(db, PRODUCTS_COLLECTION),
      where("shopId", "==", shopId),
    )

    const querySnapshot = await getDocs(q)
    const products: Product[] = []

    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data(),
      } as Product)
    })

    return products
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch products"
    throw new Error(message)
  }
}

/**
 * Update a product in Firestore
 */
export const updateProductService = async (
  productId: string,
  updates: Partial<Product>,
): Promise<void> => {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, productId)
    const now = new Date().toISOString()

    await updateDoc(productRef, {
      ...updates,
      updatedAt: now,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update product"
    throw new Error(message)
  }
}

/**
 * Delete a product from Firestore
 */
export const deleteProductService = async (productId: string): Promise<void> => {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, productId)
    await deleteDoc(productRef)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete product"
    throw new Error(message)
  }
}

/**
 * Get a single product by ID
 */
export const getProductService = async (productId: string): Promise<Product | null> => {
  try {
    const docSnapshot = await getDocs(query(collection(db, PRODUCTS_COLLECTION), where("id", "==", productId)))

    if (docSnapshot.empty) {
      return null
    }

    const docData = docSnapshot.docs[0]
    return {
      id: docData.id,
      ...docData.data(),
    } as Product
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch product"
    throw new Error(message)
  }
}

/**
 * Get all products without filter (for admin view)
 */
export const getAllProductsService = async (): Promise<Product[]> => {
  try {
    const q = query(collection(db, PRODUCTS_COLLECTION))
    const querySnapshot = await getDocs(q)
    const products: Product[] = []

    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data(),
      } as Product)
    })

    return products
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch products"
    throw new Error(message)
  }
}
