export const projects = [
  {
    id: "fpv-racing-drone",
    name: "FPV Racing Drone",
    slug: "fpv-racing-drone",
    shortDescription: "Build a lightning-fast 5-inch FPV racing quadcopter capable of speeds over 140 km/h.",
    image: "/products/cured_products/Carbon_Fiber_Sheet.jpeg",
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
    image: "/products/pultruded_products/Carbon_Fiber_Rod.jpeg",
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
    image: "/products/tubes/Roll_Wrapped_Carbon_Fiber_Kevlar_Hybrid_Tube.jpeg",
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
    image: "/products/moulds_patterns/Epoxy_Tooling_Board.jpeg",
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
    image: "/products/core_materials/PVC_Foam_Core.jpeg",
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
    image: "/products/cured_products/Sandwich_Panels.jpeg",
    requiredMotors: ["4x TitanDrive 3520 850KV Long Shaft Motors"],
    requiredComponents: ["NVIDIA Jetson Nano", "RPLIDAR A1", "Stereo Depth Camera", "RoboClaw ESC", "Heavy Duty Chassis"],
    difficulty: "Expert",
    estimatedBuildTime: "15-20 Hours",
    category: "AI & Autonomous Systems"
  }
];

export default projects;
