import { CircleAlert, ShieldCheck } from "lucide-react";

export const businesses = [
  // Hotels
  {
    name: "Hotel Nahargarh Haveli",
    type: "Hotel",
    id: "RJ-HTL-30210",
    place: "Amer Road, Jaipur",
    status: "Verified",
    color: "bg-teal-100 text-teal-700",
    category: "hotel",
  },
  {
    name: "The Lalit Jaipur",
    type: "Hotel",
    id: "RJ-HTL-30455",
    place: "Civil Lines, Jaipur",
    status: "Verified",
    color: "bg-teal-100 text-teal-700",
    category: "hotel",
  },
  {
    name: "Raj Palace Heritage",
    type: "Hotel",
    id: "RJ-HTL-30782",
    place: "Chomu House, Jaipur",
    status: "Verified",
    color: "bg-teal-100 text-teal-700",
    category: "hotel",
  },
  {
    name: "Sunrise Guest House",
    type: "Guest House",
    id: "RJ-GH-41120",
    place: "MI Road, Jaipur",
    status: "Unverified",
    color: "bg-rose-100 text-rose-700",
    category: "hotel",
  },

  // Restaurants
  {
    name: "Saffron Courtyard",
    type: "Restaurant",
    id: "RJ-FNB-88190",
    place: "Bapu Bazaar, Jaipur",
    status: "Verified",
    color: "bg-teal-100 text-teal-700",
    category: "restaurant",
  },
  {
    name: "Laxmi Mishthan Bhandar (LMB)",
    type: "Restaurant",
    id: "RJ-FNB-88023",
    place: "Johari Bazaar, Jaipur",
    status: "Verified",
    color: "bg-teal-100 text-teal-700",
    category: "restaurant",
  },
  {
    name: "Chokhi Dhani",
    type: "Restaurant & Cultural Village",
    id: "RJ-FNB-88340",
    place: "Tonk Road, Jaipur",
    status: "Verified",
    color: "bg-teal-100 text-teal-700",
    category: "restaurant",
  },
  {
    name: "Highway Dhaba 99",
    type: "Restaurant",
    id: "RJ-FNB-88999",
    place: "NH-48, Jaipur",
    status: "Unverified",
    color: "bg-rose-100 text-rose-700",
    category: "restaurant",
  },

  // Guides
  {
    name: "Aravalli Heritage Walks",
    type: "Licensed Tourist Guide",
    id: "RJ-GUIDE-20481",
    place: "Amber Fort, Jaipur",
    status: "Verified",
    color: "bg-teal-100 text-teal-700",
    category: "guide",
  },
  {
    name: "Rajesh Kumar — Govt. Guide",
    type: "Licensed Tourist Guide",
    id: "RJ-GUIDE-20115",
    place: "Hawa Mahal, Jaipur",
    status: "Verified",
    color: "bg-teal-100 text-teal-700",
    category: "guide",
  },
  {
    name: "Fort Explorers Jaipur",
    type: "Licensed Tourist Guide",
    id: "RJ-GUIDE-20390",
    place: "Nahargarh Fort, Jaipur",
    status: "Verified",
    color: "bg-teal-100 text-teal-700",
    category: "guide",
  },

  // Tour Operators & Transport
  {
    name: "Pink City Cab Services",
    type: "Tour Operator",
    id: "RJ-TOUR-10732",
    place: "Jaipur",
    status: "Verified",
    color: "bg-teal-100 text-teal-700",
    category: "transport",
  },
  {
    name: "Royal Rajasthan Travels",
    type: "Tour Operator",
    id: "RJ-TOUR-10540",
    place: "Station Road, Jaipur",
    status: "Verified",
    color: "bg-teal-100 text-teal-700",
    category: "transport",
  },
  {
    name: "Quick Ride Auto",
    type: "Auto Rickshaw Service",
    id: "RJ-TOUR-10998",
    place: "Sindhi Camp, Jaipur",
    status: "Unverified",
    color: "bg-rose-100 text-rose-700",
    category: "transport",
  },

  // Shops
  {
    name: "Gem Palace",
    type: "Handicraft & Jewellery",
    id: "RJ-SHOP-50120",
    place: "MI Road, Jaipur",
    status: "Verified",
    color: "bg-teal-100 text-teal-700",
    category: "shop",
  },
  {
    name: "Anokhi Museum Shop",
    type: "Handicraft Store",
    id: "RJ-SHOP-50245",
    place: "Amber, Jaipur",
    status: "Verified",
    color: "bg-teal-100 text-teal-700",
    category: "shop",
  },
];

export const advisories = [
  {
    title: "Amber Fort visitor guidance",
    text: "Use only authorised guides and request a printed or digital bill.",
    icon: ShieldCheck,
  },
  {
    title: "Festival crowd advisory",
    text: "Keep valuables secure and use official taxi stands after 8 PM.",
    icon: CircleAlert,
  },
  {
    title: "Beware of fake gem shops",
    text: "Purchase gemstones only from government-certified dealers with a valid GST bill.",
    icon: CircleAlert,
  },
  {
    title: "Auto-rickshaw fare guidance",
    text: "Always insist on the meter or agree on a fare before starting. Use prepaid auto counters at stations.",
    icon: ShieldCheck,
  },
];
