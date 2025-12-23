export interface Service {
  id: number;
  name: string | null;
  cat: string | null;
  price: number;
  rating: number;
  loc: string;
  img: string;
  verified: boolean;
  desc: string | null;
}
