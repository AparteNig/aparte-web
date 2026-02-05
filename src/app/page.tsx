"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";
import { Inria_Serif, Playfair_Display, Poppins } from "next/font/google";
import HeroImage from "@/assets/landing/HeroImage.png";
import AboutImage from "@/assets/landing/About us images.png";
import Logo from "@/assets/landing/Logo.png";
import Listing1 from "@/assets/landing/listing images.png";
import Listing2 from "@/assets/landing/listing images (1).png";
import Listing3 from "@/assets/landing/listing images (2).png";
import Listing4 from "@/assets/landing/listing images (3).png";
import Listing5 from "@/assets/landing/listing images (4).png";
import Listing6 from "@/assets/landing/listing images (5).png";
import Location1 from "@/assets/landing/wecover.png";
import Location2 from "@/assets/landing/wecover1.png";
import Location3 from "@/assets/landing/wecover2.png";
import Person11 from "@/assets/landing/client-photos/Persons11.png";
import Person12 from "@/assets/landing/client-photos/Persons12.png";
import Person13 from "@/assets/landing/client-photos/Persons13.png";
import Person14 from "@/assets/landing/client-photos/Persons14.png";
import Person15 from "@/assets/landing/client-photos/Persons15.png";
import SecureStayIcon from "@/assets/icons/SecureStay";
import VerifiedHomeIcon from "@/assets/icons/VerifiedHome";
import AllSupportIcon from "@/assets/icons/AllSupport";
import WifiIcon from "@/assets/icons/Wifi";
import PlugIcon from "@/assets/icons/Plug";
import FurnishIcon from "@/assets/icons/Furnish";
import TvIcon from "@/assets/icons/TvIcon";
import SecurityIcon from "@/assets/icons/SecurityIcon";
import CleaningIcon from "@/assets/icons/Cleaning";
import BrowseAptIcon from "@/assets/icons/BrowseApt";
import ChooseStayIcon from "@/assets/icons/ChooseStay";
import InstantConfirmIcon from "@/assets/icons/InstantConfirm";
import CheckinEnjoyIcon from "@/assets/icons/CheckinEnjoy";
import VerifiedSafetyIcon from "@/assets/icons/VerifiedSafety";
import SecurePayIcon from "@/assets/icons/SecurePay";
import SafetySupportIcon from "@/assets/icons/SaftySupport";
import EmergencyAssIcon from "@/assets/icons/EmergencyAss";
import FacebookIcon from "@/assets/icons/FacebookIcon";
import InstagramIcon from "@/assets/icons/InstagramIcon";
import XIcon from "@/assets/icons/XIcon";
import TikTokIcon from "@/assets/icons/TikTok";
import CaretRight from "@/assets/icons/CaretRight";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700"],
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600"],
});

const inriaSerif = Inria_Serif({
  subsets: ["latin"],
  weight: ["400"],
});

