"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "hi";

interface Translations {
  [key: string]: {
    en: string;
    hi: string;
  };
}

export const translations: Translations = {
  // Brand & Navigation
  appName: { en: "Mandi Express", hi: "मंडी एक्सप्रेस" },
  farmerPortal: { en: "Farmer Portal", hi: "किसान पोर्टल" },
  transporterPortal: { en: "Transporter Portal", hi: "ट्रांसपोर्टर पोर्टल" },
  adminPortal: { en: "Admin Portal", hi: "एडमिन पोर्टल" },
  navDashboard: { en: "Dashboard", hi: "डैशबोर्ड" },
  navEnquiries: { en: "My Enquiries", hi: "मेरी बुकिंग्स" },
  navBookTransport: { en: "Book Transport", hi: "गाड़ी बुक करें" },
  navMandiPrices: { en: "Live Mandi Rates", hi: "मंडी भाव" },
  navPickupRequests: { en: "Pickup Requests", hi: "पिकअप अनुरोध" },
  navTrips: { en: "Trips & Tracking", hi: "मेरी ट्रिप्स" },
  navEarnings: { en: "Earnings & Cash", hi: "कमाई और कैश" },
  navLogout: { en: "Sign Out / Logout", hi: "साइन आउट / लॉगआउट" },
  navProfile: { en: "Profile", hi: "प्रोफाइल" },

  // Actions & Buttons
  newBooking: { en: "Book Transport", hi: "गाड़ी बुक करें" },
  confirmBooking: { en: "Confirm Booking", hi: "बुकिंग पक्की करें" },
  cancel: { en: "Cancel", hi: "रद्द करें" },
  submitting: { en: "Submitting...", hi: "जमा हो रहा है..." },
  orderNow: { en: "Order Now", hi: "ऑर्डर करें" },
  submitOrder: { en: "Submit Order", hi: "ऑर्डर भेजें" },
  viewAll: { en: "View All", hi: "सभी देखें" },
  updateStatus: { en: "Update Status", hi: "अपडेट करें" },
  viewDetails: { en: "View Details", hi: "विवरण देखें" },
  speakInput: { en: "Tap to Speak", hi: "बोलकर दर्ज करें" },
  acceptRequest: { en: "Accept Request", hi: "स्वीकार करें" },
  rejectRequest: { en: "Reject Request", hi: "अस्वीकार करें" },
  recordCashPayment: { en: "Record Cash Payment", hi: "नकद भुगतान दर्ज करें" },
  backToEnquiries: { en: "Back to Enquiries", hi: "वापस बुकिंग्स पर जाएं" },
  backToTrips: { en: "Back to Trips", hi: "वापस ट्रिप्स पर जाएं" },
  refresh: { en: "Refresh", hi: "ताज़ा करें" },

  // Hero & Greeting Headers
  heroGreeting: { en: "Namaste", hi: "नमस्ते" },
  heroFarmerSubtitle: {
    en: "Book verified trucks for your harvest, lock in transparent transport rates, and track your crop live.",
    hi: "अपनी फसल के लिए सत्यापित गाड़ियां बुक करें, पारदर्शी किराया प्राप्त करें और लाइव ट्रैक करें।",
  },
  heroTransporterSubtitle: {
    en: "Manage incoming pickup assignments, execute active trips, update odometer, and record cash earnings.",
    hi: "पिकअप अनुरोध स्वीकार करें, एक्टिव ट्रिप्स चलाएं और अपनी नकद कमाई दर्ज करें।",
  },
  instantUpfrontBadge: {
    en: "Instant Upfront Rates & Verified Drivers",
    hi: "तुरंत तय किराया और सत्यापित ड्राइवर",
  },

  // Form Fields & Labels
  pickupLocation: { en: "Pickup Location", hi: "पिकअप का स्थान (गाँव / मंडी)" },
  pickupLocationPlaceholder: { en: "Enter farm or village name", hi: "गाँव या खेत का नाम दर्ज करें" },
  destinationLocation: { en: "Drop Location", hi: "ड्रॉप का स्थान (मंडी / शहर)" },
  destinationLocationPlaceholder: { en: "Enter drop mandi or city name", hi: "मंडी या शहर का नाम दर्ज करें" },
  pickupDate: { en: "Pickup Date", hi: "पिकअप की तारीख" },
  preferredTime: { en: "Preferred Time Slot", hi: "पसंद का समय" },
  cropMaterial: { en: "Crop / Material", hi: "फसल / सामग्री" },
  cropMaterialPlaceholder: { en: "e.g. Wheat, Paddy, Potato, Fertilizers", hi: "जैसे: गेहूँ, धान, मक्का, आलू, खाद" },
  weightKgLabel: { en: "Total Weight (in Quintals)", hi: "कुल वजन (क्विंटल में)" },
  weightKgPlaceholder: { en: "e.g. 10 or 50", hi: "जैसे: 10 या 50" },
  weightHint: { en: "1 Quintal = 100 Kg | 10 Quintals = 1 Tonne", hi: "1 क्विंटल = 100 किलो | 10 क्विंटल = 1 टन" },
  quintals: { en: "Quintals", hi: "क्विंटल" },
  labourRequired: { en: "Need Labour for Loading/Unloading?", hi: "क्या लोड/अनलोड के लिए लेबर चाहिए?" },
  labourYes: { en: "Yes, Labour Required", hi: "हाँ, लेबर चाहिए" },
  labourNo: { en: "No Labour Needed", hi: "नहीं, लेबर नहीं चाहिए" },
  specialNotes: { en: "Special Instructions for Driver (Optional)", hi: "ड्राइवर के लिए खास निर्देश (ऐच्छिक)" },
  notesPlaceholder: { en: "e.g. Narrow approach road, meet at Mandi Gate No. 2", hi: "जैसे: संकरी सड़क, मंडी गेट नंबर 2 पर मिलना" },

  // Upfront Price Box & Cards
  upfrontGuaranteedBadge: { en: "Upfront Guaranteed Estimate", hi: "तुरंत तय अनुमानित किराया" },
  estimatedPrice: { en: "Upfront Total Price", hi: "कुल अनुमानित किराया" },
  transportCharge: { en: "Transport Charge", hi: "गाड़ी भाड़ा" },
  labourCharge: { en: "Labour Charge", hi: "लेबर मजदूरी" },
  nearbyMatching: { en: "Nearby Capacity Matching", hi: "पास के क्षमता अनुसार ड्राइवर" },
  activeDriversCount: { en: "Active Drivers Nearby", hi: "एक्टिव ड्राइवर्स पास में हैं" },
  autoAssignNote: { en: "Auto-assigned on confirmation", hi: "कन्फर्म करने पर ऑटो-असाइन हो जाएगा" },
  inclusiveTaxes: { en: "Inclusive of transport & taxes", hi: "परिवहन और टैक्स सहित" },
  labourUnavailableMsg: { en: "Labour is not available at the moment in your area", hi: "आपके क्षेत्र में इस समय लेबर उपलब्ध नहीं है" },

  // AI Voice Booking
  aiVoiceTitle: { en: "Auto-Fill Booking via Voice 🎙️", hi: "आवाज़ से पूरी बुकिंग भरें 🎙️" },
  aiVoiceDesc: { en: "Speak crop, weight, pickup & mandi location in one sentence", hi: "एक वाक्य में फसल, वजन, पिकअप गांव और मंडी का नाम बोलें" },
  aiRecordBtn: { en: "Record Voice", hi: "आवाज़ रिकॉर्ड करें" },
  aiStopBtn: { en: "Stop Recording", hi: "रिकॉर्डिंग रोकें" },
  aiProcessingMsg: { en: "AI Assistant processing voice...", hi: "AI आवाज़ समझ रहा है..." },
  aiSuccessToast: { en: "Form auto-filled successfully using AI Assistant!", hi: "AI द्वारा फॉर्म ऑटो-फिल हो गया!" },

  // Agri Supplies
  orderAgriSupplies: { en: "Order Fertilizers & Pesticides", hi: "खाद और कीटनाशक मँगवाएं" },
  orderAgriSuppliesDesc: { en: "Direct delivery of seeds, urea, pesticides to your farm", hi: "खाद, बीज और दवाइयां सीधे अपने खेत पर मँगवाएं" },
  itemRequired: { en: "Item Required", hi: "सामग्री का नाम" },
  itemQuantity: { en: "Quantity Required", hi: "आवश्यक मात्रा" },
  farmDeliveryAddress: { en: "Delivery Address", hi: "डिलीवरी का पता" },
  orderSuccessTitle: { en: "Order Request Sent!", hi: "ऑर्डर अनुरोध भेज दिया गया!" },
  orderSuccessDesc: { en: "Admin and nearby drivers have been notified. Transport will be assigned shortly.", hi: "एडमिन और पास के ड्राइवर्स को सूचित कर दिया गया है। जल्द ही वाहन असाइन होगा।" },

  // Dashboard & List Headers
  totalEnquiriesStat: { en: "Total Enquiries", hi: "कुल बुकिंग्स" },
  inTransitStat: { en: "In Transit", hi: "रास्ते में (ऑन रोड)" },
  deliveredMandiStat: { en: "Delivered to Mandi", hi: "मंडी डिलीवर हुआ" },
  mandiCropsStat: { en: "Live Mandi Crops", hi: "लाइव मंडी भाव" },
  pendingRequestsStat: { en: "Pending Requests", hi: "लंबित अनुरोध" },
  activeRoadTripsStat: { en: "Active Road Trips", hi: "एक्टिव ट्रिप्स" },
  completedTripsStat: { en: "Trips Completed", hi: "पूरी हुई ट्रिप्स" },
  cashCollectedStat: { en: "Cash Collected", hi: "नकद प्राप्त हुआ" },
  recentBookingsTitle: { en: "Recent Transport Bookings", hi: "हाल ही की बुकिंग्स" },
  myEnquiriesTitle: { en: "My Transport Enquiries", hi: "मेरी ट्रांसपोर्ट बुकिंग्स" },
  mandiRatesTodayTitle: { en: "Mandi Rates Today", hi: "आज के मंडी भाव" },
  myTripsHistoryTitle: { en: "My Trips & Execution History", hi: "मेरी ट्रिप्स और इतिहास" },
  pickupRequestsTitle: { en: "Pending Pickup Requests", hi: "लंबित पिकअप अनुरोध" },
  earningsTitle: { en: "Transporter Earnings & Cash", hi: "ट्रांसपोर्टर कमाई और कैश" },
  filterAll: { en: "All", hi: "सभी" },
  filterActive: { en: "Active", hi: "एक्टिव" },
  filterCompleted: { en: "Completed", hi: "पूरी हुई" },
  noTripsFoundTitle: { en: "No Trips Found", hi: "कोई ट्रिप नहीं मिली" },
  noTripsFoundDesc: { en: "You do not have any trips matching the selected filter.", hi: "चुने गए फ़िल्टर के अनुसार कोई ट्रिप उपलब्ध नहीं है।" },
  noEnquiriesTitle: { en: "No Transport Enquiries Yet", hi: "अभी तक कोई बुकिंग नहीं हुई है" },
  noEnquiriesDesc: { en: "Book your first harvest transport to Mandi now.", hi: "मंडी के लिए अपनी पहली फसल ट्रांसपोर्ट बुक करें।" },
  farmerLabel: { en: "Farmer", hi: "किसान" },
  transporterLabel: { en: "Transporter", hi: "ट्रांसपोर्टर" },

  // Status Labels
  statusSUBMITTED: { en: "Booking Placed", hi: "बुकिंग दर्ज हुई" },
  statusADMIN_ACCEPTED: { en: "Accepted by Admin", hi: "एडमिन द्वारा स्वीकृत" },
  statusTRANSPORTER_ASSIGNED: { en: "Transporter Assigned", hi: "ट्रांसपोर्टर असाइन हुआ" },
  statusTRANSPORTER_ACCEPTED: { en: "Accepted by Driver", hi: "ड्राइवर द्वारा स्वीकृत" },
  statusPICKUP: { en: "Goods Picked Up", hi: "माल पिकअप हुआ" },
  statusIN_TRANSIT: { en: "In Transit", hi: "रास्ते में (ऑन रोड)" },
  statusON_DESTINATION: { en: "Arrived at Mandi", hi: "मंडी पहुँचा" },
  statusDELIVERED: { en: "Delivered", hi: "सफलतापूर्वक डिलीवर हुआ" },
  statusPAYMENT_COMPLETED: { en: "Payment Completed", hi: "भुगतान पूर्ण हुआ" },
  statusCANCELLED: { en: "Cancelled", hi: "रद्द हुआ" },

  // Details Page Labels
  tripNumber: { en: "Trip Number", hi: "ट्रिप नंबर" },
  enquiryNumber: { en: "Enquiry Number", hi: "बुकिंग नंबर" },
  createdDate: { en: "Date Created", hi: "बुकिंग की तारीख" },
  pricingBreakdown: { en: "Pricing Breakdown", hi: "किराया विवरण" },
  vehicleAssigned: { en: "Vehicle Assigned", hi: "असाइन की गई गाड़ी" },
  driverDetails: { en: "Driver Details", hi: "ड्राइवर विवरण" },
  farmerDetails: { en: "Farmer Details", hi: "किसान विवरण" },
  statusTimeline: { en: "Status Timeline", hi: "स्टेटस टाइमलाइन" },
  odometerReading: { en: "Odometer Reading", hi: "ओडोमीटर रीडिंग" },
  startOdometer: { en: "Start Odometer", hi: "शुरुआती ओडोमीटर" },
  endOdometer: { en: "End Odometer", hi: "अंतिम ओडोमीटर" },
  receiptNumber: { en: "Receipt Number", hi: "रसीद नंबर" },
  paymentStatus: { en: "Payment Status", hi: "भुगतान स्थिति" },
  paymentMethod: { en: "Payment Method", hi: "भुगतान माध्यम" },
  cash: { en: "Cash", hi: "नकद (कैश)" },
  paid: { en: "Paid", hi: "भुगतान हुआ" },
  pending: { en: "Pending", hi: "लंबित" },

  // Mandi Price Grades
  gradesTitle: { en: "Quality Grades & Rates", hi: "क्वालिटी ग्रेड और भाव" },
  gradeName: { en: "Grade Name", hi: "ग्रेड नाम" },
  minPrice: { en: "Min Price (₹)", hi: "न्यूनतम भाव (₹)" },
  maxPrice: { en: "Max Price (₹)", hi: "अधिकतम भाव (₹)" },
  addGrade: { en: "Add Grade", hi: "नया ग्रेड जोड़ें" },
  removeGrade: { en: "Remove", hi: "हटाएं" },
  gradeBreakdown: { en: "Grade-wise Rates", hi: "ग्रेड अनुसार भाव" },
  priceRange: { en: "Price Range", hi: "भाव सीमा" },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("mandi_lang") as Language;
    if (saved && (saved === "hi" || saved === "en")) {
      setLanguage(saved);
    }
  }, []);

  const changeLanguage = React.useCallback((lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("mandi_lang", lang);
  }, []);

  const t = React.useCallback(
    (key: string): string => {
      if (translations[key] && translations[key][language]) {
        return translations[key][language];
      }
      return key;
    },
    [language]
  );

  const contextValue = React.useMemo(
    () => ({ language, setLanguage: changeLanguage, t }),
    [language, changeLanguage, t]
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
