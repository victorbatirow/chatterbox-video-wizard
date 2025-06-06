
import Navbar from "@/components/Navbar";
import CommunitySection from "@/components/CommunitySection";
import Footer from "@/components/Footer";

const Community = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Navbar isAuthenticated={true} />
      <CommunitySection />
      <Footer />
    </div>
  );
};

export default Community;
