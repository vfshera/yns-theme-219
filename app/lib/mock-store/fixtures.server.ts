import type {
  Category,
  Collection,
  LegalPage,
  MeResponse,
  Post,
  Product,
  SocialsResponse,
  Store,
} from "./types";
import type { JSONContent } from "@tiptap/core";

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

// Small builders keep the Tiptap JSON readable while producing real node/mark shapes.
const textNode = (
  value: string,
  marks?: JSONContent["marks"],
): JSONContent => ({
  type: "text",
  text: value,
  ...(marks ? { marks } : {}),
});

const paragraphNode = (...content: JSONContent[]): JSONContent => ({
  type: "paragraph",
  content,
});

const headingNode = (level: 2 | 3, ...content: JSONContent[]): JSONContent => ({
  type: "heading",
  attrs: { level },
  content,
});

const listNode = (
  type: "bulletList" | "orderedList",
  ...items: string[]
): JSONContent => ({
  type,
  content: items.map((item) => ({
    type: "listItem",
    content: [paragraphNode(textNode(item))],
  })),
});

const POSTS = [
  {
    id: "post-slower-stationery",
    slug: "a-slower-kind-of-stationery",
    title: "A slower kind of stationery",
    active: true,
    tag: "Journal",
    image: PHOTOS[0],
    publishedAt: "2026-02-18T09:00:00.000Z",
    createdAt: "2026-02-16T00:00:00.000Z",
    updatedAt: "2026-02-18T09:00:00.000Z",
    seo: null,
    content: {
      type: "doc",
      content: [
        paragraphNode(
          textNode("Good tools make the everyday "),
          textNode("quieter", [{ type: "italic" }]),
          textNode(". Here is what we keep on our own desk."),
        ),
        headingNode(2, textNode("What we reach for")),
        paragraphNode(
          textNode("The "),
          textNode("Pastel Stationery Set", [{ type: "bold" }]),
          textNode(" is the starting point — "),
          textNode("simple", [{ type: "strike" }]),
          textNode(" considered, and made to be used."),
        ),
        listNode(
          "bulletList",
          "A notebook that opens flat",
          "One pen you actually like holding",
          "A surface worth clearing first",
        ),
        headingNode(3, textNode("A note on colour")),
        paragraphNode(
          textNode("Soft tones "),
          textNode("set the mood", [
            {
              type: "textStyle",
              attrs: {
                color: "#7c6f64",
                fontFamily: "Newsreader",
                fontSize: "18px",
                lineHeight: "1.6",
              },
            },
          ]),
          textNode(" without asking for attention."),
          { type: "hardBreak" },
          textNode("Inline "),
          textNode("code", [{ type: "code" }]),
          textNode(" and a "),
          textNode("link to the FAQ", [
            { type: "link", attrs: { href: "/faq" } },
          ]),
          textNode("."),
        ),
        { type: "paragraph" },
        {
          type: "blockquote",
          content: [
            paragraphNode(textNode("Fewer, better things for everyday life.")),
          ],
        },
        { type: "codeBlock", content: [textNode("make room for less")] },
        { type: "horizontalRule" },
        {
          type: "image",
          attrs: { src: PHOTOS[0], alt: "Pastel stationery on a desk" },
        },
        {
          type: "imageResize",
          attrs: {
            src: PHOTOS[1],
            alt: "Pastel bags",
            width: 480,
            height: 320,
          },
        },
        {
          type: "youtube",
          attrs: { src: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
        },
        {
          type: "productEmbed",
          attrs: {
            productIds: ["canvas-tote-bag", "pastel-stationery-set"],
            variantIds: { "canvas-tote-bag": "v-canvas-tote-bag" },
          },
        },
        paragraphNode(textNode("Back to browsing.")),
      ],
    },
  },
  {
    id: "post-rooms-that-breathe",
    slug: "rooms-that-breathe",
    title: "Rooms that breathe",
    active: true,
    tag: "Home",
    image: PHOTOS[5],
    publishedAt: "2026-01-28T09:00:00.000Z",
    createdAt: "2026-01-26T00:00:00.000Z",
    updatedAt: "2026-01-28T09:00:00.000Z",
    seo: {
      title: "Rooms that breathe | Lazora",
      description: "A short guide to calmer corners of the home.",
      canonical: "/blog/rooms-that-breathe",
    },
    content: {
      type: "doc",
      content: [
        paragraphNode(
          textNode("A calm room starts with "),
          textNode("less", [{ type: "bold" }]),
          textNode(" and a little more light."),
        ),
        headingNode(2, textNode("Start with one corner")),
        listNode(
          "orderedList",
          "Clear the surface",
          "Keep what you use",
          "Add one thing you love",
        ),
        {
          type: "image",
          attrs: { src: PHOTOS[5], alt: "A quiet room accent" },
        },
        paragraphNode(
          textNode("See the "),
          textNode("home collection", [
            { type: "link", attrs: { href: "/category/home" } },
          ]),
          textNode(" for pieces that fit."),
        ),
      ],
    },
  },
  {
    id: "post-why-we-edit",
    slug: "why-we-edit",
    title: "Why we edit",
    active: true,
    tag: "About",
    image: PHOTOS[2],
    publishedAt: "2025-12-12T09:00:00.000Z",
    createdAt: "2025-12-10T00:00:00.000Z",
    updatedAt: "2025-12-12T09:00:00.000Z",
    seo: null,
    content: {
      type: "doc",
      content: [
        paragraphNode(
          textNode("A small range is easier to "),
          textNode("understand", [{ type: "italic" }]),
          textNode(" — and easier to love."),
        ),
        headingNode(2, textNode("The edit")),
        paragraphNode(
          textNode("Every piece has to earn its place. "),
          textNode("Read our story", [
            { type: "link", attrs: { href: "/about" } },
          ]),
          textNode(" to see how we choose."),
        ),
      ],
    },
  },
] satisfies Post[];

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
    // Store feature flags: turning `blog` or `contactForm` off gates their routes
    // To a 404 (and hides their footer links) exactly as in the source theme.
    enabledTools: { blog: true, contactForm: true },
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
  posts: POSTS,
  products: PRODUCTS,
  socials: SOCIALS,
  me: (origin: string): MeResponse => ({
    store: STORE,
    storeBaseUrl: origin,
    publicUrl: origin,
  }),
};
