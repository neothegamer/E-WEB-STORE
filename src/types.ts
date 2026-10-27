export type ProductType = 'book' | 'music';

export interface Product {
  id: string;
  type: ProductType;
  title: string;
  slug: string;
  creator: string;
  description: string;
  price: number; // integer, minor units (kobo)
  currency: string;
  coverUrl?: string;
  previewUrl?: string; // music only
  summary?: { text: string }; // books only, present only when published
  meta: { pages?: number; format?: string; durationSec?: number; previewSec?: number };
  categoryIds: string[];
  tags: string[];
  featured: boolean;
  status: 'draft' | 'published';
  createdAt: string;
}

export interface User { id: string; name: string; email: string; role: 'buyer' | 'admin' }
export interface Category { id: string; name: string; slug: string; type: ProductType | 'both' }
export interface OrderItem { productId: string; title: string; price: number }
export interface Order {
  id: string;
  reference: string;
  items: OrderItem[];
  total: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'cancelled';
  createdAt: string;
  paidAt?: string;
}
export interface LibraryItem { product: Product; acquiredAt: string }

export interface ProductQuery {
  type?: ProductType;
  category?: string; // category slug
  q?: string;
  sort?: 'newest' | 'price_asc' | 'price_desc';
  page?: number;
  limit?: number;
}
export interface ProductPage { items: Product[]; total: number; page: number; pages: number }

export type SummaryStatus = 'pending' | 'ready' | 'published' | 'failed';
export interface AdminProduct extends Product {
  files: { cover?: string; file?: string; preview?: string };
  summaryAdmin?: { text: string; status: SummaryStatus; error?: string; edited: boolean };
}
export interface ProductInput { type: ProductType; title: string; creator: string; description: string; price: number; categoryIds: string[] }
export interface AdminProductQuery { type?: ProductType; status?: 'draft' | 'published'; review?: boolean; q?: string }
export interface AdminOrder extends Order { userEmail: string }
export interface AdminUser extends User { createdAt: string; itemsCount: number }
export interface AdminStats { revenue: number; orders: number; products: number; summariesToReview: number; recentOrders: AdminOrder[] }
export interface AppSettings { autoPublishSummaries: boolean }
export type FileKind = 'cover' | 'file' | 'preview';
