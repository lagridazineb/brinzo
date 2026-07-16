// legalContent.js
// ---------------------------------------------------------------
// Structured content for every legal page, rendered by the shared
// Legal.jsx template. Each document is broken into { id, title,
// body } sections so the page can build a working in-page nav and
// proper heading hierarchy, instead of dumping raw text.
//
// body is an array of blocks:
//   { type: "p", text }
//   { type: "list", items: [...] }
//   { type: "note", text }   — for emphasized callouts
// ---------------------------------------------------------------

export const EFFECTIVE_DATE = "10 July 2026";
export const CONTACT_EMAIL = "brinzokannur@gmail.com";

export const LEGAL_DOCS = {
  terms: {
    slug: "terms",
    label: "Terms & Conditions",
    shortLabel: "Terms",
    summary: "The agreement covering your use of BRINZO's website and delivery service.",
    sections: [
      {
        id: "about",
        title: "1. About BRINZO",
        body: [
          { type: "p", text: "BRINZO is a local pickup and delivery platform operating in Kannur, Kerala. We connect customers with delivery partners to collect and deliver eligible items within our service area." },
        ],
      },
      {
        id: "eligibility",
        title: "2. Eligibility",
        body: [
          { type: "p", text: "You must be at least 18 years old or use our services under the supervision of a parent or legal guardian." },
        ],
      },
      {
        id: "service-area",
        title: "3. Service Area",
        body: [
          { type: "p", text: "Our services are available only in locations where BRINZO currently operates. Delivery availability may change from time to time." },
        ],
      },
      {
        id: "orders",
        title: "4. Orders",
        body: [
          { type: "p", text: "Customers are responsible for providing accurate pickup and delivery addresses, contact numbers, and item descriptions." },
          { type: "p", text: "Incorrect information may result in delays, additional charges, or cancellation of the order." },
        ],
      },
      {
        id: "delivery-charges",
        title: "5. Delivery Charges",
        body: [
          { type: "p", text: "Delivery charges are calculated based on factors such as distance, delivery location, waiting time, and any applicable service fees." },
          { type: "p", text: "The final amount will be displayed before the order is confirmed." },
        ],
      },
      {
        id: "payment",
        title: "6. Payment",
        body: [
          { type: "p", text: "We currently accept:" },
          { type: "list", items: ["Cash on Delivery (COD)", "Online Payments (where available)"] },
          { type: "p", text: "Customers agree to pay all applicable delivery charges and service fees." },
        ],
      },
      {
        id: "customer-responsibilities",
        title: "7. Customer Responsibilities",
        body: [
          { type: "p", text: "Customers must:" },
          { type: "list", items: [
            "Ensure the item is properly packed.",
            "Provide accurate delivery details.",
            "Be available to hand over or receive the parcel.",
            "Ensure the item is legal to transport.",
          ] },
        ],
      },
      {
        id: "prohibited-items",
        title: "8. Prohibited Items",
        body: [
          { type: "p", text: "BRINZO does not transport illegal or prohibited items, including but not limited to:" },
          { type: "list", items: [
            "Illegal drugs or narcotics",
            "Weapons or ammunition",
            "Explosives",
            "Hazardous chemicals",
            "Counterfeit goods",
            "Live animals",
            "Items prohibited by Indian law",
          ] },
          { type: "note", text: "BRINZO reserves the right to refuse any order that violates these Terms." },
        ],
      },
      {
        id: "delivery-times",
        title: "9. Delivery Times",
        body: [
          { type: "p", text: "Estimated delivery times are provided for convenience only and may vary due to traffic, weather, road conditions, or unforeseen circumstances." },
        ],
      },
      {
        id: "cancellation",
        title: "10. Order Cancellation",
        body: [
          { type: "p", text: "Orders may be cancelled in accordance with BRINZO's Cancellation & Refund Policy." },
        ],
      },
      {
        id: "liability",
        title: "11. Liability",
        body: [
          { type: "p", text: "BRINZO will take reasonable care while providing its services. However, we are not responsible for:" },
          { type: "list", items: [
            "Incorrect information provided by customers.",
            "Delays caused by events beyond our reasonable control.",
            "Losses arising from prohibited or improperly packed items.",
          ] },
          { type: "p", text: "Nothing in these Terms excludes any liability that cannot legally be excluded under applicable law." },
        ],
      },
      {
        id: "privacy",
        title: "12. Privacy",
        body: [
          { type: "p", text: "Customer information is handled in accordance with our Privacy Policy." },
        ],
      },
      {
        id: "changes",
        title: "13. Changes to These Terms",
        body: [
          { type: "p", text: "BRINZO may update these Terms & Conditions from time to time. Updated versions will be published on our website." },
        ],
      },
    ],
  },

  privacy: {
    slug: "privacy",
    label: "Privacy Policy",
    shortLabel: "Privacy",
    summary: "How BRINZO collects, uses, stores, and protects your personal information.",
    sections: [
      {
        id: "info-collected",
        title: "1. Information We Collect",
        body: [
          { type: "p", text: "When you use BRINZO, we may collect:" },
          { type: "list", items: [
            "Full name",
            "Mobile number",
            "Email address",
            "Pickup and delivery addresses",
            "Receiver's name and phone number",
            "Payment method",
            "Delivery instructions or notes",
            "Order history",
            "IP address and device information when using our website",
          ] },
        ],
      },
      {
        id: "how-we-use",
        title: "2. How We Use Your Information",
        body: [
          { type: "p", text: "We use your information to:" },
          { type: "list", items: [
            "Process your delivery orders",
            "Assign delivery partners",
            "Contact you regarding your order",
            "Send order updates and notifications",
            "Improve our services",
            "Prevent fraud and misuse",
            "Comply with legal obligations",
          ] },
        ],
      },
      {
        id: "sharing",
        title: "3. Sharing Your Information",
        body: [
          { type: "p", text: "We only share the information necessary to complete your delivery. This may include:" },
          { type: "list", items: [
            "Delivery partners assigned to your order",
            "Payment service providers",
            "Government authorities if required by law",
          ] },
          { type: "note", text: "We do not sell or rent your personal information to third parties." },
        ],
      },
      {
        id: "security",
        title: "4. Data Security",
        body: [
          { type: "p", text: "We take reasonable administrative and technical measures to protect your personal information against unauthorized access, loss, misuse, or disclosure." },
          { type: "p", text: "However, no website or electronic storage system can be guaranteed to be completely secure." },
        ],
      },
      {
        id: "cookies",
        title: "5. Cookies",
        body: [
          { type: "p", text: "Our website may use cookies and similar technologies to improve your browsing experience, remember your preferences, and analyze website traffic." },
          { type: "p", text: "You may disable cookies through your browser settings, although some website features may not function properly." },
        ],
      },
      {
        id: "location",
        title: "6. Location Information",
        body: [
          { type: "p", text: "If you allow location access, BRINZO may use your location solely to help calculate delivery routes, estimate delivery charges, and improve delivery efficiency." },
        ],
      },
      {
        id: "payment-info",
        title: "7. Payment Information",
        body: [
          { type: "p", text: "Online payments are processed through secure third-party payment providers." },
          { type: "note", text: "BRINZO does not store your debit card, credit card, or banking passwords." },
        ],
      },
      {
        id: "retention",
        title: "8. Data Retention",
        body: [
          { type: "p", text: "We retain your information only for as long as reasonably necessary to:" },
          { type: "list", items: [
            "Complete deliveries",
            "Maintain business records",
            "Resolve disputes",
            "Comply with applicable laws and regulations",
          ] },
        ],
      },
      {
        id: "your-rights",
        title: "9. Your Rights",
        body: [
          { type: "p", text: "You may request to:" },
          { type: "list", items: [
            "Access your personal information",
            "Correct inaccurate information",
            "Update your contact details",
            "Request deletion of your personal information where legally permitted",
          ] },
          { type: "p", text: "Some information may need to be retained to comply with legal or accounting requirements." },
        ],
      },
      {
        id: "third-party-links",
        title: "10. Third-Party Links",
        body: [
          { type: "p", text: "Our website may contain links to third-party websites. BRINZO is not responsible for the privacy practices or content of external websites." },
        ],
      },
      {
        id: "childrens-privacy",
        title: "11. Children's Privacy",
        body: [
          { type: "p", text: "BRINZO services are not intended for children under 18 years of age without the supervision of a parent or legal guardian." },
        ],
      },
      {
        id: "changes",
        title: "12. Changes to this Privacy Policy",
        body: [
          { type: "p", text: "BRINZO may update this Privacy Policy from time to time. The latest version will always be published on our website with the updated effective date." },
        ],
      },
    ],
  },

  delivery: {
    slug: "delivery",
    label: "Delivery Policy",
    shortLabel: "Delivery",
    summary: "How pickup and delivery works, operating hours, and what affects delivery times.",
    sections: [
      {
        id: "service-area",
        title: "1. Service Area",
        body: [
          { type: "p", text: "BRINZO currently provides pickup and delivery services within our designated service areas in Kannur, Kerala." },
          { type: "p", text: "Orders outside our service area may be declined or may incur additional delivery charges." },
        ],
      },
      {
        id: "hours",
        title: "2. Operating Hours",
        body: [
          { type: "note", text: "Monday – Sunday · 7:00 AM – 11:00 PM" },
          { type: "p", text: "Orders placed outside our working hours will be processed when our service resumes." },
        ],
      },
      {
        id: "pickup-process",
        title: "3. Pickup Process",
        body: [
          { type: "p", text: "After your order is confirmed:" },
          { type: "list", items: [
            "A BRINZO delivery partner will be assigned.",
            "The rider will travel to the pickup location.",
            "The sender must hand over the item in a properly packed condition.",
            "The rider may verify the item description before accepting the parcel.",
          ] },
        ],
      },
      {
        id: "packaging",
        title: "4. Packaging",
        body: [
          { type: "p", text: "Customers are responsible for securely packing their items before pickup." },
          { type: "p", text: "BRINZO is not responsible for damage caused by inadequate or improper packaging." },
          { type: "note", text: "Fragile items should be clearly marked as \"Fragile.\"" },
        ],
      },
      {
        id: "delivery-process",
        title: "5. Delivery Process",
        body: [
          { type: "p", text: "The delivery partner will transport the item to the delivery address provided by the customer." },
          { type: "p", text: "The receiver may be asked to confirm receipt before the delivery is marked as completed." },
        ],
      },
      {
        id: "delivery-time",
        title: "6. Delivery Time",
        body: [
          { type: "p", text: "Estimated delivery times depend on:" },
          { type: "list", items: [
            "Distance",
            "Traffic conditions",
            "Weather",
            "Road closures",
            "Rider availability",
            "Other unforeseen circumstances",
          ] },
          { type: "note", text: "Estimated delivery times are not guaranteed." },
        ],
      },
      {
        id: "availability",
        title: "7. Customer Availability",
        body: [
          { type: "p", text: "The sender and receiver should be available at their respective locations during the delivery process." },
          { type: "p", text: "If either party cannot be contacted, the delivery may be delayed, cancelled, or returned to the sender. Additional charges may apply for re-delivery or return trips." },
        ],
      },
      {
        id: "charges",
        title: "8. Delivery Charges",
        body: [
          { type: "p", text: "Delivery charges are calculated based on factors including:" },
          { type: "list", items: [
            "Pickup location",
            "Delivery location",
            "Distance travelled",
            "Waiting time",
            "Additional services requested",
          ] },
          { type: "p", text: "The applicable delivery fee will be shown before the order is confirmed." },
        ],
      },
      {
        id: "prohibited-items",
        title: "9. Prohibited Items",
        body: [
          { type: "p", text: "BRINZO does not transport:" },
          { type: "list", items: [
            "Illegal drugs or narcotics",
            "Weapons or ammunition",
            "Explosives",
            "Hazardous or flammable materials",
            "Counterfeit or stolen goods",
            "Live animals",
            "Any item prohibited under Indian law",
          ] },
          { type: "note", text: "BRINZO reserves the right to refuse any shipment that violates this policy." },
        ],
      },
      {
        id: "damaged-lost",
        title: "10. Damaged or Lost Items",
        body: [
          { type: "p", text: "BRINZO takes reasonable care while handling deliveries." },
          { type: "p", text: "Customers should inspect their items upon delivery and report any issues as soon as possible. Claims will be reviewed based on the circumstances of each case." },
        ],
      },
      {
        id: "failed-deliveries",
        title: "11. Failed Deliveries",
        body: [
          { type: "p", text: "A delivery may be considered unsuccessful if:" },
          { type: "list", items: [
            "The receiver is unavailable.",
            "The address provided is incorrect or incomplete.",
            "The customer cannot be contacted.",
            "Delivery cannot be completed for safety or legal reasons.",
          ] },
          { type: "p", text: "Additional charges may apply for another delivery attempt or for returning the item to the sender." },
        ],
      },
      {
        id: "confirmation",
        title: "12. Delivery Confirmation",
        body: [
          { type: "p", text: "A delivery is considered complete when:" },
          { type: "list", items: [
            "The item has been handed over to the receiver or another person authorized by the receiver at the delivery address.",
            "The customer confirms successful delivery through the BRINZO platform, where applicable.",
          ] },
        ],
      },
    ],
  },

  prohibited: {
    slug: "prohibited",
    label: "Prohibited Items Policy",
    shortLabel: "Prohibited Items",
    summary: "What BRINZO cannot transport, and why — for the safety of our riders and customers.",
    intro: "At BRINZO, customer safety and compliance with applicable laws are our highest priorities. To ensure safe and lawful delivery services, certain items are strictly prohibited from being transported through our platform. By placing an order with BRINZO, you confirm that your shipment does not contain any prohibited item listed below.",
    sections: [
      {
        id: "illegal-items",
        title: "1. Illegal Items",
        body: [
          { type: "p", text: "BRINZO does not transport any item that is illegal under the laws of India, including but not limited to:" },
          { type: "list", items: [
            "Illegal drugs, narcotics, or controlled substances",
            "Stolen or counterfeit goods",
            "Smuggled goods",
            "Any item prohibited by law",
          ] },
        ],
      },
      {
        id: "weapons",
        title: "2. Weapons",
        body: [
          { type: "p", text: "The following items are strictly prohibited:" },
          { type: "list", items: [
            "Firearms",
            "Ammunition",
            "Explosives",
            "Fireworks",
            "Knives intended as weapons",
            "Swords or other dangerous weapons",
            "Any weapon restricted or prohibited by law",
          ] },
        ],
      },
      {
        id: "hazardous",
        title: "3. Hazardous Materials",
        body: [
          { type: "p", text: "BRINZO does not transport:" },
          { type: "list", items: [
            "Petrol, diesel, kerosene, or other fuels",
            "LPG cylinders",
            "Industrial gases",
            "Toxic chemicals",
            "Corrosive substances",
            "Flammable liquids or solids",
            "Radioactive materials",
            "Biohazardous or infectious materials",
          ] },
        ],
      },
      {
        id: "live-animals",
        title: "4. Live Animals",
        body: [
          { type: "p", text: "The transportation of live animals, birds, reptiles, insects, or any other living creatures is not permitted." },
        ],
      },
      {
        id: "human-remains",
        title: "5. Human Remains",
        body: [
          { type: "p", text: "BRINZO does not transport:" },
          { type: "list", items: [
            "Human remains",
            "Human organs",
            "Blood or blood products",
            "Biological samples requiring regulated handling",
          ] },
        ],
      },
      {
        id: "high-value",
        title: "6. High-Value Items",
        body: [
          { type: "p", text: "Unless specifically accepted in writing by BRINZO, we do not transport:" },
          { type: "list", items: [
            "Gold",
            "Silver bullion",
            "Diamonds",
            "Precious gemstones",
            "Large amounts of cash",
            "Valuable antiques",
            "Collectibles of exceptional value",
          ] },
          { type: "p", text: "Customers remain responsible for declaring the nature and value of their shipment." },
        ],
      },
      {
        id: "dangerous-goods",
        title: "7. Dangerous Goods",
        body: [
          { type: "p", text: "Items that may endanger our riders, customers, or the public are prohibited, including:" },
          { type: "list", items: [
            "Explosive materials",
            "Compressed gas containers",
            "Strong acids or alkalis",
            "Toxic waste",
            "Dangerous industrial chemicals",
          ] },
        ],
      },
      {
        id: "offensive-materials",
        title: "8. Illegal or Offensive Materials",
        body: [
          { type: "p", text: "BRINZO will not transport:" },
          { type: "list", items: [
            "Obscene or unlawful materials",
            "Items intended for criminal activities",
            "Fraudulent documents",
            "Counterfeit currency",
            "Any item prohibited by Indian law",
          ] },
        ],
      },
      {
        id: "perishables",
        title: "9. Perishable Items",
        body: [
          { type: "p", text: "Fresh food, frozen products, medicines requiring refrigeration, or other temperature-sensitive items may only be accepted if BRINZO confirms that appropriate handling is available." },
          { type: "p", text: "BRINZO is not responsible for spoilage resulting from delays or unsuitable packaging." },
        ],
      },
      {
        id: "right-to-refuse",
        title: "10. Right to Refuse Service",
        body: [
          { type: "p", text: "BRINZO reserves the right to:" },
          { type: "list", items: [
            "Refuse any shipment at its sole discretion.",
            "Inspect packages where legally permitted and reasonably necessary for safety or compliance.",
            "Cancel any order suspected of containing prohibited items.",
            "Report illegal activities to the appropriate authorities where required by law.",
          ] },
        ],
      },
      {
        id: "customer-responsibility",
        title: "11. Customer Responsibility",
        body: [
          { type: "p", text: "Customers are solely responsible for ensuring that:" },
          { type: "list", items: [
            "Their shipment complies with all applicable laws.",
            "The item is accurately described.",
            "The package is properly packed and safe for transport.",
          ] },
          { type: "note", text: "Providing false or misleading information may result in cancellation of the order, refusal of future service, and, where appropriate, reporting to law enforcement authorities." },
        ],
      },
    ],
  },

  safety: {
    slug: "safety",
    label: "Customer Safety Policy",
    shortLabel: "Safety",
    summary: "Safety standards for customers, delivery partners, and the wider community.",
    intro: "At BRINZO, the safety of our customers, delivery partners, and the community is our highest priority. This Customer Safety Policy explains the safety standards that apply when using our pickup and delivery services.",
    closingNote: "We are committed to maintaining a safe and trusted delivery service for everyone.",
    sections: [
      {
        id: "commitment",
        title: "1. Our Commitment",
        body: [
          { type: "p", text: "BRINZO is committed to providing a safe, reliable, and professional pickup and delivery experience. We strive to ensure every order is handled with care and delivered responsibly." },
        ],
      },
      {
        id: "customer-responsibilities",
        title: "2. Customer Responsibilities",
        body: [
          { type: "p", text: "Customers must:" },
          { type: "list", items: [
            "Provide accurate pickup and delivery addresses.",
            "Provide correct contact numbers for the sender and receiver.",
            "Ensure all items are securely packed before pickup.",
            "Clearly inform BRINZO if an item is fragile or requires special handling.",
            "Be available during pickup and delivery or arrange for an authorized person to receive the item.",
          ] },
        ],
      },
      {
        id: "safe-packaging",
        title: "3. Safe Packaging",
        body: [
          { type: "p", text: "Customers are responsible for properly packaging all items. Packages should:" },
          { type: "list", items: [
            "Be securely sealed.",
            "Be suitable for transportation by motorcycle or other delivery vehicles.",
            "Prevent leakage, breakage, or injury during transport.",
          ] },
          { type: "note", text: "BRINZO may refuse to transport items that are not safely packed." },
        ],
      },
      {
        id: "identity",
        title: "4. Identity and Verification",
        body: [
          { type: "p", text: "For security purposes, BRINZO may verify the identity of the sender or receiver before completing a delivery, where appropriate." },
        ],
      },
      {
        id: "rider-safety",
        title: "5. Rider Safety",
        body: [
          { type: "p", text: "Customers must treat BRINZO delivery partners with respect. The following behaviour is strictly prohibited:" },
          { type: "list", items: [
            "Threatening or abusive language.",
            "Physical violence.",
            "Harassment.",
            "Discrimination.",
            "Any illegal activity.",
          ] },
          { type: "note", text: "BRINZO reserves the right to suspend or permanently block customers who engage in unsafe or abusive behaviour." },
        ],
      },
      {
        id: "safe-locations",
        title: "6. Safe Delivery Locations",
        body: [
          { type: "p", text: "Customers should choose pickup and delivery locations that are:" },
          { type: "list", items: [
            "Safe and accessible.",
            "Legally accessible to delivery partners.",
            "Free from immediate danger.",
          ] },
          { type: "p", text: "BRINZO may refuse deliveries to locations that present a significant safety risk." },
        ],
      },
      {
        id: "prohibited-items",
        title: "7. Prohibited Items",
        body: [
          { type: "p", text: "Customers must not attempt to send any item prohibited under BRINZO's Prohibited Items Policy." },
          { type: "p", text: "If a prohibited item is discovered, BRINZO may refuse the shipment, cancel the order, or notify the appropriate authorities where required by law." },
        ],
      },
      {
        id: "delivery-confirmation",
        title: "8. Delivery Confirmation",
        body: [
          { type: "p", text: "Customers should inspect their package upon delivery. Any concerns regarding missing, damaged, or incorrect items should be reported to BRINZO as soon as reasonably possible." },
        ],
      },
      {
        id: "emergencies",
        title: "9. Emergency Situations",
        body: [
          { type: "p", text: "If an accident, severe weather, road closure, civil disturbance, or other emergency affects a delivery, BRINZO may delay, reschedule, or cancel the order in the interest of safety." },
        ],
      },
      {
        id: "fraud-prevention",
        title: "10. Fraud Prevention",
        body: [
          { type: "p", text: "Customers must not:" },
          { type: "list", items: [
            "Provide false information.",
            "Place fraudulent orders.",
            "Use stolen payment methods.",
            "Misuse promotional offers.",
            "Attempt to deceive delivery partners or BRINZO.",
          ] },
          { type: "note", text: "Fraudulent activity may result in cancellation of orders, suspension of the account, and legal action where appropriate." },
        ],
      },
      {
        id: "liability",
        title: "11. Limitation of Liability",
        body: [
          { type: "p", text: "While BRINZO takes reasonable care in providing its services, customers acknowledge that delivery involves transportation risks. BRINZO's liability, if any, will be subject to applicable law and the Terms & Conditions of the service." },
        ],
      },
    ],
  },

  disclaimer: {
    slug: "disclaimer",
    label: "Website Disclaimer",
    shortLabel: "Disclaimer",
    summary: "General terms covering the information and content presented on this website.",
    intro: "The information provided on the BRINZO website is for general informational and business purposes only. By accessing or using our website and services, you acknowledge and agree to this Disclaimer.",
    sections: [
      {
        id: "service-info",
        title: "1. Service Information",
        body: [
          { type: "p", text: "BRINZO makes reasonable efforts to ensure that the information on this website is accurate and up to date. However, we do not guarantee that all information, pricing, service availability, or delivery times will always be complete, accurate, or current." },
        ],
      },
      {
        id: "no-guarantee",
        title: "2. No Guarantee of Delivery Time",
        body: [
          { type: "p", text: "Estimated pickup and delivery times are provided for convenience only. Actual delivery times may vary due to traffic, weather, road conditions, rider availability, technical issues, public holidays, or other circumstances beyond our reasonable control." },
        ],
      },
      {
        id: "availability",
        title: "3. Service Availability",
        body: [
          { type: "p", text: "BRINZO reserves the right to modify, suspend, restrict, or discontinue any part of its services, service areas, pricing, or website functionality at any time without prior notice." },
        ],
      },
      {
        id: "customer-responsibility",
        title: "4. Customer Responsibility",
        body: [
          { type: "p", text: "Customers are responsible for:" },
          { type: "list", items: [
            "Providing accurate pickup and delivery details.",
            "Properly packing all items.",
            "Ensuring that shipments comply with all applicable laws and BRINZO policies.",
            "Verifying that the receiver's contact information is correct.",
          ] },
          { type: "p", text: "BRINZO is not responsible for delays or additional charges caused by incorrect or incomplete information provided by customers." },
        ],
      },
      {
        id: "third-party",
        title: "5. Third-Party Services",
        body: [
          { type: "p", text: "Our website may integrate with or provide access to third-party services, including payment gateways, maps, messaging services, or other external platforms." },
          { type: "p", text: "BRINZO is not responsible for the availability, content, security, or performance of any third-party service." },
        ],
      },
      {
        id: "liability",
        title: "6. Limitation of Liability",
        body: [
          { type: "p", text: "To the fullest extent permitted by applicable law, BRINZO shall not be liable for indirect, incidental, special, or consequential damages arising from the use of our website or services." },
          { type: "p", text: "Nothing in this Disclaimer limits or excludes any liability that cannot legally be limited or excluded under applicable law." },
        ],
      },
      {
        id: "ip",
        title: "7. Intellectual Property",
        body: [
          { type: "p", text: "All content on this website, including text, logos, graphics, images, icons, and design elements, is the property of BRINZO or its licensors unless otherwise stated." },
          { type: "p", text: "No content may be copied, reproduced, modified, distributed, or used for commercial purposes without prior written permission from BRINZO." },
        ],
      },
      {
        id: "changes",
        title: "8. Changes to This Disclaimer",
        body: [
          { type: "p", text: "BRINZO may update this Disclaimer from time to time. The latest version will always be available on our website. Continued use of the website after changes are posted constitutes acceptance of the updated Disclaimer." },
        ],
      },
    ],
  },
};

export const LEGAL_NAV_ORDER = ["terms", "privacy", "delivery", "prohibited", "safety", "disclaimer"];
