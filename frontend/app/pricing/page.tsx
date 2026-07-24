"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { siteConfig } from '@/config/siteConfig';
import { FadeIn } from '@/components/animations/FadeIn';
import { createClient } from "@supabase/supabase-js";
import { useRouter } from 'next/navigation';

export default function PricingPage() {
  const [currentPlan, setCurrentPlan] = useState<'free' | 'premium' | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);

        // Check current plan
        const { data, error } = await supabase
          .from('users')
          .select('plan')
          .eq('id', user.id)
          .single();

        if (data) {
          setCurrentPlan(data.plan as 'free' | 'premium');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [supabase]);

  const handleUpgrade = async () => {
    if (!userId) {
      router.push('/login');
      return;
    }

    // Create payment record
    const response = await fetch('/api/payments/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId
      },
      body: JSON.stringify({ plan_id: 'premium' })
    });

    const result = await response.json();

    if (result.success && result.whatsapp_link) {
      // Redirect to WhatsApp with pre-filled message
      window.location.href = result.whatsapp_link;
    } else {
      alert('Error creating payment. Please try again.');
    }
  };

  const getWhatsAppLink = () => {
    const message = encodeURIComponent(siteConfig.whatsapp.paymentMessage);
    return `https://wa.me/${siteConfig.whatsapp.paymentNumber}?text=${message}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <FadeIn delay={0.2}>
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Simple, transparent pricing
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Choose the plan that fits your needs. No hidden fees, no surprises.
              </p>
            </div>
          </FadeIn>

          {/* Pricing Cards */}
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <FadeIn delay={0.4}>
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className={`bg-white rounded-2xl shadow-xl overflow-hidden border ${currentPlan === 'free' ? 'border-blue-500 border-2' : 'border-gray-200'}`}
              >
                <div className="p-8">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Free</h3>
                      <p className="text-gray-600 mt-2">Perfect for getting started</p>
                    </div>
                    {currentPlan === 'free' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        Current Plan
                      </span>
                    )}
                  </div>

                  <div className="mt-6">
                    <span className="text-5xl font-bold text-gray-900">0€</span>
                    <span className="text-gray-600">/month</span>
                  </div>

                  <ul className="mt-8 space-y-4">
                    {siteConfig.pricing.free.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="h-6 w-6 text-blue-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {currentPlan === 'free' ? (
                    <button
                      disabled
                      className="mt-8 w-full bg-gray-100 text-gray-500 py-3 px-6 rounded-lg font-medium cursor-not-allowed"
                    >
                      Your Current Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => router.push('/register')}
                      className="mt-8 w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
                    >
                      Get Started
                    </button>
                  )}
                </div>
              </motion.div>
            </FadeIn>

            {/* Premium Plan */}
            <FadeIn delay={0.6}>
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className={`bg-white rounded-2xl shadow-xl overflow-hidden border ${currentPlan === 'premium' ? 'border-blue-500 border-2' : 'border-gray-200'}`}
              >
                <div className="p-8">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Premium</h3>
                      <p className="text-gray-600 mt-2">For professionals and teams</p>
                    </div>
                    {currentPlan === 'premium' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        Current Plan
                      </span>
                    )}
                  </div>

                  <div className="mt-6">
                    <span className="text-5xl font-bold text-gray-900">19€</span>
                    <span className="text-gray-600">/month</span>
                  </div>

                  <ul className="mt-8 space-y-4">
                    {siteConfig.pricing.premium.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="h-6 w-6 text-blue-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {currentPlan === 'premium' ? (
                    <button
                      disabled
                      className="mt-8 w-full bg-gray-100 text-gray-500 py-3 px-6 rounded-lg font-medium cursor-not-allowed"
                    >
                      Your Current Plan
                    </button>
                  ) : (
                    <button
                      onClick={handleUpgrade}
                      className="mt-8 w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
                    >
                      Upgrade to Premium
                    </button>
                  )}
                </div>
              </motion.div>
            </FadeIn>
          </div>

          {/* WhatsApp Payment Info */}
          <FadeIn delay={0.8}>
            <div className="mt-12 text-center">
              <p className="text-gray-600 mb-4">
                Payment is processed via WhatsApp for your convenience.
              </p>
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.429 3.648c.25-.108.528-.162.807-.162.446 0 .891.153 1.237.46l.24.143c.446.25.8.657 1.053 1.164.25.507.375 1.082.375 1.717s-.125 1.21-.375 1.717c-.253.507-.608.914-1.053 1.164l-.24.143c-.346.307-.791.46-1.237.46-.279 0-.557-.054-.807-.162l-3.143-1.37c-.25-.108-.479-.265-.688-.463-.208-.198-.388-.436-.538-.713-.15-.277-.225-.583-.225-.918s.075-.641.225-.918c.15-.277.329-.515.538-.713.209-.198.438-.355.688-.463l3.143-1.37zM12 2.133C8.633 2.133 5.867 4.61 5.867 8.133c0 1.737.667 3.333 1.8 4.533L3.533 18.1c-.133.267-.2 5.4-.2 5.4h14.934s-.067-5.133-.2-5.4L14.333 12.666c1.134-1.2 1.8-2.797 1.8-4.533 0-3.523-2.767-5.999-6.133-5.999z"/>
                </svg>
                Contact us on WhatsApp
              </a>
            </div>
          </FadeIn>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 right-0 h-32">
          <svg viewBox="0 0 1200 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path d="M0 120L60 110C120 100 240 80 360 80C480 80 600 100 720 110C840 120 960 120 1080 110C1200 100 1320 80 1380 70L1440 60V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#F8FAFC"/>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn delay={0.2}>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Winform?</h2>
              <p className="text-xl text-gray-600">Powerful features designed to help you succeed</p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: "AI-Powered Scoring",
                description: "Automatically evaluate responses with our advanced AI models"
              },
              {
                icon: (
                  <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: "Real-time Notifications",
                description: "Get instant alerts when important events occur"
              },
              {
                icon: (
                  <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                ),
                title: "Customizable Forms",
                description: "Create forms that match your brand and requirements"
              },
              {
                icon: (
                  <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                title: "Data Export",
                description: "Export your data in multiple formats for analysis"
              },
              {
                icon: (
                  <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: "Fast & Reliable",
                description: "Built on modern infrastructure for maximum performance"
              },
              {
                icon: (
                  <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ),
                title: "Secure & Private",
                description: "Your data is protected with enterprise-grade security"
              }
            ].map((feature, index) => (
              <FadeIn key={index} delay={0.2 + index * 0.1}>
                <div className="text-center p-6 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                  <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-50 mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn delay={0.2}>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Ready to get started?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of satisfied users who trust Winform for their form needs.
            </p>
            <button
              onClick={() => router.push(currentPlan ? '/dashboard' : '/register')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-medium transition-all duration-200 transform hover:scale-105"
            >
              {currentPlan ? 'Go to Dashboard' : 'Start Free Trial'}
            </button>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}