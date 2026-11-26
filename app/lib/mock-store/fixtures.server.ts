import type {
  Category,
  Collection,
  LegalPage,
  MeResponse,
  Post,
  Product,
  ProductVariant,
  SocialsResponse,
  Store,
  SubscriptionPlan,
} from "./types";
import type { JSONContent } from "@tiptap/core";
import type { Bundle, BundleGroup, BundleItem } from "~/lib/bundles/types";
import type { VariantCombination } from "~/lib/variants/types";

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

const color = (
  id: string,
  value: string,
  colorValue: string,
  position: number,
): VariantCombination => ({
  variantValue: {
    id,
    value,
    colorValue,
    position,
    variantType: { id: "vt-color", type: "color", label: "Color" },
  },
});

const size = (
  id: string,
  value: string,
  position: number,
): VariantCombination => ({
  variantValue: {
    id,
    value,
    colorValue: null,
    position,
    variantType: { id: "vt-size", type: "string", label: "Size" },
  },
});

/** Prices are minor-unit strings, exactly as the real Store API returns them. */
const makeProduct = (
  id: string,
  name: string,
  price: string,
  image: string,
  categoryId: string,
  variants?: ProductVariant[],
): Product => ({
  id,
  name,
  slug: id,
  type: "product",
  status: "published",
  images: [image],
  summary: null,
  content: null,
  volumePricingTiers: null,
  category: CATEGORIES.find((category) => category.id === categoryId) ?? null,
  subscriptionMode: "optional",
  subscriptionPlanProducts: [],
  bundlePriceMode: "percent",
  bundleFixedPriceAmount: null,
  bundleFixedPriceAmountGross: null,
  bundleAmountOffAmount: null,
  bundleAmountOffAmountGross: null,
  bundleDiscountPercentage: null,
  variants: variants ?? [
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

/** Two products carry real options; combinations are always listed Color then Size. */
const STATIONERY_VARIANTS = [
  {
    id: "v-pastel-stationery-set",
    price: "2400",
    priceGross: "2400",
    stock: 10,
    images: [PHOTOS[0]],
    combinations: [
      color("vv-blush", "Blush", "#E8B4B8", 0),
      size("vv-a5", "A5", 0),
    ],
  },
  {
    id: "v-pastel-stationery-set-blush-a4",
    price: "3200",
    priceGross: "3200",
    stock: 10,
    images: [PHOTOS[0]],
    combinations: [
      color("vv-blush", "Blush", "#E8B4B8", 0),
      size("vv-a4", "A4", 1),
    ],
  },
  {
    id: "v-pastel-stationery-set-sage-a5",
    price: "2400",
    priceGross: "2400",
    stock: 10,
    images: [PHOTOS[4]],
    combinations: [
      color("vv-sage", "Sage", "#B7C9B1", 1),
      size("vv-a5", "A5", 0),
    ],
  },
  {
    id: "v-pastel-stationery-set-sage-a4",
    price: "3200",
    priceGross: "3200",
    stock: 10,
    images: [PHOTOS[4]],
    combinations: [
      color("vv-sage", "Sage", "#B7C9B1", 1),
      size("vv-a4", "A4", 1),
    ],
  },
] satisfies ProductVariant[];

const TOTE_VARIANTS = [
  {
    id: "v-canvas-tote-bag",
    price: "3200",
    priceGross: "3200",
    stock: 10,
    images: [PHOTOS[1]],
    combinations: [color("vv-natural", "Natural", "#E8DCC8", 0)],
  },
  {
    id: "v-canvas-tote-bag-rose",
    price: "3200",
    priceGross: "3200",
    stock: 10,
    images: [PHOTOS[4]],
    combinations: [color("vv-rose", "Rose", "#E8B4B8", 1)],
  },
] satisfies ProductVariant[];

const STATIONERY_PLANS: SubscriptionPlan[] = [
  {
    id: "plan-monthly",
    name: "Every month",
    discountPercent: 10,
    benefits: "Delivered monthly, cancel anytime",
    active: true,
    position: 0,
  },
  {
    id: "plan-quarterly",
    name: "Every 3 months",
    discountPercent: 15,
    benefits: "A slower cadence, a bigger saving",
    active: true,
    position: 1,
  },
];

const NOTE_PAD_PLANS: SubscriptionPlan[] = [
  {
    id: "plan-note-pad-monthly",
    name: "Every month",
    discountPercent: 10,
    benefits: "A fresh pad every month",
    active: true,
    position: 0,
  },
];

const stationerySet: Product = {
  ...makeProduct(
    "pastel-stationery-set",
    "Pastel Stationery Set",
    "2400",
    PHOTOS[0],
    "cat-stationery",
    STATIONERY_VARIANTS,
  ),
  // Two product photos give the media gallery a thumbnail strip; variants add their own.
  images: [PHOTOS[0], PHOTOS[4]],
  // Product-wide tiers: 3+ at $22, 5+ at $20. Variant prices stay unchanged for qty 1.
  volumePricingTiers: [
    {
      id: "tier-stationery-3",
      price: "2200",
      priceGross: "2200",
      minQuantity: 3,
      maxQuantity: 4,
      productVariantId: null,
    },
    {
      id: "tier-stationery-5",
      price: "2000",
      priceGross: "2000",
      minQuantity: 5,
      maxQuantity: null,
      productVariantId: null,
    },
  ],
  subscriptionPlanProducts: STATIONERY_PLANS.map((subscriptionPlan) => ({
    subscriptionPlan,
  })),
};
const toteBag = makeProduct(
  "canvas-tote-bag",
  "Canvas Tote Bag",
  "3200",
  PHOTOS[1],
  "cat-accessories",
  TOTE_VARIANTS,
);
const linenShirt: Product = {
  ...makeProduct(
    "linen-shirt",
    "Linen Shirt",
    "4900",
    PHOTOS[2],
    "cat-accessories",
  ),
  // The one fixture on sale: $55.00 list against a $49.00 selling price.
  variants: [
    {
      id: "v-linen-shirt",
      price: "4900",
      priceGross: "4900",
      originalPrice: "5500",
      originalPriceGross: "5500",
      stock: 10,
      images: [],
      combinations: [],
    },
  ],
};
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
const roomAccent: Product = {
  ...makeProduct("room-accent", "Room Accent", "5800", PHOTOS[5], "cat-home"),
  // The unlimited-stock fixture: null is never sold out and never quantity-capped.
  variants: [
    {
      id: "v-room-accent",
      price: "5800",
      priceGross: "5800",
      stock: null,
      images: [],
      combinations: [],
    },
  ],
};

const notePad: Product = {
  ...makeProduct(
    "note-pad",
    "Pastel Note Pad",
    "1200",
    PHOTOS[0],
    "cat-stationery",
  ),
  subscriptionMode: "only",
  subscriptionPlanProducts: NOTE_PAD_PLANS.map((subscriptionPlan) => ({
    subscriptionPlan,
  })),
};

const PRODUCTS = [
  stationerySet,
  toteBag,
  linenShirt,
  sunglasses,
  stillLifePrint,
  roomAccent,
  notePad,
  makeProduct(
    "weekend-bag",
    "Weekend Bag",
    "6400",
    PHOTOS[1],
    "cat-accessories",
  ),
] satisfies Product[];

/** Bundle items resolve from the ordinary products so prices, stock and options stay in sync. */
const bundleItem = (
  variantId: string,
  config: Pick<BundleItem, "position" | "label"> &
    Partial<
      Pick<
        BundleItem,
        "forced" | "defaultSelected" | "fixedQuantity" | "maxQuantity"
      >
    >,
): BundleItem => {
  const match = PRODUCTS.flatMap((product) =>
    product.variants.map((variant) => ({ product, variant })),
  ).find(({ variant }) => variant.id === variantId);

  if (!match) {
    throw new Error(`Unknown bundle variant: ${variantId}`);
  }

  const { product, variant } = match;

  return {
    variantId,
    position: config.position,
    label: config.label,
    forced: config.forced ?? false,
    defaultSelected: config.defaultSelected ?? false,
    fixedQuantity: config.fixedQuantity ?? 1,
    maxQuantity: config.maxQuantity ?? null,
    price: variant.price,
    priceGross: variant.priceGross,
    stock: variant.stock,
    images: variant.images.length ? variant.images : product.images,
    options: variant.combinations.map(({ variantValue }) => ({
      type: variantValue.variantType.label,
      value: variantValue.value,
      colorValue: variantValue.colorValue,
    })),
    productSlug: product.slug,
  };
};

const bundleGroup = (
  id: string,
  name: string,
  position: number,
  minQuantity: number,
  maxQuantity: number | null,
  allowDuplicates: boolean,
  items: BundleItem[],
): BundleGroup => ({
  id,
  name,
  position,
  minQuantity,
  maxQuantity,
  allowDuplicates,
  items,
});

/** Percent-priced bundle: forced print, pick-one stationery, up to two bags. */
const DESK_BUNDLE: Bundle = {
  discountPercentage: 15,
  groups: [
    bundleGroup("grp-desk-print", "Included", 0, 1, 1, false, [
      bundleItem("v-still-life-print", {
        position: 0,
        label: "Still Life Print",
        forced: true,
        fixedQuantity: 1,
      }),
    ]),
    bundleGroup("grp-desk-paper", "Choose your stationery", 1, 1, 1, false, [
      bundleItem("v-pastel-stationery-set", {
        position: 0,
        label: "Blush / A5",
        defaultSelected: true,
      }),
      bundleItem("v-pastel-stationery-set-sage-a5", {
        position: 1,
        label: "Sage / A5",
      }),
    ]),
    bundleGroup("grp-desk-bag", "Add a bag", 2, 0, 2, true, [
      bundleItem("v-canvas-tote-bag", {
        position: 0,
        label: "Canvas Tote Bag · Natural",
      }),
      bundleItem("v-canvas-tote-bag-rose", {
        position: 1,
        label: "Canvas Tote Bag · Rose",
      }),
      bundleItem("v-weekend-bag", { position: 2, label: "Weekend Bag" }),
    ]),
  ],
};

/** Fixed-priced bundle: the price stays $89.00 as picks change. */
const WEEKEND_BUNDLE: Bundle = {
  discountPercentage: null,
  groups: [
    bundleGroup("grp-weekend-print", "Included", 0, 1, 1, false, [
      bundleItem("v-still-life-print", {
        position: 0,
        label: "Still Life Print",
        forced: true,
        fixedQuantity: 1,
      }),
    ]),
    bundleGroup("grp-weekend-bag", "Choose your bag", 1, 1, 1, false, [
      bundleItem("v-weekend-bag", {
        position: 0,
        label: "Weekend Bag",
        defaultSelected: true,
      }),
      bundleItem("v-canvas-tote-bag", {
        position: 1,
        label: "Canvas Tote Bag · Natural",
      }),
    ]),
    bundleGroup("grp-weekend-extra", "Add an extra", 2, 0, 1, false, [
      bundleItem("v-yellow-sunglasses", {
        position: 0,
        label: "Yellow Sunglasses",
      }),
      bundleItem("v-linen-shirt", { position: 1, label: "Linen Shirt" }),
    ]),
  ],
};

const deskEditBundle: Product = {
  ...makeProduct(
    "desk-edit-bundle",
    "Desk Edit Bundle",
    "5015",
    PHOTOS[4],
    "cat-stationery",
  ),
  type: "bundle",
  bundle: DESK_BUNDLE,
  bundlePriceMode: "percent",
  bundleDiscountPercentage: 15,
};

const weekendEscapeBundle: Product = {
  ...makeProduct(
    "weekend-escape-bundle",
    "Weekend Escape Bundle",
    "8900",
    PHOTOS[1],
    "cat-accessories",
  ),
  type: "bundle",
  bundle: WEEKEND_BUNDLE,
  bundlePriceMode: "fixed",
  bundleFixedPriceAmount: "8900",
  bundleFixedPriceAmountGross: "8900",
};

const ALL_PRODUCTS = [
  ...PRODUCTS,
  deskEditBundle,
  weekendEscapeBundle,
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
    enabledTools: {
      blog: true,
      contactForm: true,
      newsletter: true,
      newsletterPopup: true,
    },
    newsletterPopup: {
      delaySeconds: 30,
      heading: "Unlock 20% Off",
      subheading:
        "Subscribe to our newsletter and get an exclusive discount on your first order.",
      ctaText: "Get My Discount",
      teaserText: "Unlock 20% Off",
      discountCode: "WELCOME10",
    },
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
  products: ALL_PRODUCTS,
  socials: SOCIALS,
  me: (origin: string): MeResponse => ({
    store: STORE,
    storeBaseUrl: origin,
    publicUrl: origin,
  }),
};