export default function Home() {
  const locationsRef = useRef<HTMLDivElement | null>(null);
  const reviewsRef = useRef<HTMLDivElement | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const listings = [
    { id: "modern-loft-lagos", title: "Modern Loft", location: "Lagos", image: Listing1 },
    {
      id: "luxury-suite-lagos",
      title: "Luxury Suite",
      location: "Lagos",
      image: Listing2,
    },
    {
      id: "skyline-penthouse-lagos-1",
      title: "Skyline Penthouse",
      location: "Lagos",
      image: Listing3,
    },
    {
      id: "skyline-penthouse-lagos-2",
      title: "Skyline Penthouse",
      location: "Lagos",
      image: Listing4,
    },
    {
      id: "city-view-haven-abuja",
      title: "City View Haven",
      location: "Abuja",
      image: Listing5,
    },
    {
      id: "skyline-penthouse-ikoyi",
      title: "Skyline Penthouse",
      location: "Ikoyi, Lagos",
      image: Listing6,
    },
  ];
  const amenities = [
    { label: "High-Speed Wi-Fi", Icon: WifiIcon },
    { label: "24/7 Power Supply", Icon: PlugIcon },
    { label: "Fully Equipped Kitchen", Icon: FurnishIcon },
    { label: "Smart TV", Icon: TvIcon },
    { label: "Security & CCTV", Icon: SecurityIcon },
    { label: "Housekeeping Service", Icon: CleaningIcon },
  ];
  const locations = [
    { id: "lagos-30-1", title: "Lagos", count: "30 Apartments", image: Location1 },
    { id: "abuja-25", title: "Abuja", count: "25 Apartments", image: Location2 },
    { id: "lagos-30-2", title: "Lagos", count: "30 Apartments", image: Location3 },
    { id: "ikoyi-18", title: "Ikoyi", count: "18 Apartments", image: Location1 },
    { id: "lekki-22", title: "Lekki", count: "22 Apartments", image: Location2 },
    {
      id: "victoria-island-15",
      title: "Victoria Island",
      count: "15 Apartments",
      image: Location3,
    },
    { id: "maitama-12", title: "Maitama", count: "12 Apartments", image: Location1 },
    { id: "gwarinpa-19", title: "Gwarinpa", count: "19 Apartments", image: Location2 },
  ];
  const reviews = [
    {
      id: "review-1",
      text: "The apartment was spotless, beautifully styled, and in a great location. Check-in was seamless, the host was super responsive, and the welcome guide made everything easy from the moment I arrived.",
      author: "Tola Olayinka, Lagos",
    },
    {
      id: "review-2",
      text: "Loved the calm neighborhood and the attention to detail. The space felt like a boutique hotel with a homey touch, and every room had thoughtful touches that made the stay feel premium.",
      author: "Ada Okeke, Abuja",
    },
    {
      id: "review-3",
      text: "Fast Wi-Fi, a very comfy bed, and an easy booking process. I extended my stay without any hassle, and support helped me adjust my dates within minutes.",
      author: "Kunle Adeyemi, Lekki",
    },
    {
      id: "review-4",
      text: "Great value for money and the place looked exactly like the photos. Support answered within minutes, and the host checked in to make sure everything was comfortable.",
      author: "Chioma Nwosu, Ikoyi",
    },
    {
      id: "review-5",
      text: "Quiet, clean, and secure. The host left clear instructions, check-in was smooth, and the apartment had everything I needed for a productive work trip.",
      author: "Bisi Alade, Victoria Island",
    },
    {
      id: "review-6",
      text: "Beautiful interiors and a fully equipped kitchen. Perfect for both work trips and weekend getaways, with plenty of space to relax after a long day.",
      author: "Samuel Eze, Maitama",
    },
  ];
  const reviewers = [Person11, Person12, Person13, Person14, Person15];
  const heroFeatures = [
    { Icon: SecureStayIcon, label: ["Secure", "Stay"] },
    { Icon: VerifiedHomeIcon, label: ["Verified", "Homes"] },
    { Icon: AllSupportIcon, label: ["24/7", "Support"] },
  ];
  const workSteps = [
    { Icon: BrowseAptIcon, label: "Browse Apartments" },
    { Icon: ChooseStayIcon, label: "Choose Your Stay" },
    { Icon: InstantConfirmIcon, label: "Instant Confirmation" },
    { Icon: CheckinEnjoyIcon, label: "Check-in & Enjoy" },
  ];
  const safetySteps = [
    { label: "Verified Properties", Icon: VerifiedSafetyIcon },
    { label: "Secure Payments", Icon: SecurePayIcon },
    { label: "24/7 Support", Icon: SafetySupportIcon },
    { label: "Emergency Assistance", Icon: EmergencyAssIcon },
  ];
  const faqs = [
    {
      question: "What are the check-in and check-out time?",
      answer: "Check-in is from 2:00 PM and check-out is by 11:00 AM.",
    },
    {
      question: "Is there a minimum stay requirement?",
      answer: "Most homes require a minimum of 2 nights, but it varies by listing.",
    },
    {
      question: "What are your cancellation policy?",
      answer:
        "We offer flexible, moderate, and strict cancellation options depending on the listing.",
    },
    {
      question: "Are pets allowed in the apartment?",
      answer:
        "Pet policies vary by property. Look for the pet-friendly badge on each listing.",
    },
  ];
  const splitAmenityLabel = (label: string) => {
    const words = label.split(" ");
    if (words.length <= 2) {
      return [words[0], words.slice(1).join(" ")].filter(Boolean);
    }
    return [words.slice(0, 2).join(" "), words.slice(2).join(" ")];
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f2ea] text-slate-900">
      <header className="sticky top-0 z-30 w-full bg-[#f7f2ea]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Image src={Logo} alt="Aparte" className="h-10 w-auto" />
          </div>
          <nav className="hidden items-center gap-8 text-sm text-slate-600 md:flex">
            <a href="#home" className="text-slate-900">
              Home
            </a>
            <a href="#about">About</a>
            <a href="#explore">Explore</a>
            <a href="#faq">FAQ</a>
          </nav>
          <Link
            href="/host/login"
            className="rounded-full bg-[#1d3b31] px-5 py-2 text-sm font-semibold text-white shadow-sm"
          >
            Become a host
          </Link>
        </div>
      </header>

      <main className="flex flex-col">
        <section id="home" className="relative overflow-hidden">
          <div className="relative h-[520px] w-full md:h-[520px]">
            <Image
              src={HeroImage}
              alt="Apartment interior"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/55" />
          </div>
          <div className="absolute inset-0 flex items-center">
            <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-4 text-center text-white">
              <h1
                className={`${playfair.className} max-w-3xl text-[40px] leading-[1] tracking-[-0.02em] sm:text-[52px] md:text-[64px]`}
              >
                Find Thoughtfully Curated Shortstay Apartment
                {/* <br /> */}
              </h1>
              <p
                className={`${poppins.className} mt-4 max-w-2xl text-[18px] leading-[1.2] text-white/85 md:text-[24px]`}
              >
                Unique homes, flexible options, and trusted hosts—worldwide.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-white/80">
                  {heroFeatures.map(({ Icon, label }) => (
                    <div
                      key={label.join("-")}
                      className="flex flex-col items-center gap-2"
                    >
                      <Icon />
                      <div
                        className={`${poppins.className} text-center text-[11px] font-normal uppercase tracking-[0.08em] text-white`}
                      >
                        <span className="block">{label[0]}</span>
                        <span className="block">{label[1]}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-slate-900"
                >
                  Download App
                </button>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="bg-[#FAF8F4] py-16">
          <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 md:grid-cols-[1.1fr_1fr]">
            <div className="relative">
              <div className="overflow-hidden ">
                <Image
                  src={AboutImage}
                  alt="About us"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute right-6 top-6 flex items-center gap-3 rounded-2xl bg-[#1d3b31] px-4 py-3 text-xs text-white shadow-lg">
                <div className="flex -space-x-2">
                  {reviewers.map((reviewer, index) => (
                    <div
                      key={`reviewer-${index}`}
                      className="relative h-7 w-7 overflow-hidden rounded-full border border-white/40"
                    >
                      <Image
                        src={reviewer}
                        alt={`Reviewer ${index + 1}`}
                        fill
                        sizes="28px"
                        className="object-cover"
                      />
                    </div>
                  ))}
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/40 bg-white text-[10px] font-semibold text-slate-900">
                    +2
                  </span>
                </div>
                <span>Check reviews</span>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h2
                  className={`${poppins.className} text-[32px] font-bold text-[#434A48]`}
                >
                  About Us
                </h2>
                <p className="mt-3 text-sm text-slate-500">
                  Aparte connects guests with trusted short-stay apartments that feel like
                  home. From fully furnished spaces to flexible booking options, we make
                  it easy to find comfort, safety, and convenience wherever you travel.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    label: "Fully Furnished Apartments",
                    icon: (
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <rect
                          x="2"
                          y="7"
                          width="14"
                          height="6"
                          rx="2"
                          stroke="currentColor"
                        />
                        <path
                          d="M4 13v2M14 13v2M6 7V5h6v2"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                        />
                      </svg>
                    ),
                  },
                  {
                    label: "Short stay / Long stay",
                    icon: (
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path
                          d="M3 8.5L9 3l6 5.5v6.5a1 1 0 0 1-1 1h-3.5v-4h-3v4H4a1 1 0 0 1-1-1V8.5Z"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ),
                  },
                  {
                    label: "Prime Locations",
                    icon: (
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path
                          d="M9 16s5-4.5 5-8a5 5 0 1 0-10 0c0 3.5 5 8 5 8Z"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <circle
                          cx="9"
                          cy="8"
                          r="2"
                          stroke="currentColor"
                          strokeWidth="1.2"
                        />
                      </svg>
                    ),
                  },
                  {
                    label: "Hotel Level Comfort",
                    icon: (
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path
                          d="M3 10h12M4 6h6a3 3 0 0 1 3 3v4H4v-7Z"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ),
                  },
                  {
                    label: "Smart Security",
                    icon: (
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path
                          d="M9 2l5 2v4c0 3.4-2.2 6-5 7-2.8-1-5-3.6-5-7V4l5-2Z"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinejoin="round"
                        />
                        <path
                          d="m6.5 8.8 1.8 1.8 3.6-3.6"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ),
                  },
                  {
                    label: "24/7 Support",
                    icon: (
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path
                          d="M5 9a4 4 0 0 1 8 0v2.5a2 2 0 0 1-2 2h-1.5"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M4 9h1v3H4a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1Zm10 0h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1h-1V9Z"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                        />
                      </svg>
                    ),
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-4 text-center text-xs text-slate-600 shadow-sm"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200">
                      {item.icon}
                    </span>
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="explore" className="bg-[#F2EDE3] py-14">
          <div className="mx-auto w-full max-w-6xl px-6">
            <div
              className={`${poppins.className} flex items-center gap-3 text-center text-[32px] font-semibold text-[#434A48]`}
            >
              <span className="h-px flex-1 bg-[#2A3130]" />
              Explore Our Apartments
              <span className="h-px flex-1 bg-[#2A3130]" />
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className="overflow-hidden rounded-2xl bg-[#FDFAF4] shadow-md"
                >
                  <Image
                    src={listing.image}
                    alt={listing.title}
                    className="h-44 w-full object-cover"
                  />
                  <div className="p-4 text-center">
                    <h3 className="text-sm font-semibold text-slate-800">
                      {listing.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-400">{listing.location}</p>
                    <button
                      type="button"
                      className="mt-3 text-xs font-semibold text-slate-700 underline"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="bg-[#FAF8F4] py-14">
          <div className="mx-auto w-full max-w-6xl px-6">
            <div className="text-center">
              <h2
                className={`${poppins.className} text-[32px] font-semibold text-[#434A48]`}
              >
                Our Amenities
              </h2>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-6 text-center text-xs text-slate-600 md:grid-cols-6">
              {amenities.map(({ label, Icon }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-2 border-r border-[#818181]/60 px-2 even:border-r-0 last:border-r-0 md:border-r md:even:border-r md:last:border-r-0"
                >
                  <span className="flex items-center justify-center">
                    <Icon />
                  </span>
                  <div className="text-center">
                    {splitAmenityLabel(label).map((line, index) => (
                      <span key={`${label}-line-${index}`} className="block">
                        {line}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#FAF8F4] py-14">
          <div className="mx-auto w-full max-w-6xl px-6">
            <div
              className={`${poppins.className} flex items-center gap-3 text-center text-[32px] font-semibold text-[#434A48]`}
            >
              <span className="h-px flex-1 bg-[#2A3130]" />
              Locations We Cover
              <span className="h-px flex-1 bg-[#2A3130]" />
            </div>
            <div className="relative mt-8">
              <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[#FAF8F4] to-transparent md:w-16" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#FAF8F4] to-transparent md:w-16" />
              <button
                type="button"
                aria-label="Scroll locations left"
                onClick={() =>
                  locationsRef.current?.scrollBy({ left: -320, behavior: "smooth" })
                }
                className="absolute left-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md backdrop-blur md:flex"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M10.5 3.5L6 8l4.5 4.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                type="button"
                aria-label="Scroll locations right"
                onClick={() =>
                  locationsRef.current?.scrollBy({ left: 320, behavior: "smooth" })
                }
                className="absolute right-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md backdrop-blur md:flex"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M5.5 3.5L10 8l-4.5 4.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <div
                ref={locationsRef}
                className="no-scrollbar flex gap-6 overflow-x-auto pb-2 pt-1"
              >
                {locations.map((location) => (
                  <div
                    key={location.id}
                    className="min-w-[240px] overflow-hidden rounded-2xl bg-white shadow-md md:min-w-[280px]"
                  >
                    <Image
                      src={location.image}
                      alt={location.title}
                      className="h-40 w-full object-cover"
                    />
                    <div className="rounded-t-2xl bg-[#FDFAF4] p-4 text-center">
                      <h3 className="text-sm font-semibold text-slate-800">
                        {location.title}
                      </h3>
                      <p className="mt-1 text-xs text-slate-400">{location.count}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#FAF8F4] py-14">
          <div className="mx-auto w-full max-w-6xl px-6">
            <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
              <div className="rounded-2xl     ">
                <div className="bg-[#EAE4DE] p-6">
                  <div
                    className={`${poppins.className} flex items-center gap-3 text-center text-[28px] font-semibold text-[#434A48]`}
                  >
                    <span className="h-px flex-1 bg-[#2A3130]" />
                    How We Work
                    <span className="h-px flex-1 bg-[#2A3130]" />
                  </div>
                  <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600">
                    {workSteps.map((step, index) => (
                      <div key={step.label} className="flex items-center gap-4">
                        <div className="flex flex-col items-center gap-3 text-center">
                          <span className="flex   items-center justify-center  ">
                            <step.Icon />
                          </span>
                          <span className="max-w-[120px] text-center">
                            {splitAmenityLabel(step.label).map((line, lineIndex) => (
                              <span key={`${step.label}-${lineIndex}`} className="block">
                                {line}
                              </span>
                            ))}
                          </span>
                        </div>
                        {index < workSteps.length - 1 && <CaretRight />}
                      </div>
                    ))}
                  </div>
                </div>
                <div className=" bg-[#f2ede5]  px-6">
                  <div className="  py-6">
                    <div
                      className={`${poppins.className} flex items-center gap-3 text-center text-[24px] font-semibold text-[#434A48]`}
                    >
                      <span className="h-px flex-1 bg-[#2A3130]" />
                      Your Safety, Our Priority
                      <span className="h-px flex-1 bg-[#2A3130]" />
                    </div>
                    <div className="mt-6 flex flex-wrap   justify-center gap-8 text-xs text-slate-600  ">
                      {safetySteps.map((item, index) => (
                        <div key={item.label} className="flex items-center gap-4">
                          <div className="flex flex-col items-center gap-3 text-center">
                            <span className="flex   items-center justify-center">
                              <item.Icon />
                            </span>
                            <span className="max-w-[120px] text-center">
                              {splitAmenityLabel(item.label).map((line, lineIndex) => (
                                <span
                                  key={`${item.label}-${lineIndex}`}
                                  className="block"
                                >
                                  {line}
                                </span>
                              ))}
                            </span>
                          </div>

                          {index < safetySteps.length - 1 && <CaretRight />}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-[#EAE4DE] p-6">
                <div
                  className={`${poppins.className} flex items-center gap-3 text-center text-[28px] font-semibold text-[#434A48]`}
                >
                  <span className="h-px flex-1 bg-[#2A3130]" />
                  Frequently Asked Question
                  <span className="h-px flex-1 bg-[#2A3130]" />
                </div>
                <div className="mt-6 space-y-3">
                  {faqs.map((faq, index) => {
                    const isOpen = openFaqIndex === index;
                    return (
                      <div
                        key={faq.question}
                        className="rounded-2xl border border-[#e6ddd1] bg-[#f7f2ea] px-5 py-4 text-xs text-slate-500 shadow-sm"
                      >
                        <button
                          type="button"
                          onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                          className="flex w-full items-center justify-between text-left"
                          aria-expanded={isOpen}
                        >
                          <span>{faq.question}</span>
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 14 14"
                            fill="none"
                            className={
                              isOpen
                                ? "rotate-180 transition-transform"
                                : "transition-transform"
                            }
                          >
                            <path
                              d="M3 5l4 4 4-4"
                              stroke="currentColor"
                              strokeWidth="1.4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                        {isOpen && (
                          <p className="mt-3 text-xs text-slate-500">{faq.answer}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#FAF8F4] py-14">
          <div className="mx-auto w-full max-w-6xl px-6">
            <h3
              className={`${poppins.className} text-center text-[32px] font-semibold text-[#434A48]`}
            >
              Guests Reviews
            </h3>
            <div className="relative mt-8">
              <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[#FAF8F4] to-transparent md:w-16" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#FAF8F4] to-transparent md:w-16" />
              <button
                type="button"
                aria-label="Scroll reviews left"
                onClick={() =>
                  reviewsRef.current?.scrollBy({ left: -320, behavior: "smooth" })
                }
                className="absolute left-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md backdrop-blur md:flex"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M10.5 3.5L6 8l4.5 4.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                type="button"
                aria-label="Scroll reviews right"
                onClick={() =>
                  reviewsRef.current?.scrollBy({ left: 320, behavior: "smooth" })
                }
                className="absolute right-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md backdrop-blur md:flex"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M5.5 3.5L10 8l-4.5 4.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <div
                ref={reviewsRef}
                className="no-scrollbar flex gap-6 overflow-x-auto pb-2 pt-1"
              >
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="min-w-[260px] rounded-2xl bg-white p-6 px-6   text-xs text-slate-500 shadow-sm md:min-w-[320px]"
                  >
                    <p className="text-center">{review.text}</p>
                    <p className="mt-4 font-semibold text-slate-700 text-center">
                      {review.author}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#46340D] py-16 text-center text-white rounded-2xl">
          <div className="mx-auto w-full max-w-4xl px-6">
            <h3 className={`${poppins.className} text-[48px] font-bold text-[#F1D3BE]`}>
              Ready for an Aparte Stay?
            </h3>
            <p className="mt-3 text-sm text-white/80">
              Book a thoughtfully curated apartment and enjoy comfort, convenience, and
              peace of mind.
            </p>
            <button
              type="button"
              className="mt-6 rounded-full bg-white px-6 py-2 text-xs font-semibold text-slate-900"
            >
              Download App
            </button>
          </div>
        </section>
      </main>

      <footer className="bg-[#f7f2ea] py-12s">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 md:grid-cols-[1.2fr_1fr_1fr_1.2fr] py-8 border-b border-b-[#B5B5B5]">
          <div>
            <Image src={Logo} alt="Aparte" className="h-14 w-auto" />
            <div className="mt-4 flex items-center gap-3">
              {[
                { Icon: FacebookIcon, label: "Facebook" },
                { Icon: TikTokIcon, label: "TikTok" },
                { Icon: InstagramIcon, label: "Instagram" },
                { Icon: XIcon, label: "X" },
              ].map(({ Icon, label }) => (
                <div
                  key={label}
                  className="flex   items-center justify-center    text-slate-600"
                  aria-label={label}
                >
                  <Icon />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3 text-xs text-slate-500">
            <p className="text-sm font-semibold text-slate-700">Company</p>
            <p>About us</p>
            <p>Services</p>
            <p>Blog</p>
            <p>Promos</p>
          </div>
          <div className="space-y-3 text-xs text-slate-500">
            <p className="text-sm font-semibold text-slate-700">Support</p>
            <p>Contact us</p>
            <p>FAQs</p>
            <p>Help Center</p>
            <p>Live chat</p>
          </div>
          <div className="space-y-3 text-xs text-slate-500">
            <p className="text-sm font-semibold text-slate-700">Contact</p>
            <p>Address of company</p>
            <p>Phone numbers</p>
            <p>Email address</p>
          </div>
        </div>
        <p
          className={`${inriaSerif.className} mt-1 py-4 text-center text-[16px] text-[#343434]`}
        >
          Aparte@2026. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
