import { CircleAlert, ShieldCheck } from "lucide-react";

export const businesses = [
  {
    name: "Aravalli Heritage Walks",
    type: "Licensed Tourist Guide",
    id: "RJ-GUIDE-20481",
    place: "Amber Fort, Jaipur",
    status: "Verified",
    color: "bg-teal-100 text-teal-700",
  },
  {
    name: "Saffron Courtyard",
    type: "Restaurant",
    id: "RJ-FNB-88190",
    place: "Bapu Bazaar, Jaipur",
    status: "Verified",
    color: "bg-teal-100 text-teal-700",
  },
  {
    name: "Pink City Cab Services",
    type: "Tour Operator",
    id: "RJ-TOUR-10732",
    place: "Jaipur",
    status: "Verified",
    color: "bg-teal-100 text-teal-700",
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
];
