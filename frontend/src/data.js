// --- 1. TOP STORY CIRCLES (13+ Circles) ---
export const storyCategories = [
  { id: "frames", name: "Frames", image: "/images/4 x 6 black frame 199.jpg" },
  { id: "frames", name: "Collage Frames", image: "/images/collage frame 3999.jpg" },
  { id: "magazines", name: "Magazines", image: "/images/anniversary MAG.jpg" },
  { id: "magazines", name: "Photo Books", image: "/images/PB.jpg" },
  { id: "memories", name: "Polaroids", image: "/images/polaroids.jpg" },
  { id: "memories", name: "Albums", image: "/images/polaroids album 169.jpg" },
  { id: "flowers", name: "Flowers", image: "/images/real flower boq 249.jpg" },
  { id: "flowers", name: "Rose Bouquets", image: "/images/Boquet.jpg" },
  { id: "hampers", name: "Hampers", image: "/images/HAMPER.jpg" },
  { id: "apparel", name: "T-Shirts", image: "/images/CUSTOMIZED T-SHIRTS 499.jpg" },
  { id: "apparel", name: "Caps", image: "/images/cap.jpeg" },
  { id: "essentials", name: "Phone Cases", image: "/images/PC.jpeg" },
  { id: "essentials", name: "Photo Cups", image: "/images/photo cup 299.jpg" },
  { id: "vintage", name: "Vintage Frames", image: "/images/vintage frame.jpg" },
  { id: "vintage", name: "Vintage Letters", image: "/images/vintage letter 119.JPG" },
  { id: "addons", name: "Calendars", image: "/images/calender 199.jpg" },
  { id: "addons", name: "Magnets", image: "/images/fridge magents 179.jpg" },
  { id: "smart-digital", name: "ID Cards", image: "/images/ID.jpeg" },
  { id: "smart-digital", name: "NFC Boards", image: "/images/REVIEW BOARD NFC 799.jpg" },
  { id: "smart-digital", name: "Digital Invites", image: "/images/digital invitation.jpg" },
];

// --- 2. CATEGORY PAGE HEADERS WITH DETAILED INFO ---
export const categoryDetails = {
  "frames": { 
    title: "Photo Frames", 
    desc: "Premium wooden, wall, table, collage & customized frames to cherish your memories.",
    subCategories: ["Wooden photo frames", "Wall frames", "Table frames", "Collage frames", "Customized frames"]
  },
  "magazines": { 
    title: "Magazines", 
    desc: "Customized magazines - Birthday, Anniversary, Memory & Story editions.",
    subCategories: ["Customized magazines", "Birthday magazines", "Anniversary magazines", "Memory/story magazines"]
  },
  "memories": { 
    title: "Polaroids & Photo Books", 
    desc: "Small, medium & large polaroids plus premium photo books & mini albums.",
    subCategories: ["Small Polaroids (₹5)", "Medium Polaroids (₹8)", "Large Polaroids (₹15)", "Photo books / mini albums"]
  },
  "flowers": { 
    title: "Flowers & Bouquets", 
    desc: "Fresh bouquets, artificial arrangements, rose boxes & flowers with message cards.",
    subCategories: ["Fresh flower bouquets", "Artificial bouquets", "Rose boxes", "Flowers with message cards"]
  },
  "hampers": { 
    title: "Hampers & Gift Combos", 
    desc: "Birthday, anniversary, couple & custom gift hampers for every occasion.",
    subCategories: ["Birthday hampers", "Anniversary hampers", "Couple gift combos", "Custom gift boxes"]
  },
  "apparel": { 
    title: "T-Shirts & Accessories", 
    desc: "Customized & printed t-shirts, keychains & pouches with your designs.",
    subCategories: ["Customized T-shirts", "Printed T-shirts", "Keychains", "Customized pouches"]
  },
  "essentials": { 
    title: "Phone Cases & Cups", 
    desc: "Custom phone cases, photo mugs & personalized cups with high-quality prints.",
    subCategories: ["Customized phone cases", "Photo phone cases", "Name phone cases", "Customized mugs / cups"]
  },
  "vintage": { 
    title: "Vintage Collection", 
    desc: "Aesthetic vintage frames, retro letters & old-style prints with warm nostalgic tones.",
    subCategories: ["Vintage photo frames", "Vintage letters", "Retro-style prints", "Aesthetic vintage setup"]
  },
  "addons": { 
    title: "Calendars & Magnets", 
    desc: "Customized calendars, photo calendars & fridge magnets for your space.",
    subCategories: ["Customized calendars", "Photo calendars", "Fridge magnets", "Photo magnets"]
  },
  "smart-digital": { 
    title: "Smart & Digital Services", 
    desc: "NFC cards, review boards, poster design, photo & video editing services.",
    subCategories: ["NFC cards", "Review cards", "Poster design", "Photo editing", "Video editing"]
  },
};

