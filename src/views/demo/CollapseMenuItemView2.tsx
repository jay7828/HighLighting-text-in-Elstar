import React, { useState } from 'react';

interface OrganData {
  name: string;
  description: string;
  image: string;
  position: { top: string; left: string; width: string };
}

const organData: Record<string, OrganData> = {
  brain: {
    name: "Brain",
    description: "The control center of the body, responsible for thoughts, emotions, and bodily functions.",
    image: "/Brain.png",
    position: { top: "1%", left: "43.5%", width: "13%" }
  },
  heart: {
    name: "Heart",
    description: "Pumps blood throughout the body, supplying oxygen and nutrients to tissues.",
    image: "/Heart.png",
    position: { top: "22%", left: "48%", width: "15%" }
  },
  lungs: {
    name: "Lungs",
    description: "Responsible for breathing, taking in oxygen and expelling carbon dioxide.",
    image: "/Lungs.png",
    position: { top: "18%", left: "36%", width: "28%" }
  },
  largeIntestine: {
    name: "Large Intestine",
    description: "Absorbs water and compacts remaining waste for elimination.",
    image: "/Large Intestine.png",
    position: { top: "30%", left: "35%", width: "30%" }
  },
  smallIntestine: {
    name: "Small Intestine",
    description: "Absorbs water and compacts remaining waste for elimination.",
    image: "/Small Intestine.png",
    position: { top: "32%", left: "40%", width: "20%" }
  },
  stomach: {
    name: "Stomach",
    description: "Where most of the digestion and absorption of nutrients occurs.",
    image: "/stomach.png",
    position: { top: "28%", left: "43%", width: "20%" }
  }
};

const clickableRegions = [
  { id: "brain", organ: "brain", x: 140, y: 15 },
  { id: "heart", organ: "heart", x: 160, y: 150 },
  { id: "lungs", organ: "lungs", x: 135, y: 120 },
  { id: "largeIntestine", organ: "largeIntestine", x: 140, y: 260 },
  { id: "smallIntestine", organ: "smallIntestine", x: 140, y: 230 },
  { id: "stomach", organ: "stomach", x: 165, y: 190 },
];

const OrganApp: React.FC = () => {
  const [selectedOrgan, setSelectedOrgan] = useState<string | null>(null);
  const [hoveredOrgan, setHoveredOrgan] = useState<string | null>(null);

  const handleRegionClick = (organ: string) => {
    setSelectedOrgan(organ === selectedOrgan ? null : organ);
  };

  const handleRegionHover = (organ: string | null) => {
    setHoveredOrgan(organ);
  };

  return (
    <div className="flex items-center justify-around">
      {/* Left Side: Human Body Model */}
      <div className='w-1/2 flex items-center justify-center'>
        <div className="relative w-[300px] h-[600px]">
          <img
            src="/human_body_outline.png"
            alt="Human Body Outline"
            className={`w-full h-full transition-opacity duration-300 ${selectedOrgan ? 'opacity-70' : 'opacity-100'}`}
          />

          {/* Organ images */}
          {Object.entries(organData).map(([key, organ]) => (
            <img
              key={key}
              src={organ.image}
              alt={organ.name}
              className={`absolute transition-all duration-300 pointer-events-none ${
                selectedOrgan === key ? 'opacity-100 scale-110' :
                selectedOrgan ? 'opacity-0' :
                hoveredOrgan === key ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                top: organ.position.top,
                left: organ.position.left,
                width: organ.position.width,
                zIndex: 10,
              }}
            />
          ))}

          {/* Clickable region markers */}
          {clickableRegions.map((region) => (
            <div
              key={region.id}
              className={`absolute w-6 h-6 cursor-pointer z-20`}
              style={{ top: `${region.y}px`, left: `${region.x}px` }}
              onClick={() => handleRegionClick(region.organ)}
              onMouseEnter={() => handleRegionHover(region.organ)}
              onMouseLeave={() => handleRegionHover(null)}
            >
              <div className={`w-4 h-4 rounded-full transition-all duration-300 hover:scale-125 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2  ${selectedOrgan ? 'opacity-20' : 'opacity-100'} ${
                selectedOrgan === region.organ ? 'bg-red-500 scale-125' :
                hoveredOrgan === region.organ ? 'bg-red-500' : 'bg-blue-500'
              }`} />
              {(hoveredOrgan === region.organ || selectedOrgan === region.organ) && (
                <div className={`absolute whitespace-nowrap text-white text-xs bg-black rounded px-1 py-0.5  ${selectedOrgan ===region.organ ? 'opacity-0' : 'opacity-100'}`} 
                     style={{ top: '-24px', left: '50%', transform: 'translateX(-50%)' }}>
                  {organData[region.organ].name}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right Side: Info Box */}
      <div className="flex-grow flex items-center justify-center">
        {selectedOrgan && (
          <div className="bg-white rounded-lg shadow-lg p-3 text-sm z-30 border border-gray-200 transition-all duration-300 ease-in-out flex flex-col w-[600px] h-[300px] items-center justify-center">
            <h2 className="text-lg font-bold mb-2 text-blue-600">{organData[selectedOrgan].name}</h2>
            <p className="text-xs mb-2 text-gray-700">{organData[selectedOrgan].description}</p>
            <img src={organData[selectedOrgan].image} alt={organData[selectedOrgan].name} className="w-16 h-auto mt-2 mx-auto rounded-md shadow-sm" />
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganApp;
