import "dotenv/config"; import mongoose from "mongoose"; import { Template } from "./models";
const T = [
  { title: "মহান বিজয় দিবস", occasionType: "বিজয় দিবস", layoutConfig: { photoSlots: 3, palette: { bg1: "#006a4e", bg2: "#003d2c", accent: "#f42a41", text: "#ffffff", decoration: "flag", photoFocus: "top" } } },
  { title: "শোক ও স্মরণ", occasionType: "শোক/স্মরণ", layoutConfig: { photoSlots: 1, palette: { bg1: "#2b2b2b", bg2: "#0d0d0d", accent: "#d9d9d9", text: "#ffffff", decoration: "candles", photoFocus: "top" } } },
  { title: "নির্বাচনী প্রচার", occasionType: "নির্বাচনী প্রচার", layoutConfig: { photoSlots: 2, palette: { bg1: "#b3122a", bg2: "#5c0a16", accent: "#ffd23f", text: "#ffffff", decoration: "paddy", photoFocus: "top" } } },
];
(async () => { await mongoose.connect(process.env.MONGO_URI!); await Template.deleteMany({}); await Template.insertMany(T); console.log("Seeded", T.length); process.exit(0); })();
