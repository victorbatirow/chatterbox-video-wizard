
import Navbar from "@/components/Navbar";
import CommunitySection from "@/components/CommunitySection";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import LayeredBackground from "@/components/LayeredBackground";

const Community = () => {
  return (
    <LayeredBackground>
      <div className="flex flex-col min-h-full">
        <Navbar isAuthenticated={true} />
        
        <div className="flex flex-col flex-1">
          <Container>
            <CommunitySection />
          </Container>
        </div>
        
        <Footer />
      </div>
    </LayeredBackground>
  );
};

export default Community;
