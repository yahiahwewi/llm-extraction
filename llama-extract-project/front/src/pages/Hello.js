import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import azerPhoto from "../azer.jpg";
import sabaPhoto from "../saba.jpg";
import yahyaPhoto from "../yahya.png";
import ferdaousPhoto from "../ferdaous.png";
import oumaimaPhoto from "../oumayma.jpg";
import rihemPhoto from "../rihem.jpg";
// import ferdaousPhoto from "../assets/ferdaous.jpg";
// import sabaPhoto from "../assets/saba.jpg";
// import oumaimaPhoto from "../assets/oumaima.jpg";
// import rihemPhoto from "../assets/rihem.jpg";

// ✅ Icons
const CheckIcon = ({ color = "text-green-400" }) => (
  <svg className={`w-5 h-5 ${color} mr-2 mt-0.5 flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 
         7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
      clipRule="evenodd"
    />
  </svg>
);

const ArrowIcon = () => (
  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
  </svg>
);

// ================= TEAM =================
const teamMembers = [
  { name: "Yahya Houaoui", photo: yahyaPhoto },
  { name: "Azer Ben Amor", photo: azerPhoto },
  { name: "Ferdaous Hamed", photo: ferdaousPhoto },
  { name: "Saba Homri", photo: sabaPhoto },
  { name: "Oumaima Elhaj", photo: oumaimaPhoto },
  { name: "Rihem Bousbih", photo: rihemPhoto },
];

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function Hello() {
  const [shuffledTeam, setShuffledTeam] = useState([]);

  useEffect(() => {
    setShuffledTeam(shuffleArray(teamMembers));
  }, []);

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-200 relative overflow-hidden">

      {/* 🌐 Animated Background Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(29,155,240,0.05)_0,transparent_70%)] animate-pulse-slow"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] opacity-10"></div>

      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 text-center">
          <div className="flex justify-center mb-6 animate-float">
            <div className="p-3 bg-green-500/10 rounded-full border border-green-500/30">
              <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5
                     a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 
                     5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            <span className="text-green-400">$</span> Welcome to{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-400 animate-gradient">
              Our Project
            </span>
            <span className="border-r-2 border-green-400 ml-1 animate-cursor"></span>
          </h1>

          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10">
            AI-powered document extraction that feels like magic ⚡. Built by developers for developers.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/extract"
              className="inline-flex items-center justify-center px-8 py-3 rounded-lg 
                         bg-green-500 text-black font-medium hover:bg-green-400
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500
                         transition-all duration-200 transform hover:scale-105"
            >
              Get Started <ArrowIcon />
            </Link>
            <Link
              to="/parse"
              className="inline-flex items-center justify-center px-8 py-3 rounded-lg border border-gray-700
                         bg-[#161b22] hover:bg-[#1f2731] text-gray-200
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* ================= ABOUT SECTION ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-[#161b22] rounded-2xl shadow-2xl overflow-hidden border border-gray-800 animate-fade-in">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 px-8 py-6">
            <h2 className="text-2xl font-bold text-black">About This Project</h2>
          </div>
          <div className="p-8">
            <div className="prose prose-invert prose-lg max-w-none text-gray-300 space-y-4">
              <p>
                A group project for the <span className="font-semibold text-green-400">AI course</span> by 
                <span className="font-semibold text-green-400"> Class 5 SAE7</span>, showcasing how AI can
                process and structure data from raw documents like a pro.
              </p>
              <p>
                We leverage modern AI technologies to automate and streamline workflows for developers and businesses.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#0d1117] rounded-lg p-6 border border-green-500/20">
                <h3 className="text-lg font-semibold text-green-400 mb-3">Academic Context</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start"><CheckIcon /> AI Course Project</li>
                  <li className="flex items-start"><CheckIcon /> Practical AI Applications</li>
                  <li className="flex items-start"><CheckIcon /> Cutting-edge Implementation</li>
                </ul>
              </div>
              <div className="bg-[#0d1117] rounded-lg p-6 border border-blue-500/20">
                <h3 className="text-lg font-semibold text-blue-400 mb-3">Project Scope</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start"><CheckIcon color="text-blue-400"/> Document Processing</li>
                  <li className="flex items-start"><CheckIcon color="text-blue-400"/> AI Data Extraction</li>
                  <li className="flex items-start"><CheckIcon color="text-blue-400"/> Structured Data Management</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURES SECTION ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">⚡ Core Features</h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            GitHub inspired design. Developer friendly. Future ready.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "Easy Upload", desc: "Drag & drop or browse your files." },
            { title: "Smart Extraction", desc: "AI parses key information with precision." },
            { title: "Data Management", desc: "Organize and query your structured output." }
          ].map((feature, idx) => (
            <div
              key={idx}
              className="bg-[#161b22] p-6 rounded-xl border border-gray-800 hover:border-green-400/40
                         shadow-md hover:shadow-green-400/10 transition-all duration-300 hover:-translate-y-2"
            >
              <div className="w-12 h-12 bg-green-400/10 border border-green-400/30 rounded-lg flex items-center justify-center mb-4">
                {idx === 0 && <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>}
                {idx === 1 && <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M12 12h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}
                {idx === 2 && <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V2" /></svg>}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= TEAM SECTION ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">👥 Meet Our Team</h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            The talented minds behind this project.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {shuffledTeam.map((member, idx) => (
            <div key={idx} className="bg-[#161b22] rounded-xl p-6 text-center border border-gray-800 hover:border-green-400/40 transition-all">
              <img src={member.photo} alt={member.name} className="w-24 h-24 mx-auto rounded-full mb-4 border-2 border-green-400/30" />
              <h3 className="text-xl font-semibold text-white">{member.name}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* ================= CTA SECTION ================= */}
      <section className="bg-gradient-to-r from-green-500 to-blue-500 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-black mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-black/80 mb-8">
            Start extracting like a pro — Fast, AI-powered, and developer friendly.
          </p>
          <Link
            to="/extract"
            className="inline-flex items-center justify-center px-8 py-3 rounded-lg shadow-sm 
                       text-white bg-[#0d1117] hover:bg-[#161b22]
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black
                       transition-all duration-200 transform hover:scale-105"
          >
            Start Extracting Now <ArrowIcon />
          </Link>
        </div>
      </section>

    </div>
  );
}
