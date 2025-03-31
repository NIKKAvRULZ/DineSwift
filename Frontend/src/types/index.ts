export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface Restaurant {
  id: string;
  name: string;
  image: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  minimumOrder: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'on_the_way' | 'delivered';
  restaurantId: string;
  restaurantName: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  message: string;
  type: 'order' | 'delivery' | 'promotion';
  createdAt: string;
  read: boolean;
} 