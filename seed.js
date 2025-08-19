import mongoose from "mongoose";
import Business from "./models/Business-occupancy.js";
import Account from "./models/Account.js";
import dotenv from "dotenv";

dotenv.config();

const generateBusinessPermits = (count, userId) => {
  const evaluators = [
    "Engr. Maria Santos",
    "Engr. Juan Dela Cruz",
    "Engr. Pedro Reyes",
    "Engr. Anna Lim",
    "Engr. Roberto Garcia",
    "Engr. Jocelyn Tan"
  ];

  const locations = [
    "SM City San Fernando, Telabastagan, San Fernando, Pampanga",
    "MacArthur Highway, San Agustin, San Fernando, Pampanga",
    "Dolores Junction, City of San Fernando, Pampanga",
    "Robinsons Starmills, San Fernando, Pampanga",
    "Jose Abad Santos Avenue, San Fernando, Pampanga",
    "Barangay Del Pilar, San Fernando, Pampanga",
    "Lazatin Boulevard, San Fernando, Pampanga",
    "Sindalan, San Fernando, Pampanga",
    "Capitol Boulevard, San Fernando, Pampanga",
    "Heroes Hall, San Fernando, Pampanga"
  ];

  const establishments = [
    "Jollibee Foods Corporation",
    "Mercury Drug Store",
    "SM Department Store",
    "Puregold Price Club",
    "National Bookstore",
    "Mang Inasal",
    "Goldilocks Bakeshop",
    "Chowking",
    "Red Ribbon Bakeshop",
    "Robinsons Supermarket",
    "Max's Restaurant",
    "BDO Unibank",
    "Metrobank",
    "Savemore Market",
    "Alma's Bakery",
    "San Fernando Hardware Supply",
    "Pampanga Fresh Seafood",
    "Central Luzon Medical Center",
    "Kapampangan Delicacies",
    "Pampanga Furniture Showcase",
    "San Fernando Auto Supply",
    "Pampanga Electronics Center",
    "Central Luzon Pharmacy",
    "Fernandino Bakery",
    "Luzon Computer Shop",
    "Pampanga Fresh Market",
    "City Appliance Center",
    "Provincial Medical Supply",
    "Pampanga Cellular Shop",
    "San Fernando Fishery Supply"
  ];

  const randomDate = (start, end) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const generateORNumber = (index) => {
    return `OR-${Math.floor(10000 + Math.random() * 90000)}-${index}`;
  };

  const permits = [];
  const usedCombinations = new Set();

  for (let i = 0; i < count; i++) {
    const dateReceived = randomDate(new Date('2024-01-01'), new Date('2028-12-31'));
    const dateReleased = null;
    const owner_establishment = establishments[Math.floor(Math.random() * establishments.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const controlNo = `BP-${dateReceived.getFullYear()}-${(i + 1).toString().padStart(5, '0')}`;
    const combination = `${owner_establishment}-${location}-${controlNo}`;

    if (usedCombinations.has(combination)) {
      i--;
      continue;
    }

    usedCombinations.add(combination);

    const fcode_fee = Math.floor(2000 + Math.random() * 8000).toString();

    const permit = {
      user: userId,
      date_received: formatDate(dateReceived),
      owner_establishment,
      location,
      fcode_fee,
      or_no: generateORNumber(i + 1),
      evaluated_by: evaluators[Math.floor(Math.random() * evaluators.length)],
      date_released_fsec: dateReleased,
      control_no: controlNo,
      status: "pending"
    };

    permits.push(permit);
  }

  return permits;
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const account = await Account.findOne({ email: "admin@gmail.com" });
    if (!account) throw new Error("No user found with email admin@gmail.com");
    await Business.deleteMany();
    const pendingPermits = generateBusinessPermits(500, account._id);
    await Business.insertMany(pendingPermits);
    console.log(`Successfully seeded ${pendingPermits.length} pending business permit records!`);
    process.exit();
  } catch (error) {
    console.error("Error seeding data:", error.message);
    process.exit(1);
  }
};

seedDatabase();
