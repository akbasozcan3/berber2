"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ScrollVideo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current || !quoteRef.current || !frameRef.current || !statsRef.current) return;

      // Smooth scroll parallax for the floating cinematic frame
      gsap.to(frameRef.current, {
        y: "-80px",
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });

      // Subtle opposite translation for the quote to create spatial depth
      gsap.to(quoteRef.current, {
        y: "40px",
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.2,
        },
      });

      // Animate line reveal inside the quote
      gsap.fromTo(
        quoteRef.current.querySelectorAll(".mask-line span"),
        { y: "100%", opacity: 0 },
        {
          y: "0%",
          opacity: 1,
          duration: 1.5,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top center+=200",
            toggleActions: "play none none reverse",
          },
        }
      );
    },
    { scope: containerRef }
  );

  return (
    <section 
      ref={containerRef} 
      className="relative min-h-screen bg-[#020202] py-32 flex items-center justify-center overflow-hidden border-b border-white/5"
    >
      {/* Background Decorative Tech Watermark */}
      <div className="absolute top-10 left-10 text-[10px] tracking-[0.4em] text-gray-800 font-mono uppercase select-none pointer-events-none hidden md:block">
        LXB // SPEC-088 // STUDIO.01
      </div>
      <div className="absolute bottom-10 right-10 text-[10px] tracking-[0.4em] text-gray-800 font-mono uppercase select-none pointer-events-none hidden md:block">
        COORDINATES // 41.0082° N, 28.9784° E
      </div>

      <div className="container mx-auto px-6 md:px-12 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          
          {/* Left: Asymmetric Quote Layout */}
          <div className="lg:col-span-7 space-y-12" ref={quoteRef}>
            {/* Top gold line */}
            <div className="w-16 h-[1px] bg-gradient-to-r from-gray-500 to-transparent" />
            
            <div className="space-y-6">
              {/* Masked quote lines */}
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif font-light text-white tracking-tight leading-[1.1]">
                <span className="block mask-line overflow-hidden">
                  <span className="inline-block transition-transform duration-1000">
                    Sadece bir saç
                  </span>
                </span>
                <span className="block mask-line overflow-hidden">
                  <span className="inline-block transition-transform duration-1000">
                    kesimi değil,
                  </span>
                </span>
                <span className="block mask-line overflow-hidden">
                  <span className="inline-block italic text-gray-400 font-light transition-transform duration-1000">
                    bir sanat eseri.
                  </span>
                </span>
              </h2>
            </div>

            <div className="flex items-center gap-6 text-xs tracking-[0.35em] text-gray-500 uppercase font-medium">
              <span>M Studio Felsefesi</span>
              <span className="w-2 h-2 rounded-full bg-white/20" />
              <span>Çekmeköy</span>
            </div>
          </div>

          {/* Right: Floating Cinematic Video Frame */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end" ref={frameRef}>
            <div className="relative w-full max-w-[420px] aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 p-2 bg-[#080808]/50 backdrop-blur-md shadow-2xl group">
              {/* Inner video view */}
              <div className="relative w-full h-full rounded-xl overflow-hidden bg-black">
                <div className="absolute inset-0 bg-black/35 z-10" />
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover grayscale transition-all duration-[2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:grayscale-0 group-hover:scale-105"
                  src="https://videos.pexels.com/video-files/3998188/3998188-uhd_2560_1440_30fps.mp4"
                />
              </div>

              {/* Decorative Tech Overlay on Frame */}
              <div className="absolute bottom-6 left-6 z-20 font-mono text-[9px] tracking-[0.2em] text-white/50 uppercase">
                CAM_REF_01 // LIVE_VIEW
              </div>
              <div className="absolute top-6 right-6 z-20 font-mono text-[9px] tracking-[0.2em] text-white/50 uppercase">
                REC ●
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
