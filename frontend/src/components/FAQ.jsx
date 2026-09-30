import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqData = [
    {
      question: "What motor should I choose for my drone?",
      answer: "Choosing the correct motor depends on your drone frame size, total takeoff weight (AUW), and target flight style. For 5-inch FPV freestyle or racing quadcopters, 2207 or 2306 motors with 1750KV–2450KV are ideal. For ultralight micro builds, 1404 or 1204 motors work best. For heavy-lift industrial UAVs, low-KV motors (100KV–380KV) paired with large propellers deliver maximum torque."
    },
    {
      question: "What does KV mean?",
      answer: "KV stands for RPM per volt under no-load conditions. For example, a 2400KV motor powered by a 4S (14.8V) LiPo battery will spin theoretically at 2400 × 14.8 = 35,520 RPM. Higher KV motors spin faster but produce less torque (best for small props), while lower KV motors produce more torque for larger propellers."
    },
    {
      question: "What is the difference between brushed and brushless motors?",
      answer: "Brushed motors use physical carbon brushes to pass electrical current to the spinning commutator, causing friction, wear, and lower efficiency. Brushless motors use electronic speed controllers (ESCs) to switch magnetic fields electromagnetically, resulting in 85–90%+ energy efficiency, higher RPMs, longer lifespan, and virtually maintenance-free performance."
    },
    {
      question: "How do I calculate required thrust?",
      answer: "As a rule of thumb for quadcopters, your total motor thrust should be at least 2 times (2:1) your drone's All-Up-Weight (AUW) for stable hovering and basic flight. For high-speed FPV racing or acrobatic freestyle drones, a thrust-to-weight ratio of 5:1 to 10:1 is recommended."
    },
    {
      question: "Can I use any motor with my drone?",
      answer: "No. Motors must be compatible with your drone frame's motor mounting pattern (e.g., 12x12mm, 16x16mm, 19x19mm), ESC current rating (amps), voltage rating (LiPo cell count like 4S or 6S), and propeller diameter."
    },
    {
      question: "How do I select the correct propeller?",
      answer: "Propeller pitch and diameter must match your motor's KV and stator size. Higher KV motors require smaller propellers with lower pitch to prevent motor overheating and ESC overload. Lower KV motors spin larger propellers with higher pitch to push larger volumes of air."
    },
    {
      question: "Do motor prices include GST?",
      answer: "Product prices displayed on Seval Drones show both Excl. GST and Incl. GST pricing breakdown transparently. Standard 18% GST applies to electronic motor components in India, and tax invoices with your company's GSTIN are generated upon checkout."
    },
    {
      question: "Do you provide pan-India delivery?",
      answer: "Yes! Seval Drones ships across India using premium express courier partners (Bluedart, Delhivery, DTDC, India Post). Standard delivery takes 3–5 business days, while Express shipping takes 1–2 business days for major metro cities."
    },
    {
      question: "What happens if a motor is out of stock?",
      answer: "For items marked 'Out of Stock', you can click the 'NOTIFY ME' button on the product card to receive instant email notifications as soon as fresh inventory arrives at our logistics hub."
    },
    {
      question: "Can I request a quote for bulk orders?",
      answer: "Absolutely. For industrial UAV manufacturers, university robotics labs, or bulk project requirements, select the 'REQUEST QUOTE' button or contact our technical sales team for GST bulk volume discounts."
    }
  ];

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section className="py-12 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider mb-2">
            <HelpCircle className="w-4 h-4" /> Clear Answers
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-navy">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Everything you need to know about Seval Drones motors, specifications, and shipping.
          </p>
        </div>

        <div className="space-y-3">
          {faqData.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="border border-gray-200 rounded-xl overflow-hidden transition-all duration-200 bg-white"
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(index)}
                  className="w-full p-4 sm:p-5 text-left font-bold text-navy text-sm sm:text-base flex items-center justify-between gap-4 hover:bg-gray-50/80 transition-colors"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-primary shrink-0 transition-transform duration-300 ${
                      isOpen ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/40">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
