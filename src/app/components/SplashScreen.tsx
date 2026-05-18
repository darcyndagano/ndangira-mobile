import { useEffect } from "react";
import { useNavigate } from "react-router";

const logo = new URL("../../imports/logo.png", import.meta.url).href;

export function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/home");
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="h-screen flex items-center justify-center bg-[#FAF8F5]">
      <img src={logo} alt="Ndangira" className="w-48 h-48 object-contain animate-pulse" />
    </div>
  );
}
