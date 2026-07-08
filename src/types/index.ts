export interface Category {
  id: string | number;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
}

export interface Vendor {
  id: string | number;
  name: string;
  slug: string;
  logo?: string | null;
  category: {
    name: string;
  };
  service_areas: string[] | string;
  verified: boolean;
  phone?: string | null;
  whatsapp_link?: string | null;
  website?: string | null;
  description?: string | null;
  status?: 'pending' | 'published' | 'rejected';
}

export interface UserProfile {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  avatar?: string | null;
}

