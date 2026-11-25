import type {
  Category,
  Collection,
  LegalPage,
  MeResponse,
  Product,
  SocialsResponse,
  Store,
} from "./types";

const PHOTOS = [
  "/images/pexels/pastel-stationery.jpg",
  "/images/pexels/bags-pastel.jpg",
  "/images/pexels/folded-shirts.jpg",
  "/images/pexels/sunglasses-yellow.jpg",
  "/images/pexels/pastel-still-life.jpg",
  "/images/pexels/about-room.jpg",
] as const;

const CATEGORIES = [
  {
    id: "cat-stationery",
    name: "Stationery",
    slug: "stationery",
    parentId: null,
    image: null,
    description: null,
  },
  {
    id: "cat-accessories",
    name: "Accessories",
    slug: "accessories",
    parentId: null,
    image: null,
    description: null,
  },
  {
    id: "cat-home",
    name: "Home",
    slug: "home",
    parentId: null,
    image: null,
    description: null,
  },
] satisfies Category[];

/** Prices are minor-unit strings, exactly as the real Store API returns them. */
const makeProduct = (
  id: string,
  name: string,
  price: string,
  image: string,
  categoryId: string,
): Product => ({
  id,
  name,
  slug: id,
  type: "product",
  status: "published",
  images: [image],
  summary: null,
  content: null,
  category: CATEGORIES.find((category) => category.id === categoryId) ?? null,
  subscriptionMode: "optional",
  variants: [
    {
      id: `v-${id}`,
      price,
      priceGross: price,
      stock: 10,
      images: [],
      combinations: [],
    },
  ],
});

const stationerySet = makeProduct(
  "pastel-stationery-set",
  "Pastel Stationery Set",
  "2400",
  PHOTOS[0],
  "cat-stationery",
);
const toteBag = makeProduct(
  "canvas-tote-bag",
  "Canvas Tote Bag",
  "3200",
  PHOTOS[1],
  "cat-accessories",
);
const linenShirt = makeProduct(
  "linen-shirt",
  "Linen Shirt",
  "4900",
  PHOTOS[2],
  "cat-accessories",
);
const sunglasses = makeProduct(
  "yellow-sunglasses",
  "Yellow Sunglasses",
  "2700",
  PHOTOS[3],
  "cat-accessories",
);
const stillLifePrint = makeProduct(
  "still-life-print",
  "Still Life Print",
  "3500",
  PHOTOS[4],
  "cat-home",
);
const roomAccent = makeProduct(
  "room-accent",
  "Room Accent",
  "5800",
  PHOTOS[5],
  "cat-home",
);

const PRODUCTS = [
  stationerySet,
  toteBag,
  linenShirt,
  sunglasses,
  stillLifePrint,
  roomAccent,
  makeProduct(
    "note-pad",
    "Pastel Note Pad",
    "1200",
    PHOTOS[0],
    "cat-stationery",
  ),
  makeProduct(
    "weekend-bag",
    "Weekend Bag",
    "6400",
    PHOTOS[1],
    "cat-accessories",
  ),
] satisfies Product[];

const COLLECTIONS = [
  {
    id: "col-pastel",
    name: "Pastel Favourites",
    slug: "pastel-favourites",
    image: null,
    description: null,
    productCollections: [{ product: stationerySet }],
    metafieldRules: [],
  },
  {
    id: "col-home",
    name: "For the Home",
    slug: "for-the-home",
    image: null,
    description: null,
    productCollections: [{ product: stillLifePrint }],
    metafieldRules: [],
  },
] satisfies Collection[];

const LEGAL_PAGES = [
  {
    id: "legal-terms",
    key: "terms",
    label: "Terms of Service",
    href: "/terms",
    updatedAt: "2026-01-15T00:00:00.000Z",
    contentMarkdown: `## Using this store
By placing an order with Lazora you agree to these terms. They cover how we sell our products and what you can expect from us.

## Orders and prices
- Prices are shown in USD and include tax where applicable.
- We accept payment at checkout and send a confirmation once an order is placed.
- **Orders cannot be changed** after they have been submitted.

If something looks wrong with your order, please get in touch as soon as possible.`,
  },
  {
    id: "legal-privacy",
    key: "privacyPolicy",
    label: "Privacy Policy",
    href: "/privacy-policy",
    updatedAt: "2026-01-15T00:00:00.000Z",
    contentMarkdown: `## What we collect
We keep only the details needed to process your order and answer your questions: your name, email address, delivery address and payment confirmation.

## How we use it
- To fulfil and deliver your order.
- To reply to messages you send us.
- To improve the store and avoid duplicate orders.

We never sell your details. Questions about your data? See our [FAQ](/faq) or contact us.`,
  },
  {
    id: "legal-returns",
    key: "returns",
    label: "Returns & Refunds",
    href: "/returns",
    updatedAt: "2026-01-15T00:00:00.000Z",
    contentMarkdown: `## Returns
If an item is not right, contact us within 30 days of delivery and we will arrange a return. Items should be unused and in their original packaging.

## Refunds
Once we receive the return, we refund the purchase price to your original payment method. Shipping costs are not refundable unless the item arrived damaged.

For damaged or incorrect items, include photos in your message so we can help quickly.`,
  },
] satisfies LegalPage[];

const STORE = {
  name: "Lazora",
  currency: "USD",
  locale: "en-US",
  taxBehavior: "inclusive",
  subdomain: "lazora",
  settings: {
    storeDescription:
      "Considered things for everyday living, in soft colours and simple shapes.",
    freeShippingThreshold: "5000",
    // Store feature flags: turning `contactForm` off gates /contact to a 404
    // (and hides its footer/About links) exactly as it does in the source theme.
    enabledTools: { blog: false, contactForm: true },
    defaultLanguage: null,
    enabledLanguages: {},
  },
} satisfies Store;

const SOCIALS = {
  socials: {
    email: null,
    instagram: "https://instagram.com",
    linkedin: null,
    x: null,
    facebook: null,
    youtube: null,
    tiktok: null,
  },
} satisfies SocialsResponse;

export const fixtures = {
  categories: CATEGORIES,
  collections: COLLECTIONS,
  legalPages: LEGAL_PAGES,
  products: PRODUCTS,
  socials: SOCIALS,
  me: (origin: string): MeResponse => ({
    store: STORE,
    storeBaseUrl: origin,
    publicUrl: origin,
  }),
};