// --- 3. ALL PRODUCTS (60+ Complete Products) ---
export const products = [
  // ===== CATEGORY 1: PHOTO FRAMES (13 Products) =====
  { id: "f1", categoryId: "frames", name: "4x6 Black Premium Frame", price: 199, image: "/images/4 x 6 black frame 199.jpg", images: ["/images/4 x 6 black frame 199.jpg", "/images/4 x 6 p2.jpg", "/images/4 x 6 p3.jpg"] },
  { id: "f1b", categoryId: "frames", name: "4x6 White Premium Frame", price: 199, image: "/images/4 x 6 white frame 199.jpg", images: ["/images/4 x 6 white frame 199.jpg", "/images/4 x 6 white frame 199.jpg", "/images/5 x 7 white 299.jpg"] },
  { id: "f2", categoryId: "frames", name: "4x4 Compact Frame", price: 149, image: "/images/4 x 4 149.jpg", images: ["/images/4 x 4 149.jpg", "/images/4 x 4 149.jpg", "/images/4 x 4 149.jpg"] },
  { id: "f3", categoryId: "frames", name: "5x7 White Frame", price: 299, image: "/images/5 x 7 white 299.jpg", images: ["/images/5 x 7 white 299.jpg", "/images/5 x 7 299.jpg", "/images/5 x 7 white 299.jpg"] },
  { id: "f4", categoryId: "frames", name: "8x12 Wall Mount Frame", price: 599, image: "/images/8 x 12 599.jpg", images: ["/images/8 x 12 599.jpg", "/images/8 x 12 (1_2 inch) 499.jpg", "/images/8 x 12 mount.jpg"] },
  { id: "f5", categoryId: "frames", name: "10x12 Modern Frame", price: 1299, image: "/images/10 x 12 frame 1299.jpg", images: ["/images/10 x 12 frame 1299.jpg", "/images/10 x 12 frame 1299.jpg", "/images/10 x 12 frame 1299.jpg"] },
  { id: "f6", categoryId: "frames", name: "12x18 Premium Mount Frame", price: 2199, image: "/images/12 x 18 mount 2199.jpg", images: ["/images/12 x 18 mount 2199.jpg", "/images/12 x 18 mount 2199(1).jpg", "/images/12 x 18 mount 2199(2).jpg"] },
  { id: "f7", categoryId: "frames", name: "12x18 Brown Wooden Frame", price: 1499, image: "/images/12 x 18 brown frame 1499.jpg", images: ["/images/12 x 18 brown frame 1499.jpg", "/images/12 x 18 brown p2 1499.jpg", "/images/12 x 18 brown frame 1499.jpg"] },
  { id: "f8", categoryId: "frames", name: "12x18 Classic Frame", price: 1499, image: "/images/12 x 18 1499 .jpg", images: ["/images/12 x 18 1499 .jpg", "/images/12 x 18 1499 .jpg", "/images/12 x 18 1499 .jpg"] },
  { id: "f9", categoryId: "frames", name: "12x18 Milestone Frame", price: 1499, image: "/images/12 x 18 milestone .jpg", images: ["/images/12 x 18 milestone .jpg", "/images/12 x 18 milestone .jpg", "/images/12 x 18 milestone .jpg"] },
  { id: "f10", categoryId: "frames", name: "Customized Photo Frame 199", price: 199, image: "/images/customized song frame 199.jpg", images: ["/images/customized song frame 199.jpg", "/images/customized song frame 199.jpg", "/images/customized song frame 199.jpg"] },
  { id: "f11", categoryId: "frames", name: "12x18 Collage Frame", price: 3999, image: "/images/collage frame 3999.jpg", images: ["/images/collage frame 3999.jpg", "/images/collage frame 3999.jpg", "/images/collage frame 3999.jpg"] },
  { id: "f12", categoryId: "frames", name: "Vintage Photo Frame", price: 399, image: "/images/vintage frame.jpg", images: ["/images/vintage frame.jpg", "/images/vintage frames p2.jpg", "/images/vintage frames p3.jpg"] },

  // ===== CATEGORY 2: MAGAZINES & PHOTOBOOKS (9 Products) =====
  { id: "m1", categoryId: "magazines", name: "Anniversary Magazine", price: 499, image: "/images/anniversary MAG.jpg", images: ["/images/anniversary MAG.jpg", "/images/anniversary MAG p2.jpg", "/images/anniversary MAG p3.jpg"] },
  { id: "m2", categoryId: "magazines", name: "Magazine 12 Pages", price: 599, image: "/images/mag 12pgs 599.jpg", images: ["/images/mag 12pgs 599.jpg", "/images/mag 12pgs 599 p2.jpg", "/images/mag 12pgs 599 p3.jpg"] },
  { id: "m3", categoryId: "magazines", name: "Magazine Design 2", price: 599, image: "/images/MAG design2.jpg", images: ["/images/MAG design2.jpg", "/images/MAG design2 p2.jpg", "/images/MAG design2 p3.jpg"] },
  { id: "m4", categoryId: "magazines", name: "Premium Magazine", price: 699, image: "/images/mag(1).jpg", images: ["/images/mag(1).jpg", "/images/mag(1).jpg", "/images/mag(1).jpg"] },
  { id: "m5", categoryId: "magazines", name: "Classic Magazine Design", price: 599, image: "/images/mag.jpg", images: ["/images/mag.jpg", "/images/mag.jpg", "/images/mag.jpg"] },
  { id: "m6", categoryId: "magazines", name: "Magazine Premium Edition", price: 799, image: "/images/MAG(2).jpg", images: ["/images/MAG(2).jpg", "/images/MAG(2).jpg", "/images/MAG(2).jpg"] },
  { id: "m7", categoryId: "magazines", name: "Photo Book Premium", price: 269, image: "/images/photo book 269.jpg", images: ["/images/photo book 269.jpg", "/images/photo book 269.jpg", "/images/photo book 269.jpg"] },
  { id: "m8", categoryId: "magazines", name: "Polaroid Album 169", price: 169, image: "/images/polaroids album 169.jpg", images: ["/images/polaroids album 169.jpg", "/images/pol album 169.jpg", "/images/polaroids album 169.jpg"] },
  { id: "m9", categoryId: "magazines", name: "Custom Magnets Magazine", price: 499, image: "/images/magnizes 499.jpg", images: ["/images/magnizes 499.jpg", "/images/magnizes 499.jpg", "/images/magnizes 499.jpg"] },

  // ===== CATEGORY 3: POLAROIDS & MEMORIES (4 Products) =====
  { id: "pol1", categoryId: "memories", name: "Polaroids Medium Set", price: 199, image: "/images/polaroids.jpg", images: ["/images/polaroids.jpg", "/images/polaroids.jpg", "/images/polaroids.jpg"] },
  { id: "pol2", categoryId: "memories", name: "Polaroids Medium 8 Per Set", price: 199, image: "/images/POLAROIDS MEDIUM 8 PER EACH.jpg", images: ["/images/POLAROIDS MEDIUM 8 PER EACH.jpg", "/images/POLAROIDS MEDIUM 8 PER EACH.jpg", "/images/POLAROIDS MEDIUM 8 PER EACH.jpg"] },
  { id: "pol3", categoryId: "memories", name: "Polaroid Album 169", price: 169, image: "/images/polaroids album 169.jpg", images: ["/images/polaroids album 169.jpg", "/images/pol album 169.jpg", "/images/polaroids album 169.jpg"] },
  { id: "mem1", categoryId: "memories", name: "Memory Storage Set", price: 299, image: "/images/photo book 269.jpg", images: ["/images/photo book 269.jpg", "/images/photo book 269.jpg", "/images/photo book 269.jpg"] },

  // ===== CATEGORY 4: FLOWERS & BOUQUETS (7 Products) =====
  { id: "bou1", categoryId: "flowers", name: "Real Flower Bouquet 249", price: 249, image: "/images/real flower boq 249.jpg", images: ["/images/real flower boq 249.jpg", "/images/real flower boq 249(1).jpg", "/images/real flower boq 249.jpg"] },
  { id: "bou2", categoryId: "flowers", name: "Real Flowers Bouquet 249", price: 249, image: "/images/real flwr 249.jpg", images: ["/images/real flwr 249.jpg", "/images/real flwrs 249 p2.jpg", "/images/real flwrs p3 249.jpg"] },
  { id: "bou3", categoryId: "flowers", name: "Premium Rose Bouquet 899", price: 899, image: "/images/real flwr boq 899.jpg", images: ["/images/real flwr boq 899.jpg", "/images/real flwr boq 899.jpg", "/images/real flwr boq 899.jpg"] },
  { id: "bou4", categoryId: "flowers", name: "Artificial Single Flower Bouquet 199", price: 199, image: "/images/artificial single flower boq 199.jpg", images: ["/images/artificial single flower boq 199.jpg", "/images/artificial single flower boq 199 p2.jpg", "/images/artificial single flower boq 199.jpg"] },
  { id: "bou5", categoryId: "flowers", name: "Red Bouquet Arrangement", price: 249, image: "/images/red boq p2.jpg", images: ["/images/red boq p2.jpg", "/images/red boq p3.jpg", "/images/red boq p2.jpg"] },
  { id: "bou6", categoryId: "flowers", name: "Art Bouquet with Flowers", price: 899, image: "/images/artboqwith,pol,flow,choc 899.jpg", images: ["/images/artboqwith,pol,flow,choc 899.jpg", "/images/artboqwith,pol,flow,cktpr, 899.jpg", "/images/artboqwith,pol,flow,choc 899.jpg"] },
  { id: "bou7", categoryId: "flowers", name: "Bouquet with Multiple Items", price: 999, image: "/images/artboqwith,pol,flow,cktpr,choc 999.jpg", images: ["/images/artboqwith,pol,flow,cktpr,choc 999.jpg", "/images/artboqwith,pol,flow,cktpr,choc 999 p2.jpg", "/images/artboqwith,pol,flow,cktpr,choc 999 p3.jpg"] },

  // ===== CATEGORY 5: HAMPERS & GIFT COMBOS (3 Products) =====
  { id: "ham1", categoryId: "hampers", name: "Premium Hamper", price: 999, image: "/images/hamper.jpg", images: ["/images/hamper.jpg", "/images/hamper .jpg", "/images/HAMPER.jpg"] },
  { id: "ham2", categoryId: "hampers", name: "Premium Hamper Edition", price: 999, image: "/images/HAMPER(1).jpg", images: ["/images/HAMPER(1).jpg", "/images/HAMPER(1).jpg", "/images/HAMPER(1).jpg"] },
  { id: "ham3", categoryId: "hampers", name: "Artistic Hamper Combo", price: 999, image: "/images/hamperc.jpeg", images: ["/images/hamperc.jpeg", "/images/hamperc.jpeg", "/images/hamper.jpg"] },

  // ===== CATEGORY 6: APPAREL (T-SHIRTS) (5 Products) =====
  { id: "t1", categoryId: "apparel", name: "Customized T-Shirt 499", price: 499, image: "/images/CUSTOMIZED T-SHIRTS 499.jpg", images: ["/images/CUSTOMIZED T-SHIRTS 499.jpg", "/images/CUSTOMIZED T-SHIRTS P2 499.jpg", "/images/CUSTOMIZED T-SHIRTS P3 499.jpg"] },
  { id: "t2", categoryId: "apparel", name: "Classic T-Shirt", price: 499, image: "/images/Tshirt.jpeg", images: ["/images/Tshirt.jpeg", "/images/Tshirt.jpeg", "/images/Tshirt.jpeg"] },
  { id: "cap1", categoryId: "apparel", name: "Custom Cap", price: 99, image: "/images/cap.jpeg", images: ["/images/cap.jpeg", "/images/cap.jpeg", "/images/cap.jpeg"] },
  { id: "pouch1", categoryId: "apparel", name: "Photo Pouch 299", price: 299, image: "/images/photo cup p2 299.jpg", images: ["/images/photo cup p2 299.jpg", "/images/photo cup p2 299.jpg", "/images/photo cup p2 299.jpg"] },
  { id: "apparel5", categoryId: "apparel", name: "Apparel Collection", price: 599, image: "/images/CUSTOMIZED T-SHIRTS 499.jpg", images: ["/images/CUSTOMIZED T-SHIRTS 499.jpg", "/images/CUSTOMIZED T-SHIRTS P2 499.jpg", "/images/cap.jpeg"] },

  // ===== CATEGORY 7: PHONE CASES & ESSENTIALS (4 Products) =====
  { id: "case1", categoryId: "essentials", name: "Customized Phone Case", price: 299, image: "/images/PC.jpeg", images: ["/images/PC.jpeg", "/images/CUSTOMIZED PHONE CASE.jpg", "/images/CUSTOMIZED PHONE CASE P2.jpg"] },
  { id: "cup1", categoryId: "essentials", name: "Photo Cup 299", price: 299, image: "/images/photo cup 299.jpg", images: ["/images/photo cup 299.jpg", "/images/photo cup 299.jpg", "/images/photo cup 299.jpg"] },
  { id: "cup2", categoryId: "essentials", name: "Photo Cup Premium 299", price: 299, image: "/images/photo cup p2 299.jpg", images: ["/images/photo cup p2 299.jpg", "/images/photo cup p2 299.jpg", "/images/photo cup p2 299.jpg"] },
  { id: "ess4", categoryId: "essentials", name: "Daily Essentials Set", price: 399, image: "/images/PC.jpeg", images: ["/images/PC.jpeg", "/images/photo cup 299.jpg", "/images/CUSTOMIZED PHONE CASE P2.jpg"] },

  // ===== CATEGORY 8: CALENDARS & MAGNETS (3 Products) =====
  { id: "cal1", categoryId: "addons", name: "Photo Calendar 199", price: 199, image: "/images/calender 199.jpg", images: ["/images/calender 199.jpg", "/images/calender 199.jpg", "/images/calender 199.jpg"] },
  { id: "mag1", categoryId: "addons", name: "Fridge Magnet Set 179", price: 179, image: "/images/fridge magents 179.jpg", images: ["/images/fridge magents 179.jpg", "/images/fridge magents 179.jpg", "/images/fridge magents 179.jpg"] },
  { id: "addon3", categoryId: "addons", name: "Addon Collection", price: 299, image: "/images/calender 199.jpg", images: ["/images/calender 199.jpg", "/images/fridge magents 179.jpg", "/images/calender 199.jpg"] },

  // ===== CATEGORY 9: VINTAGE COLLECTION (3 Products) =====
  { id: "vf1", categoryId: "vintage", name: "Vintage Frame", price: 399, image: "/images/vintage frame.jpg", images: ["/images/vintage frame.jpg", "/images/vintage frames p2.jpg", "/images/vintage frames p3.jpg"] },
  { id: "vl1", categoryId: "vintage", name: "Vintage Letter 119", price: 119, image: "/images/vintage letter 119.JPG", images: ["/images/vintage letter 119.JPG", "/images/vintage letter 119.JPG", "/images/vintage letter 119.JPG"] },
  { id: "vintage3", categoryId: "vintage", name: "Vintage Collection Bundle", price: 499, image: "/images/vintage frame.jpg", images: ["/images/vintage frame.jpg", "/images/vintage frames p4.jpg", "/images/vintage frames p2.jpg"] },

  // ===== CATEGORY 10: SMART & DIGITAL SERVICES (9 Products) =====
  { id: "nfc1", categoryId: "smart-digital", name: "NFC Review Board 799", price: 799, image: "/images/REVIEW BOARD NFC 799.jpg", images: ["/images/REVIEW BOARD NFC 799.jpg", "/images/REVIEW BOARD NFC 799.jpg", "/images/REVIEW BOARD NFC 799.jpg"] },
  { id: "id1", categoryId: "smart-digital", name: "ID Card PVC 149", price: 149, image: "/images/ID.jpeg", images: ["/images/ID.jpeg", "/images/ID.jpeg", "/images/ID.jpeg"] },
  { id: "d1", categoryId: "smart-digital", name: "Digital Invitation", price: 299, image: "/images/digital invitation.jpg", images: ["/images/digital invitation.jpg", "/images/DI1.JPG", "/images/DI2.JPG"] },
  { id: "d2", categoryId: "smart-digital", name: "Photo Restoration", price: 199, image: "/images/photo restoration (after).JPEG", images: ["/images/photo restoration (after).JPEG", "/images/photo restoration (before).jpg", "/images/photo restoration (after).JPEG"] },
  { id: "sd5", categoryId: "smart-digital", name: "Smart Digital Package", price: 999, image: "/images/REVIEW BOARD NFC 799.jpg", images: ["/images/REVIEW BOARD NFC 799.jpg", "/images/ID.jpeg", "/images/REVIEW BOARD NFC 799.jpg"] },
  { id: "sd6", categoryId: "smart-digital", name: "Digital Services Suite", price: 1299, image: "/images/digital invitation.jpg", images: ["/images/digital invitation.jpg", "/images/photo restoration (after).JPEG", "/images/DI1.JPG"] },
  { id: "sd7", categoryId: "smart-digital", name: "NFC & ID Combo", price: 899, image: "/images/REVIEW BOARD NFC 799.jpg", images: ["/images/REVIEW BOARD NFC 799.jpg", "/images/ID.jpeg", "/images/REVIEW BOARD NFC 799.jpg"] },
  { id: "sd8", categoryId: "smart-digital", name: "Digital Experience Package", price: 1499, image: "/images/digital invitation.jpg", images: ["/images/digital invitation.jpg", "/images/REVIEW BOARD NFC 799.jpg", "/images/photo restoration (after).JPEG"] },
  { id: "sd9", categoryId: "smart-digital", name: "Smart Memory Management", price: 599, image: "/images/REVIEW BOARD NFC 799.jpg", images: ["/images/REVIEW BOARD NFC 799.jpg", "/images/ID.jpeg", "/images/digital invitation.jpg"] }
];

