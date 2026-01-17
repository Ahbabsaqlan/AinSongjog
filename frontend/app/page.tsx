"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import { Gavel, Users, Shield, Clock, ArrowRight, CheckCircle, Menu, X, MapPin, Briefcase } from "lucide-react";

interface Lawyer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  lawyerProfile?: {
    chamberAddress: string;
    hourlyRate: number;
    bio: string;
    barCouncilId: string;
  };
}

export default function Home() {
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  useEffect(() => {
    const fetchLawyers = async () => {
      try {
        const res = await api.get("/users/lawyers/search");
        // Show only first 6 for the landing page
        setLawyers(res.data.slice(0, 6));
      } catch (error) {
        console.error("Failed to fetch lawyers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLawyers();
  }, []);

  const faqs = [
    {
      question: "How do I find a lawyer?",
      answer: "Use our search feature to browse verified lawyers by location, specialization, or name. Each lawyer profile includes their credentials, rates, and contact information.",
    },
    {
      question: "Is the service free for clients?",
      answer: "Creating an account and searching for lawyers is completely free. You only pay for consultations and legal services directly with your chosen lawyer.",
    },
    {
      question: "How are lawyers verified?",
      answer: "All lawyers must provide valid Bar Council registration details which are verified by our admin team before approval. Only verified, active lawyers are listed on the platform.",
    },
    {
      question: "Can I book appointments online?",
      answer: "Yes! Once you create an account, you can browse lawyers and book consultation appointments directly through the platform. Lawyers will confirm or modify the appointment time.",
    },
    {
      question: "What types of legal cases are supported?",
      answer: "Our platform supports lawyers handling various types of cases including civil, criminal, corporate, property, family law, and more. Check individual lawyer profiles for their specializations.",
    },
    {
      question: "How do I become a lawyer on the platform?",
      answer: "Lawyers can sign up with their Bar Council ID and professional details. After admin verification, your profile will be activated and visible to clients.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold">
                <span className="text-blue-600">Ain</span>
                <span className="text-slate-900">Shongjog</span>
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#about" className="text-gray-600 hover:text-blue-600 transition">
                About
              </a>
              <a href="#lawyers" className="text-gray-600 hover:text-blue-600 transition">
                Lawyers
              </a>
              <a href="#faq" className="text-gray-600 hover:text-blue-600 transition">
                FAQ
              </a>
              <Link
                href="/login"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Sign Up
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-4 space-y-3">
              <a
                href="#about"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-gray-600 hover:text-blue-600"
              >
                About
              </a>
              <a
                href="#lawyers"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-gray-600 hover:text-blue-600"
              >
                Lawyers
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-gray-600 hover:text-blue-600"
              >
                FAQ
              </a>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-gray-700 hover:text-blue-600"
              >
                Login
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-center font-medium"
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-slate-900 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              AinShongjog
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-300 max-w-3xl mx-auto">
              The Digital Legal Ecosystem for Bangladesh
            </p>
            <p className="text-lg mb-12 text-gray-400 max-w-2xl mx-auto">
              Connect with verified legal professionals, manage your cases, and access justice seamlessly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="px-8 py-3 bg-blue-600 rounded-lg hover:bg-blue-500 transition font-semibold text-lg"
              >
                Get Started
              </Link>
              <Link
                href="/login"
                className="px-8 py-3 bg-transparent border-2 border-white rounded-lg hover:bg-white hover:text-blue-900 transition font-semibold text-lg"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose AinShongjog?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Modern legal services designed for the digital age
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Shield size={24} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Verified Lawyers</h3>
              <p className="text-gray-600">
                All lawyers are verified with Bar Council credentials. Trust and security are our top priorities.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Clock size={24} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Easy Scheduling</h3>
              <p className="text-gray-600">
                Book appointments online with verified lawyers. Manage your consultations from anywhere.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Gavel size={24} className="text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Case Management</h3>
              <p className="text-gray-600">
                Track your legal cases, manage documents, and stay updated on case status in one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                About AinShongjog
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                AinShongjog is a comprehensive digital platform designed to bridge the gap between clients and legal professionals in Bangladesh. We provide a secure, transparent, and efficient ecosystem for legal services.
              </p>
              <p className="text-lg text-gray-600 mb-4">
                Our platform enables clients to find verified lawyers, book consultations, and manage their legal cases seamlessly. For lawyers, we offer tools to manage cases, appointments, and client relationships effectively.
              </p>
              <p className="text-lg text-gray-600">
                Built with modern technology, AinShongjog ensures that legal services are accessible, transparent, and efficient for everyone in Bangladesh.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-slate-100 p-8 rounded-2xl">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">100+</div>
                  <div className="text-gray-600">Verified Lawyers</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
                  <div className="text-gray-600">Platform Access</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">Secure</div>
                  <div className="text-gray-600">Data Protection</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">Digital</div>
                  <div className="text-gray-600">Case Management</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lawyers Section */}
      <section id="lawyers" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Verified Lawyers
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Connect with experienced legal professionals across Bangladesh
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading lawyers...</p>
            </div>
          ) : lawyers.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
              <Users size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No lawyers available at the moment.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {lawyers.map((lawyer) => (
                <div
                  key={lawyer.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {lawyer.firstName} {lawyer.lastName}
                      </h3>
                      {lawyer.lawyerProfile?.barCouncilId && (
                        <p className="text-sm text-blue-600 mt-1">
                          Bar ID: {lawyer.lawyerProfile.barCouncilId}
                        </p>
                      )}
                    </div>
                  </div>

                  {lawyer.lawyerProfile?.chamberAddress && (
                    <div className="flex items-start gap-2 text-sm text-gray-600 mb-3">
                      <MapPin size={16} className="mt-0.5 text-gray-400 flex-shrink-0" />
                      <span className="line-clamp-2">{lawyer.lawyerProfile.chamberAddress}</span>
                    </div>
                  )}

                  {lawyer.lawyerProfile?.hourlyRate && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <Briefcase size={16} className="text-gray-400" />
                      <span>{lawyer.lawyerProfile.hourlyRate} BDT/hr</span>
                    </div>
                  )}

                  {lawyer.lawyerProfile?.bio && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                      {lawyer.lawyerProfile.bio}
                    </p>
                  )}

                  <Link
                    href="/signup"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-1"
                  >
                    View Profile <ArrowRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          )}

          <div className="text-center">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              View All Lawyers <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Find answers to common questions about our platform
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setFaqOpen(faqOpen === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition"
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  <span className={`transform transition ${faqOpen === index ? "rotate-180" : ""}`}>
                    <ArrowRight size={20} className="text-gray-400" />
                  </span>
                </button>
                {faqOpen === index && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">
                <span className="text-blue-400">Ain</span>Shongjog
              </h3>
              <p className="text-gray-400">
                The Digital Legal Ecosystem for Bangladesh. Connecting clients with verified legal professionals.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#about" className="hover:text-white transition">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#lawyers" className="hover:text-white transition">
                    Lawyers
                  </Link>
                </li>
                <li>
                  <Link href="#faq" className="hover:text-white transition">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Account</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/signup" className="hover:text-white transition">
                    Sign Up
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition">
                    Login
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Email: info@ainshongjog.com</li>
                <li>Phone: +880-XXX-XXXX</li>
                <li>Dhaka, Bangladesh</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} AinShongjog. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}