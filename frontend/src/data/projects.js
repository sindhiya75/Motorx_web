export const projects = [
  {
    id: "fpv-racing-drone",
    name: "FPV Racing Drone",
    slug: "fpv-racing-drone",
    shortDescription: "Build a lightning-fast 5-inch FPV racing quadcopter capable of speeds over 140 km/h.",
    image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80",
    requiredMotors: ["4x FluxMotion 2306 1950KV"],
    requiredComponents: ["5045 Tri-blade Propellers", "60A 4-in-1 ESC", "F7 Flight Controller", "Analog/Digital VTX", "4S/6S 1300mAh LiPo"],
    difficulty: "Intermediate",
    estimatedBuildTime: "4-6 Hours",
    category: "FPV & Racing"
  },
  {
    id: "diy-quadcopter",
    name: "DIY Quadcopter",
    slug: "diy-quadcopter",
    shortDescription: "A beginner-friendly 450mm drone build kit with GPS hold and altitude control.",
    image: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80",
    requiredMotors: ["4x AeroDrive C145 1404 4500KV"],
    requiredComponents: ["F450 Frame Kit", "30A ESC Set", "APM / Pixhawk FC", "1045 Propellers", "3S 2200mAh LiPo Battery"],
    difficulty: "Beginner",
    estimatedBuildTime: "3-5 Hours",
    category: "Kits & Trainers"
  },
  {
    id: "long-range-uav",
    name: "Long Range UAV",
    slug: "long-range-uav",
    shortDescription: "High-efficiency 7-inch endurance drone for aerial photography and mapping missions.",
    image: "https://images.unsplash.com/photo-1506947411487-a56738267384?auto=format&fit=crop&w=800&q=80",
    requiredMotors: ["4x AeroDrive 2806.5 1350KV"],
    requiredComponents: ["7-inch Carbon Frame", "ExpressLRS Receiver", "GPS Module", "7040 Props", "6S 3000mAh Li-Ion Pack"],
    difficulty: "Advanced",
    estimatedBuildTime: "6-8 Hours",
    category: "Industrial & Long Range"
  },
  {
    id: "robotic-arm",
    name: "Robotic Arm",
    slug: "robotic-arm",
    shortDescription: "6-axis precision robotic arm using brushless gimbal motors for smooth motion.",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80",
    requiredMotors: ["6x Gimbal Precision Motors"],
    requiredComponents: ["3D Printed Frame Arms", "SimpleBGC / ODrive Controller", "Encoder Modules", "24V Power Supply"],
    difficulty: "Advanced",
    estimatedBuildTime: "10-12 Hours",
    category: "Robotics & Automation"
  },
  {
    id: "robot-car",
    name: "Robot Car",
    slug: "robot-car",
    shortDescription: "High-torque 4WD rover with obstacle avoidance sensors and remote telemetry.",
    image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
    requiredMotors: ["4x DIY Robotics Brushless Motors"],
    requiredComponents: ["Aluminum Chassis", "Dual Motor Drivers", "Arduino / ESP32", "Ultrasonic Sensors", "12V Li-ion"],
    difficulty: "Beginner",
    estimatedBuildTime: "2-4 Hours",
    category: "UGV & Ground Robots"
  },
  {
    id: "autonomous-vehicle",
    name: "Autonomous Vehicle",
    slug: "autonomous-vehicle",
    shortDescription: "AI-driven self-navigating rover powered by Jetson Nano and high-torque motors.",
    image: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80",
    requiredMotors: ["4x TitanDrive 3520 850KV Long Shaft Motors"],
    requiredComponents: ["NVIDIA Jetson Nano", "RPLIDAR A1", "Stereo Depth Camera", "RoboClaw ESC", "Heavy Duty Chassis"],
    difficulty: "Expert",
    estimatedBuildTime: "15-20 Hours",
    category: "AI & Autonomous Systems"
  }
];

export default projects;
