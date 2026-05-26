import SimulatorPage from "./simulator";
import Navbar from "@/components/navbar/navbar";

export const metadata = {
  title: "Simulator - ZEUS",
  description: "Experience the power of ZEUS with our interactive simulator.",
};

function Simulator() {
  return (
    <>
      <Navbar />
      <SimulatorPage />
    </>
  );
}

export default Simulator;
