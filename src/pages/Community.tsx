
import Navbar from "@/components/Navbar";
import CommunitySection from "@/components/CommunitySection";
import Footer from "@/components/Footer";
import Container from "@/components/Container";

const Community = () => {
  return (
    <div className="flex flex-col min-h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Navbar isAuthenticated={true} />
      
      <div className="flex flex-col flex-1">
        <Container>
          <CommunitySection />
        </Container>
      </div>
      
      <Footer />
    </div>
  );
};

export default Community;