// --- 4. SHOWCASE DATA (10 SECTIONS - 2 PRODUCTS PER CATEGORY) ---
export const showcaseData = [
  { categoryTitle: "Photo Frames", categoryId: "frames", products: [ products[0], products[1] ] },
  { categoryTitle: "Magazines & Books", categoryId: "magazines", products: [ products[13], products[14] ] },
  { categoryTitle: "Polaroids & Memories", categoryId: "memories", products: [ products[20], products[21] ] },
  { categoryTitle: "Flowers & Bouquets", categoryId: "flowers", products: [ products[24], products[25] ] },
  { categoryTitle: "Hampers & Combos", categoryId: "hampers", products: [ products[30], products[31] ] },
  { categoryTitle: "T-Shirts & Apparel", categoryId: "apparel", products: [ products[33], products[34] ] },
  { categoryTitle: "Phone Cases & Essentials", categoryId: "essentials", products: [ products[37], products[38] ] },
  { categoryTitle: "Calendars & Magnets", categoryId: "addons", products: [ products[41], products[42] ] },
  { categoryTitle: "Vintage Collection", categoryId: "vintage", products: [ products[44], products[45] ] },
  { categoryTitle: "Smart & Digital Services", categoryId: "smart-digital", products: [ products[47], products[48] ] },
];

// Categories array (kept for internal use if needed, empty is fine)
export const categories = [];