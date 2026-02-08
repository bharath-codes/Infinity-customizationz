const mongoose = require('mongoose');
const Product = require('./models/product');
const Category = require('./models/category');
const Admin = require('./models/admin');
require('dotenv').config();

const products = [
  // ===== CATEGORY 1: PHOTO FRAMES (17 Products) =====
  { 
    _id: "f1",
    categoryId: "frames", 
    name: "4x6 Black Premium Frame", 
    price: 199, 
    image: "/images/4 x 6 black frame 199.jpg", 
    images: ["/images/4 x 6 black frame 199.jpg", "/images/4 x 6 p2.jpg", "/images/4 x 6 p3.jpg", "/images/4 x 6 p4.jpg"],
    description: "Classic black wooden frame perfect for 4x6 photos. Premium quality with glass protection.",
    inStock: true 
  },
  { 
    _id: "f1b",
    categoryId: "frames", 
    name: "4x6 White Premium Frame", 
    price: 199, 
    image: "/images/4 x 6 white frame 199.jpg", 
    images: ["/images/4 x 6 white frame 199.jpg"],
    description: "Elegant white frame for 4x6 prints. Modern and minimalist design.",
    inStock: true 
  },
  { 
    _id: "f2",
    categoryId: "frames", 
    name: "4x4 Compact Frame", 
    price: 149, 
    image: "/images/4 x 4 149.jpg", 
    images: ["/images/4 x 4 149.jpg"],
    description: "Small square frame for miniature photos or artwork. Perfect for desks.",
    inStock: true 
  },
  { 
    _id: "f3",
    categoryId: "frames", 
    name: "5x7 White Frame", 
    price: 299, 
    image: "/images/white frame1.jpg", 
    images: ["/images/white frame1.jpg", "/images/white frame2.jpg"],
    description: "Beautiful white wooden frame for 5x7 photos. Perfect for shelves and walls.",
    inStock: true 
  },
 
  { 
    _id: "f13",
    categoryId: "frames", 
    name: "8x12 Black Frame 1 Inch", 
    price: 599, 
    image: "/images/modi.jpg", 
    images: ["/images/modi.jpg", "/images/1nch.jpg"],
    description: "Premium 8x12 black frame with 1 inch border. Perfect for large photo displays.",
    inStock: true 
  },
  { 
    _id: "f14",
    categoryId: "frames", 
    name: "8x12 Black Frame Half Inch", 
    price: 499, 
    image: "/images/half inch2.jpg", 
    images: ["/images/half inch2.jpg", "/images/8 x 12 (1_2 inch) 499.jpg", "/images/8 x 12 599(1_2 inch).jpg"],
    description: "Elegant 8x12 black frame with half inch border. Slim and modern design.",
    inStock: true 
  },
  { 
    _id: "f15",
    categoryId: "frames", 
    name: "8x12 Mount Frame", 
    price: 699, 
    image: "/images/8x12-mount-frame.jpg", 
    images: ["/images/8 x 12 mount.jpg"],
    description: "Premium 8x12 mount frame with professional finish. Perfect for gallery walls.",
    inStock: true 
  },
  { 
    _id: "f5",
    categoryId: "frames", 
    name: "10x12 Modern Frame", 
    price: 1299, 
    image: "/images/10 x 12 frame 1299.jpg", 
    images: ["/images/10 x 12 frame 1299.jpg"],
    description: "Contemporary 10x12 frame for statement wall displays.",
    inStock: true 
  },
  { 
    _id: "f6",
    categoryId: "frames", 
    name: "12x18 Premium Mount Frame", 
    price: 2199, 
    image: "/images/12x18 main.jpg", 
    images: ["/images/12x18 main.jpg", "/images/12 x 18 mount 2199(1).jpg", "/images/12 x 18 mount 2199(2).jpg"],
    description: "Large premium 12x18 frame with professional mount. Perfect for gallery walls.",
    inStock: true 
  },
  { 
    _id: "f7",
    categoryId: "frames", 
    name: "12x18 Brown Frame", 
    price: 1499, 
    image: "/images/frame brown.jpeg", 
    images: ["/images/frame brown.jpeg", "/images/12 x 18 1499 .jpg"],
    description: "Elegant 12x18 frame available in warm brown and classic styles. Perfect for all photo types.",
    inStock: true 
  },
  { 
    _id: "f9",
    categoryId: "frames", 
    name: "12x18 Milestone Frame", 
    price: 1499, 
    image: "/images/12 x 18 milestone .jpg", 
    images: ["/images/12 x 18 milestone .jpg"],
    description: "Special milestone frame for celebrating important moments.",
    inStock: true 
  },
 
  { 
    _id: "f11",
    categoryId: "frames", 
    name: "12x18 Collage Frame", 
    price: 3999, 
    image: "/images/collage frame 3999.jpg", 
    images: ["/images/collage frame 3999.jpg"],
    description: "Large collage frame perfect for displaying multiple photos. Holds multiple pictures.",
    inStock: true 
  },
  { 
    _id: "f12",
    categoryId: "frames", 
    name: "Vintage Photo Frame", 
    price: 399, 
    image: "/images/vintage frame.jpg", 
    images: ["/images/vintage frame.jpg", "/images/vintage frames p2.jpg", "/images/vintage frames p3.jpg", "/images/vintage frames p4.jpg"],
    description: "Charming vintage-style frame for a nostalgic touch to any space.",
    inStock: true 
  },
  { 
    _id: "f16",
    categoryId: "frames", 
    name: "12x18 Frame", 
    price: 1499, 
    image: "/images/12x18 new.jpg", 
    images: ["/images/12x18 new.jpg"],
    description: "Premium 12x18 frame for showcasing your favorite memories and artwork.",
    inStock: true 
  },
  { 
    _id: "f17",
    categoryId: "frames", 
    name: "8x12 Wedding Frame", 
    price: 499, 
    image: "/images/wed frame.jpg", 
    images: ["/images/wed frame.jpg"],
    description: "Beautiful 8x12 wedding frame perfect for displaying your special moments and cherished wedding memories.",
    inStock: true 
  },

  // ===== CATEGORY 2: MAGAZINES & PHOTOBOOKS (9 Products) =====
  { 
    _id: "m1",
    categoryId: "magazines", 
    name: "Anniversary Magazine", 
    price: 499, 
    image: "/images/aniv1.jpeg", 
    images: ["/images/aniv1.jpeg", "/images/aniv2.jpeg", "/images/aniv3.jpeg", "/images/aniv4.jpeg", "/images/aniv5.jpeg"],
    description: "Premium hardcover anniversary magazine with custom photos and personalized layouts.",
    inStock: true 
  },
  { 
    _id: "m2",
    categoryId: "magazines", 
    name: "Magazine 12 Pages", 
    price: 599, 
    image: "/images/mag 12pgs 599.jpg", 
    images: ["/images/mag 12pgs 599.jpg", "/images/mag 12pgs 599 p3.jpg", "/images/mag 12pgs 599 p4.jpg", "/images/mag 12pgs 599 p5.jpg", "/images/mag 12pgs 599 p6.jpg", "/images/mag 12pgs 599 p7.jpg", "/images/mag 12pgs 599 p8.jpg"],
    description: "Beautiful hardcover magazine with 12 premium pages for your special memories.",
    inStock: true 
  },
  { 
    _id: "m3",
    categoryId: "magazines", 
    name: "Magazine Design 2", 
    price: 499, 
    image: "/images/MAG design2.jpg", 
    images: ["/images/MAG design2.jpg", "/images/MAG design2 p6.jpg", "/images/MAG design2 p7.jpg", "/images/MAG design2 p8.jpg", "/images/MAG design2 p9.jpg"],
    description: "Stylish magazine with alternative design layout. Perfect for modern memories.",
    inStock: true 
  },


  // ===== CATEGORY 4: FLOWERS & BOUQUETS (5 Products) =====
  {
    _id: "bou1",
    categoryId: "flowers",
    name: "Natural Flower Bouquet",
    price: 249,
    image: "/images/nf.jpeg",
    images: ["/images/nf.jpeg"],
    description: "Fresh and beautiful natural flower bouquet. Perfect for all occasions.",
    inStock: true,
    deliveryCharge: 249
  },
  {
    _id: "bou2",
    categoryId: "flowers",
    name: "Single Artificial Flower",
    price: 199,
    image: "/images/artificial single flower boq 199.jpg",
    images: ["/images/artificial single flower boq 199.jpg", "/images/artificial single flower boq 199 p2.jpg"],
    description: "Single high-quality artificial flower. Long-lasting and maintenance free.",
    inStock: true,
    deliveryCharge: 249
  },
  {
    _id: "bou3",
    categoryId: "flowers",
    name: "Artificial Bouquet Design 1",
    price: 899,
    image: "/images/artboqwith,pol,flow,choc 899.jpg",
    images: ["/images/artboqwith,pol,flow,choc 899.jpg", "/images/artboqwith,pol,flow,cktpr, 899.jpg"],
    description: "Artificial bouquet design 1: includes 12 medium polaroids, 12 artificial flowers, 6 chocolates. Optional addon: decorative lights for +₹50.",
    inStock: true,
    deliveryCharge: 249,
    components: [
      { item: "Polaroids Medium", sku: "pol2", quantity: 12 },
      { item: "Artificial Flowers", quantity: 12 },
      { item: "Chocolates", quantity: 6 }
    ],
    optionalAddons: { lights: 50 }
  },
  {
    _id: "bou4",
    categoryId: "flowers",
    name: "Artificial Bouquet Design 2",
    price: 899,
    image: "/images/aflower2.jpeg",
    images: ["/images/aflower2.jpeg"],
    description: "Artificial bouquet design 2: same as design 1 but chocolates are replaced by a cake topper. Optional addon: decorative lights for +₹50.",
    inStock: true,
    deliveryCharge: 249,
    components: [
      { item: "Polaroids Medium", sku: "pol2", quantity: 12 },
      { item: "Artificial Flowers", quantity: 12 },
      { item: "Cake Topper", quantity: 1 }
    ],
    optionalAddons: { lights: 50 }
  },
  {
    _id: "bou5",
    categoryId: "flowers",
    name: "Artificial Bouquet Deluxe",
    price: 999,
    image: "/images/artboqwith,pol,flow,cktpr,choc 999.jpg",
    images: ["/images/artboqwith,pol,flow,cktpr,choc 999.jpg", "/images/artboqwith,pol,flow,cktpr,choc 999 p2.jpg", "/images/artboqwith,pol,flow,cktpr,choc 999 p3.jpg"],
    description: "Deluxe artificial bouquet: includes polaroids, chocolates, artificial flowers and a cake topper. Best for premium gifting.",
    inStock: true,
    deliveryCharge: 249,
    components: [
      { item: "Polaroids Medium", sku: "pol2", quantity: 12 },
      { item: "Artificial Flowers", quantity: 12 },
      { item: "Chocolates", quantity: 6 },
      { item: "Cake Topper", quantity: 1 }
    ],
    optionalAddons: { lights: 50 }
  },
  

  // ===== CATEGORY 5: HAMPERS & GIFT COMBOS (3 Products) =====
  { 
    _id: "ham1",
    categoryId: "hampers", 
    name: "Premium Hamper", 
    price: 999, 
    image: "/images/hamper .jpg", 
    images: ["/images/hamper .jpg", "/images/HAMPER.jpg"],
    description: "Luxury gift hamper with premium items for special occasions.",
    inStock: true 
  },
  { 
    _id: "ham2",
    categoryId: "hampers", 
    name: "Premium Transparent Hamper", 
    price: 999, 
    image: "/images/HAMPER(1).jpg", 
    images: ["/images/HAMPER(1).jpg"],
    description: "Exclusive hamper edition with curated luxury items.",
    inStock: true 
  },
  { 
    _id: "ham3",
    categoryId: "hampers", 
    name: "Premium Hamper Combo", 
    price: 999, 
    image: "/images/hamperc.jpeg", 
    images: ["/images/hamperc.jpeg", "/images/phc.jpg", "/images/phc1.jpg", "/images/phc2.jpg"],
    description: "Artistic combination hamper with flowers, polaroids, and special gifts.",
    inStock: true 
  },

  
  // ===== CATEGORY 6: APPAREL (T-SHIRTS) (5 Products) =====

  { 
    _id: "cap1",
    categoryId: "apparel", 
    name: "Custom Cap", 
    price: 99, 
    image: "/images/cap.jpeg", 
    images: ["/images/cap.jpeg"],
    description: "Personalized cap with custom design. Great gift for any season.",
    inStock: true 
  },


  // ===== NEW TSHIRT VARIANTS =====
  {
    _id: "collared-tshirt",
    categoryId: "apparel",
    subcategoryName: "Collared",
    name: "Collared T-Shirts",
    price: 499,
    image: "/images/ct.jpeg",
    images: ["/images/ct.jpeg", "/imaages/ct1.jpeg", "/images/ct2.jpeg", "/images/ct3.jpega", "/images/ct4.jpeg"],
    description: "Premium collared t-shirts available in poly cotton and pure cotton. Choose your fabric and color from our amazing collection. Sizes S to XXL. Bulk discounts available at 5, 10, and 20+ pieces.",
    inStock: true,
    pricingType: "fabric-based",
    fabrics: [
      { name: "Poly Cotton", price: 499, priceDifference: 0 },
      { name: "Pure Cotton", price: 599, priceDifference: 100 }
    ],
    colors: ["Maroon", "Navy Blue", "Black", "White"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    minimumOrderQuantity: 1,
    quantityTiers: [
      { quantity: 1, discount: 0 },
      { quantity: 5, discount: 20 },
      { quantity: 10, discount: 40 },
      { quantity: 20, discount: 80 }
    ]
  },
  {
    _id: "collarless-tshirt",
    categoryId: "apparel",
    subcategoryName: "Collarless",
    name: "Collarless T-Shirts",
    price: 399,
    image: "/images/cless1.jpeg",
    images: ["/images/cless1.jpeg", "/images/cless.jpeg", "/images/cless2.jpeg", "/images/cless3.jpeg", "/images/cless4.jpeg", "/images/cless5.jpeg","/images/cless6.jpeg","/images/cless7.jpeg","/images/cless8.jpeg","/images/cless9.jpeg",""],
    description: "Comfortable collarless t-shirts in nylon and pure cotton options. Sizes S to XXL. Perfect for casual wear with vibrant colors. Bulk discounts available at 5, 10, and 20+ pieces.",
    inStock: true,
    pricingType: "fabric-based",
    fabrics: [
      { name: "Nylon", price: 399, priceDifference: 0 },
      { name: "Pure Cotton", price: 449, priceDifference: 50 }
    ],
    colors: ["Maroon", "Navy Blue", "Black", "White"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    minimumOrderQuantity: 1,
    quantityTiers: [
      { quantity: 1, discount: 0 },
      { quantity: 5, discount: 20 },
      { quantity: 10, discount: 40 },
      { quantity: 20, discount: 80 }
    ]
  },
  {
    _id: "signature day tshirts",
    categoryId: "apparel",
    subcategoryName: "Signature",
    name: "Signature T-Shirts",
    price: 179,
    image: "/images/signature-tshirt.jpg",
    images: ["/images/signature-tshirt.jpg"],
    description: "Premium signature polyester t-shirts with minimum order of 10 pieces. Bulk discounts available. Perfect for corporate gifting and events.",
    inStock: true,
    pricingType: "quantity-based",
    fabrics: [
      { name: "Polyester", price: 179, priceDifference: 0 }
    ],
    colors: ["White"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    minimumOrderQuantity: 10,
    quantityBasedPricing: [
      { quantity: 10, price: 179 },
      { quantity: 20, price: 169 },
      { quantity: 50, price: 159 },
      { quantity: 100, price: 149 }
    ]
  },

  // ===== CATEGORY 7: PHONE CASES & ESSENTIALS (4 Products) =====
  { 
    _id: "case1",
    categoryId: "essentials", 
    name: "Customized Phone Case", 
    price: 199, 
    image: "/images/phonec.jpeg", 
    images: ["/images/phonec.jpeg", "/images/phonec1.jpeg"],
    description: "Durable custom phone case with your favorite photo or design.",
    inStock: true 
  },

  {_id : "case2",
    categoryId: "essentials",
    name: "Customized Phone Case Premium",
    price: 199,
    image: "/images/phonec2.jpeg",
    images: ["/images/phonec2.jpeg", "/images/phonec3.jpeg", "/images/phonec2-2.jpeg"],
  },

  {_id : "case3",
    categoryId: "essentials",
    name: "Customized Phone Case Premium",
    price: 199,
    image: "/images/phonec3.jpeg",
    images: ["/images/phonec3.jpeg", "/images/phonec4.jpeg"],
  },

  {_id : "case4",
    categoryId: "essentials",
    name: "Customized Phone Case Premium",
    price: 199,
    image: "/images/phonec5.jpeg",
    images: ["/images/phonec5.jpeg", "/images/phonec6.jpeg", "/images/phonec7.jpeg"],
  },


  { 
    _id: "cup1",
    categoryId: "essentials", 
    name: "Photo Cup 299", 
    price: 299, 
    image: "/images/photo cup 299.jpg", 
    images: ["/images/photo cup 299.jpg"],
    description: "Premium ceramic cup with custom photo print. Perfect daily essential.",
    inStock: true 
  },
  { 
    _id: "cup2",
    categoryId: "essentials", 
    name: "Photo Cup Premium 299", 
    price: 299, 
    image: "/images/photo cup p2 299.jpg", 
    images: ["/images/photo cup p2 299.jpg"],
    description: "High-quality photo cup ideal for tea, coffee, or as a gift.",
    inStock: true 
  },
  { 
    _id: "exampads1",
    categoryId: "essentials", 
    name: "Customized Exam Pads", 
    price: 149, 
    image: "/images/exam.jpeg", 
    images: ["/images/exam.jpeg", "/images/exam1.jpeg"],
    description: "Premium customized exam pads with personalized designs. Perfect for students and professionals.",
    inStock: true 
  },


  // ===== CATEGORY 8: CALENDARS & MAGNETS (3 Products) =====
  { 
    _id: "cal1",
    categoryId: "addons", 
    name: "Photo Calendar 199", 
    price: 199, 
    image: "/images/calender 199.jpg", 
    images: ["/images/calender 199.jpg"],
    description: "Beautiful calendar with your favorite photos. Perfect for walls or desks.",
    inStock: true 
  },
  { 
    _id: "mag1",
    categoryId: "addons", 
    name: "Fridge Magnet Set 179", 
    price: 179, 
    image: "/images/fridge magents 179.jpg", 
    images: ["/images/fridge magents 179.jpg"],
    description: "Set of decorative fridge magnets with custom photo designs.",
    inStock: true 
  },
  { 
    _id: "addon3",
    categoryId: "addons", 
    name: "Addon Collection", 
    price: 299, 
    image: "/images/calender 199.jpg", 
    images: ["/images/calender 199.jpg", "/images/fridge magents 179.jpg"],
    description: "Collection of cute add-ons like calendars and magnets for decoration.",
    inStock: true 
  },

  // ===== CATEGORY 9: VINTAGE COLLECTION (3 Products) =====
  { 
    _id: "vf1",
    categoryId: "vintage", 
    name: "Vintage Frame", 
    price: 399, 
    image: "/images/vintage frame.jpg", 
    images: ["/images/vintage frame.jpg", "/images/vintage frames p2.jpg", "/images/vintage frames p3.jpg", "/images/vintage frames p4.jpg"],
    description: "Charming vintage-style frame that adds nostalgic elegance to any space.",
    inStock: true 
  },
  { 
    _id: "vl1",
    categoryId: "vintage", 
    name: "Vintage Letter 119", 
    price: 119, 
    image: "/images/vintage letter 119.JPG", 
    images: ["/images/vintage letter 119.JPG"],
    description: "Authentic vintage letter style prints for personalized messages.",
    inStock: true 
  },
  { 
    _id: "vintage3",
    categoryId: "vintage", 
    name: "Vintage Collection Bundle", 
    price: 499, 
    image: "/images/vintage frame.jpg", 
    images: ["/images/vintage frame.jpg", "/images/vintage letter 119.JPG"],
    description: "Complete vintage collection with frames and letter prints.",
    inStock: true 
  },

  // ===== CATEGORY 10: SMART & DIGITAL SERVICES (9 Products) =====
  { 
    _id: "nfc1",
    categoryId: "smart-digital", 
    name: "NFC Review Board 799", 
    price: 799, 
    image: "/images/nfc.jpeg", 
    images: ["/images/nfc.jpeg"],
    description: "Smart NFC review board for interactive memories and feedback.",
    inStock: true 
  },
  { 
    _id: "id1",
    categoryId: "smart-digital", 
    name: "ID Card PVC 149", 
    price: 149, 
    image: "/images/ID.jpeg", 
    images: ["/images/ID.jpeg"],
    description: "Professional PVC ID card with high-quality printing and durability.",
    inStock: true 
  },
  { 
    _id: "d1",
    categoryId: "smart-digital", 
    name: "Digital Invitation", 
    price: 299, 
    image: "/images/digital invitation.jpg", 
    images: ["/images/digital invitation.jpg", "/images/DI1.JPG", "/images/DI2.JPG", "/images/DI3.JPG", "/images/digital invitation p2.JPG"],
    description: "Beautiful digital invitation designs for your special events.",
    inStock: true 
  },
  { 
    _id: "d2",
    categoryId: "smart-digital", 
    name: "Photo Restoration", 
    price: 199, 
    image: "/images/photo restoration (after).JPEG", 
    images: ["/images/photo restoration (after).JPEG", "/images/photo restoration (before).jpg"],
    description: "Professional photo restoration service bringing old photos back to life.",
    inStock: true 
  },
  { 
    _id: "sd5",
    categoryId: "smart-digital", 
    name: "Smart Digital Package", 
    price: 999, 
    image: "/images/REVIEW BOARD NFC 799.jpg", 
    images: ["/images/REVIEW BOARD NFC 799.jpg", "/images/ID.jpeg"],
    description: "Complete smart digital services package for modern memory management.",
    inStock: true 
  },
  { 
    _id: "sd6",
    categoryId: "smart-digital", 
    name: "Digital Services Suite", 
    price: 1299, 
    image: "/images/digital invitation.jpg", 
    images: ["/images/digital invitation.jpg", "/images/photo restoration (after).JPEG"],
    description: "Comprehensive digital services including invitations and restoration.",
    inStock: true 
  },
  { 
    _id: "sd7",
    categoryId: "smart-digital", 
    name: "NFC & ID Combo", 
    price: 899, 
    image: "/images/REVIEW BOARD NFC 799.jpg", 
    images: ["/images/REVIEW BOARD NFC 799.jpg", "/images/ID.jpeg"],
    description: "Premium combination of NFC technology and ID card services.",
    inStock: true 
  },
  { 
    _id: "sd8",
    categoryId: "smart-digital", 
    name: "Digital Experience Package", 
    price: 1499, 
    image: "/images/digital invitation.jpg", 
    images: ["/images/digital invitation.jpg", "/images/REVIEW BOARD NFC 799.jpg", "/images/photo restoration (after).JPEG"],
    description: "Premium digital experience with all smart services included.",
    inStock: true 
  },
  { 
    _id: "sd9",
    categoryId: "smart-digital", 
    name: "Smart Memory Management", 
    price: 599, 
    image: "/images/REVIEW BOARD NFC 799.jpg", 
    images: ["/images/REVIEW BOARD NFC 799.jpg"],
    description: "Smart solution for organizing and managing your digital memories.",
    inStock: true 
  }
];

const categories = [
  {
    _id: 'frames',
    title: 'Photo Frames',
    desc: 'Premium wooden, wall & table frames (including customized frames) to cherish your memories.',
    emoji: '📸',
    showcaseProducts: ['f1', 'f2'],  // 8x12 Wall Mount & 12x18 Premium
    subCategories: [
      { name: 'Wooden photo frames', description: 'Classic wooden frames' },
      { name: 'Wall frames', description: 'For wall mounting' },
      { name: 'Table frames', description: 'For desk displays' },
      { name: 'Customized frames', description: 'Personalized frames' }
    ]
  },
  {
    _id: 'magazines',
    title: 'Magazines',
    desc: 'Customized magazines - Birthday, Anniversary, Memory & Story editions.',
    emoji: '📖',
    showcaseProducts: ['m2', 'm3'],  // Story & Anniversary Magazines
    subCategories: [
      { name: 'Birthday magazines', description: 'Special birthday editions' },
      { name: 'Anniversary magazines', description: 'Celebration editions' },
      { name: 'Memory magazines', description: 'Photo-based stories' }
    ]
  },
  {
    _id: 'memories',
    title: 'Polaroids & Photo Books',
    desc: 'Small, medium & large polaroids plus premium photo books & mini albums.',
    emoji: '🎞️',
    showcaseProducts: ['pol1', 'pol2'],  // Mini, Medium & Large Polaroids
    subCategories: [
      { name: 'Polaroids', description: 'Classic polaroid prints' },
      { name: 'Photo books', description: 'Premium photo collections' },
      { name: 'Mini albums', description: 'Portable photo albums' }
    ]
  },
  {
    _id: 'flowers',
    title: 'Flowers & Bouquets',
    desc: 'Fresh bouquets, artificial arrangements, rose boxes & flowers with message cards.',
    emoji: '🌹',
    showcaseProducts: ['bou1', 'bou5'],  // Real Flower Bouquets
    subCategories: [
      { name: 'Fresh bouquets', description: 'Real flowers' },
      { name: 'Rose boxes', description: 'Premium rose collections' },
      { name: 'Artificial arrangements', description: 'Long-lasting designs' }
    ]
  },
  {
    _id: 'hampers',
    title: 'Hampers & Gift Combos',
    desc: 'Birthday, anniversary, couple & custom gift hampers for every occasion.',
    emoji: '🎁',
    showcaseProducts: ['ham2', 'ham3'],  // Anniversary & Couple Hampers
    subCategories: [
      { name: 'Birthday hampers', description: 'Birthday specials' },
      { name: 'Anniversary hampers', description: 'Romantic gift sets' },
      { name: 'Couple combos', description: 'For two' }
    ]
  },
  {
    _id: 'apparel',
    title: 'T-Shirts & Accessories',
    desc: 'Customized & printed t-shirts, keychains & pouches with your designs.',
    emoji: '👕',
    showcaseProducts: ['collared-tshirt', 'cap1'],
    subCategories: [
      { name: 'Collared', description: 'Premium collared t-shirts with fabric options' },
      { name: 'Collarless', description: 'Comfortable collarless t-shirts' },
      { name: 'Signature', description: 'Bulk signature polyester t-shirts with MOQ' },
      { name: 'T-shirts', description: 'Custom printed' },
      { name: 'Keychains', description: 'Personalized' },
      { name: 'Pouches', description: 'Customized bags' }
    ]
  },
  {
    _id: 'essentials',
    title: 'Phone Cases & Cups',
    desc: 'Custom phone cases, photo mugs & personalized cups with high-quality prints.',
    emoji: '📱',
    showcaseProducts: ['case1', 'cup1'],  // Phone Cases & Photo Cups
    subCategories: [
      { name: 'Phone cases', description: 'Protective cases' },
      { name: 'Photo mugs', description: 'Personalized mugs' },
      { name: 'Cups', description: 'Customized drinkware' }
    ]
  },
  {
    _id: 'vintage',
    title: 'Vintage Collection',
    desc: 'Aesthetic vintage frames, retro letters & old-style prints with warm nostalgic tones.',
    emoji: '✨',
    showcaseProducts: ['vf1', 'vl1'],  // Vintage Frame & Vintage Letter
    subCategories: [
      { name: 'Vintage frames', description: 'Old-style frames' },
      { name: 'Retro prints', description: 'Nostalgic designs' },
      { name: 'Vintage letters', description: 'Classic lettering' }
    ]
  },
  {
    _id: 'addons',
    title: 'Calendars & Magnets',
    desc: 'Customized calendars, photo calendars & fridge magnets for your space.',
    emoji: '📅',
    showcaseProducts: ['cal1', 'mag1'],  // Photo Calendar & Fridge Magnet
    subCategories: [
      { name: 'Calendars', description: 'Personalized calendars' },
      { name: 'Photo magnets', description: 'Fridge magnets' },
      { name: 'Desk calendars', description: 'Desktop versions' }
    ]
  },
  {
    _id: 'smart-digital',
    title: 'Smart & Digital Services',
    desc: 'NFC cards, review boards, poster design, photo & video editing services.',
    emoji: '🤖',
    showcaseProducts: ['nfc1', 'id1'],  // NFC Review Board & ID Card
    subCategories: [
      { name: 'NFC cards', description: 'Digital enabled cards' },
      { name: 'Poster design', description: 'Custom posters' },
      { name: 'Photo editing', description: 'Professional editing' },
      { name: 'Video editing', description: 'Video services' }
    ]
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🔗 Connected to DB...");
    
    // Clear old data
    await Product.deleteMany({});
    await Category.deleteMany({});
    console.log("🗑️ Old data cleared.");

    // Add 2-3 fake reviews to each product (for demo)
    const sampleReviews = [
      { name: 'Riya', rating: 5, comment: 'Absolutely loved it — great quality and fast delivery!' },
      { name: 'Amit', rating: 4, comment: 'Good product, packing could be better.' },
      { name: 'Sneha', rating: 5, comment: 'Perfect gift! Very happy with the print.' },
      { name: 'Karthik', rating: 4, comment: 'Nice finish, colors are vibrant.' },
      { name: 'Priya', rating: 5, comment: 'Exceeded expectations — would buy again.' }
    ];

    products.forEach(p => {
      if (!p.reviews) {
        // pick 2-3 random reviews
        const cnt = Math.floor(Math.random() * 2) + 2; // 2 or 3
        p.reviews = [];
        for (let i = 0; i < cnt; i++) {
          const r = sampleReviews[Math.floor(Math.random() * sampleReviews.length)];
          p.reviews.push({ name: r.name, rating: r.rating, comment: r.comment, createdAt: new Date() });
        }
      }
    });

    // Insert products
    await Product.insertMany(products);
    console.log("✅ Products imported!");
    
    // Insert categories
    await Category.insertMany(categories);
    console.log("✅ Categories imported!");
    
    // Seed demo admin
    await Admin.deleteMany({});
    const demoAdmin = new Admin({
      email: 'infinitycustomizations@gmail.com',
      password: 'infinity@2026',
      name: 'Admin',
      role: 'super_admin',
      permissions: ['view_orders', 'update_orders', 'manage_products', 'manage_categories', 'view_images'],
      isActive: true
    });
    await demoAdmin.save();
    console.log("✅ Demo admin created! Email: infinitycustomizations@gmail.com, Password: infinity@2026");
    
    console.log("✅ SUCCESS: All data imported into MongoDB!");
    
    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
};

seedDB();